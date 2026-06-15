package com.sistema.olimpiadas_peru.reporte.service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.sistema.olimpiadas_peru.deporte.entity.Deporte;
import com.sistema.olimpiadas_peru.deporte.service.DeporteService;
import com.sistema.olimpiadas_peru.estadistica.dto.GoleadorResponse;
import com.sistema.olimpiadas_peru.estadistica.dto.RankingEquipoResponse;
import com.sistema.olimpiadas_peru.estadistica.service.EstadisticaService;
import com.sistema.olimpiadas_peru.reporte.dto.ReporteArchivo;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReporteEstadisticaService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final Color NAVY = new Color(12, 37, 73);
    private static final Color BLUE = new Color(21, 101, 192);
    private static final Color LIGHT_BLUE = new Color(234, 243, 255);
    private static final Color SLATE = new Color(71, 85, 105);
    private static final Color LIGHT_SLATE = new Color(241, 245, 249);
    private static final Color BORDER = new Color(220, 228, 239);
    private static final Color GOLD = new Color(245, 183, 52);
    private static final Color SILVER = new Color(190, 200, 214);
    private static final Color BRONZE = new Color(196, 132, 86);

    private final DeporteService deporteService;
    private final EstadisticaService estadisticaService;

    public ReporteArchivo generarPdf(Long deporteId) {
        ReportData data = loadData(deporteId);
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate(), 36, 36, 40, 42);
            PdfWriter writer = PdfWriter.getInstance(document, output);
            writer.setPageEvent(new ReportPageEvent(data.deporte.getNombre()));
            document.open();

            document.add(buildReportHeader(data));
            document.add(spacer(10));
            document.add(buildSummary(data));
            document.add(spacer(14));
            document.add(buildSectionHeader(
                "Clasificacion por equipos",
                "Rendimiento acumulado de los equipos con resultados registrados."
            ));
            document.add(spacer(6));
            document.add(buildRankingTable(data.ranking));
            document.add(spacer(14));
            document.add(buildSectionHeader(
                "Rendimiento individual",
                "Participantes destacados segun las anotaciones cargadas en cada encuentro."
            ));
            document.add(spacer(6));
            document.add(buildIndividualTable(data.individuales));
            document.close();

            return new ReporteArchivo(
                output.toByteArray(),
                fileName(data.deporte.getNombre(), "pdf"),
                "application/pdf"
            );
        } catch (DocumentException | IOException exception) {
            throw new IllegalStateException("No se pudo generar el reporte PDF", exception);
        }
    }

    private PdfPTable buildReportHeader(ReportData data) {
        PdfPTable header = new PdfPTable(new float[]{3.2f, 1.3f});
        header.setWidthPercentage(100);

        PdfPCell brand = new PdfPCell();
        brand.setBorder(Rectangle.NO_BORDER);
        brand.setBackgroundColor(NAVY);
        brand.setPadding(18);
        Paragraph eyebrow = new Paragraph(
            "SISTEMA DE GESTION DEPORTIVA",
            FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, LIGHT_BLUE)
        );
        eyebrow.setSpacingAfter(5);
        brand.addElement(eyebrow);
        brand.addElement(new Paragraph(
            "OLIMPIADAS PERU",
            FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, Color.WHITE)
        ));
        Paragraph reportName = new Paragraph(
            "Reporte oficial de estadisticas",
            FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(203, 219, 239))
        );
        reportName.setSpacingBefore(3);
        brand.addElement(reportName);

        PdfPCell details = new PdfPCell();
        details.setBorder(Rectangle.NO_BORDER);
        details.setBackgroundColor(BLUE);
        details.setPadding(18);
        details.addElement(label("DISCIPLINA"));
        details.addElement(value(data.deporte.getNombre()));
        Paragraph generatedLabel = label("GENERADO");
        generatedLabel.setSpacingBefore(10);
        details.addElement(generatedLabel);
        details.addElement(value(DATE_FORMAT.format(LocalDateTime.now())));

        header.addCell(brand);
        header.addCell(details);
        return header;
    }

    private PdfPTable buildSummary(ReportData data) {
        int partidos = data.ranking.stream()
            .mapToInt(RankingEquipoResponse::partidosJugados)
            .sum() / 2;
        int anotaciones = data.individuales.stream()
            .mapToInt(GoleadorResponse::anotaciones)
            .sum();
        String lider = data.ranking.isEmpty() ? "Sin datos" : data.ranking.getFirst().equipo();
        String destacado = data.individuales.isEmpty() ? "Sin datos" : data.individuales.getFirst().nombre();

        PdfPTable cards = new PdfPTable(4);
        cards.setWidthPercentage(100);
        cards.setSpacingBefore(2);
        addSummaryCard(cards, "EQUIPOS", String.valueOf(data.ranking.size()), "con clasificacion");
        addSummaryCard(cards, "PARTIDOS", String.valueOf(partidos), "finalizados");
        addSummaryCard(cards, "LIDER", lider, "tabla general");
        addSummaryCard(cards, "DESTACADO", destacado, anotaciones + " anotaciones totales");
        return cards;
    }

    private void addSummaryCard(PdfPTable cards, String title, String value, String detail) {
        PdfPCell card = new PdfPCell();
        card.setBorderColor(BORDER);
        card.setBorderWidth(0.8f);
        card.setBackgroundColor(Color.WHITE);
        card.setPadding(11);
        card.addElement(new Paragraph(
            title,
            FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7, BLUE)
        ));
        Paragraph mainValue = new Paragraph(
            value,
            FontFactory.getFont(FontFactory.HELVETICA_BOLD, value.length() > 18 ? 10 : 15, NAVY)
        );
        mainValue.setSpacingBefore(3);
        card.addElement(mainValue);
        card.addElement(new Paragraph(
            detail,
            FontFactory.getFont(FontFactory.HELVETICA, 7, SLATE)
        ));
        cards.addCell(card);
    }

    private PdfPTable buildSectionHeader(String title, String description) {
        PdfPTable section = new PdfPTable(new float[]{0.05f, 0.95f});
        section.setWidthPercentage(100);

        PdfPCell accent = new PdfPCell();
        accent.setBorder(Rectangle.NO_BORDER);
        accent.setBackgroundColor(BLUE);
        section.addCell(accent);

        PdfPCell content = new PdfPCell();
        content.setBorder(Rectangle.NO_BORDER);
        content.setPaddingLeft(10);
        content.addElement(new Paragraph(
            title,
            FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, NAVY)
        ));
        content.addElement(new Paragraph(
            description,
            FontFactory.getFont(FontFactory.HELVETICA, 8, SLATE)
        ));
        section.addCell(content);
        return section;
    }

    public ReporteArchivo generarExcel(Long deporteId) {
        ReportData data = loadData(deporteId);
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            CellStyle headerStyle = createHeaderStyle(workbook);
            createRankingSheet(workbook, data.ranking, headerStyle);
            createIndividualSheet(workbook, data.individuales, headerStyle);
            workbook.write(output);

            return new ReporteArchivo(
                output.toByteArray(),
                fileName(data.deporte.getNombre(), "xlsx"),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo generar el reporte Excel", exception);
        }
    }

    private ReportData loadData(Long deporteId) {
        Deporte deporte = deporteService.getEntity(deporteId);
        return new ReportData(
            deporte,
            estadisticaService.obtenerRanking(deporteId),
            estadisticaService.obtenerGoleadores(deporteId)
        );
    }

    private PdfPTable buildRankingTable(List<RankingEquipoResponse> ranking) {
        String[] headers = {"Pos.", "Equipo", "PJ", "V", "E", "D", "Pts", "Favor", "Contra", "Dif."};
        PdfPTable table = new PdfPTable(new float[]{0.7f, 3f, 0.7f, 0.7f, 0.7f, 0.7f, 0.8f, 0.9f, 0.9f, 0.9f});
        table.setWidthPercentage(100);
        table.setHeaderRows(1);
        addPdfHeaders(table, headers);

        for (int index = 0; index < ranking.size(); index++) {
            RankingEquipoResponse item = ranking.get(index);
            Color rowColor = index % 2 == 0 ? Color.WHITE : LIGHT_SLATE;
            addPositionCell(table, index + 1, rowColor);
            addPdfCell(table, item.equipo(), rowColor, Element.ALIGN_LEFT, true);
            addPdfCell(table, item.partidosJugados(), rowColor);
            addPdfCell(table, item.victorias(), rowColor);
            addPdfCell(table, item.empates(), rowColor);
            addPdfCell(table, item.derrotas(), rowColor);
            addPdfCell(table, item.puntos(), rowColor, Element.ALIGN_CENTER, true);
            addPdfCell(table, item.tantosFavor(), rowColor);
            addPdfCell(table, item.tantosContra(), rowColor);
            addPdfCell(table, item.tantosFavor() - item.tantosContra(), rowColor);
        }
        addEmptyState(table, ranking.isEmpty(), 10, "Aun no existen resultados para generar la clasificacion.");
        return table;
    }

    private PdfPTable buildIndividualTable(List<GoleadorResponse> individuales) {
        PdfPTable table = new PdfPTable(new float[]{0.8f, 3f, 2.5f, 2f, 1.2f});
        table.setWidthPercentage(100);
        table.setHeaderRows(1);
        addPdfHeaders(table, new String[]{"Pos.", "Participante", "Equipo", "Indicador", "Cantidad"});
        for (int index = 0; index < individuales.size(); index++) {
            GoleadorResponse item = individuales.get(index);
            Color rowColor = index % 2 == 0 ? Color.WHITE : LIGHT_SLATE;
            addPositionCell(table, index + 1, rowColor);
            addPdfCell(table, item.nombre(), rowColor, Element.ALIGN_LEFT, true);
            addPdfCell(table, item.equipo(), rowColor, Element.ALIGN_LEFT, false);
            addPdfCell(table, item.indicador(), rowColor, Element.ALIGN_LEFT, false);
            addPdfCell(table, item.anotaciones(), rowColor, Element.ALIGN_CENTER, true);
        }
        addEmptyState(table, individuales.isEmpty(), 5, "No se registraron estadisticas individuales.");
        return table;
    }

    private void addPdfHeaders(PdfPTable table, String[] headers) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.WHITE);
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, font));
            cell.setBackgroundColor(NAVY);
            cell.setBorderColor(NAVY);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            cell.setPadding(8);
            table.addCell(cell);
        }
    }

    private void addPositionCell(PdfPTable table, int position, Color background) {
        Color badge = position == 1 ? GOLD : position == 2 ? SILVER : position == 3 ? BRONZE : background;
        PdfPCell cell = createPdfCell(String.valueOf(position), badge, Element.ALIGN_CENTER, true);
        if (position <= 3) {
            cell.setBorderColor(Color.WHITE);
        }
        table.addCell(cell);
    }

    private void addPdfCell(PdfPTable table, int value, Color background) {
        addPdfCell(table, String.valueOf(value), background, Element.ALIGN_CENTER, false);
    }

    private void addPdfCell(PdfPTable table, int value, Color background, int alignment, boolean bold) {
        addPdfCell(table, String.valueOf(value), background, alignment, bold);
    }

    private void addPdfCell(PdfPTable table, String value, Color background, int alignment, boolean bold) {
        table.addCell(createPdfCell(value, background, alignment, bold));
    }

    private PdfPCell createPdfCell(String value, Color background, int alignment, boolean bold) {
        Font font = FontFactory.getFont(
            bold ? FontFactory.HELVETICA_BOLD : FontFactory.HELVETICA,
            8,
            NAVY
        );
        PdfPCell cell = new PdfPCell(new Phrase(value, font));
        cell.setBackgroundColor(background);
        cell.setBorderColor(BORDER);
        cell.setBorderWidth(0.5f);
        cell.setHorizontalAlignment(alignment);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(7);
        return cell;
    }

    private void addEmptyState(PdfPTable table, boolean empty, int columns, String message) {
        if (!empty) {
            return;
        }
        PdfPCell cell = createPdfCell(message, LIGHT_SLATE, Element.ALIGN_CENTER, false);
        cell.setColspan(columns);
        cell.setPadding(14);
        table.addCell(cell);
    }

    private Paragraph label(String text) {
        return new Paragraph(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7, LIGHT_BLUE));
    }

    private Paragraph value(String text) {
        return new Paragraph(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.WHITE));
    }

    private Paragraph spacer(float spacing) {
        Paragraph paragraph = new Paragraph(" ");
        paragraph.setLeading(spacing);
        return paragraph;
    }

    private void createRankingSheet(
        Workbook workbook,
        List<RankingEquipoResponse> ranking,
        CellStyle headerStyle) {

        Sheet sheet = workbook.createSheet("Ranking equipos");
        String[] headers = {"Posicion", "Equipo", "PJ", "Victorias", "Empates", "Derrotas", "Puntos", "Favor", "Contra", "Diferencia"};
        createExcelHeader(sheet, headers, headerStyle);
        for (int index = 0; index < ranking.size(); index++) {
            RankingEquipoResponse item = ranking.get(index);
            Row row = sheet.createRow(index + 1);
            setCell(row, 0, index + 1);
            setCell(row, 1, item.equipo());
            setCell(row, 2, item.partidosJugados());
            setCell(row, 3, item.victorias());
            setCell(row, 4, item.empates());
            setCell(row, 5, item.derrotas());
            setCell(row, 6, item.puntos());
            setCell(row, 7, item.tantosFavor());
            setCell(row, 8, item.tantosContra());
            setCell(row, 9, item.tantosFavor() - item.tantosContra());
        }
        autoSize(sheet, headers.length);
    }

    private void createIndividualSheet(
        Workbook workbook,
        List<GoleadorResponse> individuales,
        CellStyle headerStyle) {

        Sheet sheet = workbook.createSheet("Estadisticas individuales");
        String[] headers = {"Posicion", "Participante", "Equipo", "Deporte", "Indicador", "Cantidad"};
        createExcelHeader(sheet, headers, headerStyle);
        for (int index = 0; index < individuales.size(); index++) {
            GoleadorResponse item = individuales.get(index);
            Row row = sheet.createRow(index + 1);
            setCell(row, 0, index + 1);
            setCell(row, 1, item.nombre());
            setCell(row, 2, item.equipo());
            setCell(row, 3, item.deporte());
            setCell(row, 4, item.indicador());
            setCell(row, 5, item.anotaciones());
        }
        autoSize(sheet, headers.length);
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        org.apache.poi.ss.usermodel.Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        return style;
    }

    private void createExcelHeader(Sheet sheet, String[] headers, CellStyle style) {
        Row row = sheet.createRow(0);
        for (int index = 0; index < headers.length; index++) {
            Cell cell = row.createCell(index);
            cell.setCellValue(headers[index]);
            cell.setCellStyle(style);
        }
        sheet.createFreezePane(0, 1);
    }

    private void setCell(Row row, int column, String value) {
        row.createCell(column).setCellValue(value);
    }

    private void setCell(Row row, int column, int value) {
        row.createCell(column).setCellValue(value);
    }

    private void autoSize(Sheet sheet, int columns) {
        for (int index = 0; index < columns; index++) {
            sheet.autoSizeColumn(index);
        }
    }

    private String fileName(String deporte, String extension) {
        String safeName = deporte.toLowerCase(Locale.ROOT)
            .replaceAll("[^a-z0-9]+", "-")
            .replaceAll("(^-|-$)", "");
        return "estadisticas-" + safeName + "." + extension;
    }

    private record ReportData(
        Deporte deporte,
        List<RankingEquipoResponse> ranking,
        List<GoleadorResponse> individuales
    ) {
    }

    private static class ReportPageEvent extends PdfPageEventHelper {

        private final String deporte;

        private ReportPageEvent(String deporte) {
            this.deporte = deporte;
        }

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte canvas = writer.getDirectContent();
            Rectangle page = document.getPageSize();
            float y = 24;

            canvas.setColorStroke(BORDER);
            canvas.setLineWidth(0.6f);
            canvas.moveTo(document.leftMargin(), y + 8);
            canvas.lineTo(page.getWidth() - document.rightMargin(), y + 8);
            canvas.stroke();

            try {
                BaseFont font = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.WINANSI, false);
                canvas.beginText();
                canvas.setFontAndSize(font, 7);
                canvas.setColorFill(SLATE);
                canvas.showTextAligned(
                    Element.ALIGN_LEFT,
                    "Olimpiadas Peru | " + deporte,
                    document.leftMargin(),
                    y,
                    0
                );
                canvas.showTextAligned(
                    Element.ALIGN_RIGHT,
                    "Pagina " + writer.getPageNumber(),
                    page.getWidth() - document.rightMargin(),
                    y,
                    0
                );
                canvas.endText();
            } catch (DocumentException | IOException exception) {
                throw new IllegalStateException("No se pudo renderizar el pie del reporte", exception);
            }
        }
    }
}
