package com.sistema.olimpiadas_peru.reporte.service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
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
    private static final Color BLUE = new Color(21, 101, 192);

    private final DeporteService deporteService;
    private final EstadisticaService estadisticaService;

    public ReporteArchivo generarPdf(Long deporteId) {
        ReportData data = loadData(deporteId);
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate(), 32, 32, 32, 32);
            PdfWriter.getInstance(document, output);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, BLUE);
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.DARK_GRAY);
            document.add(new Paragraph("Olimpiadas Peru - Reporte de estadisticas", titleFont));
            document.add(new Paragraph(
                "Deporte: " + data.deporte.getNombre() + " | Generado: " + DATE_FORMAT.format(LocalDateTime.now()),
                subtitleFont
            ));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Ranking por equipos", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
            document.add(buildRankingTable(data.ranking));
            document.add(new Paragraph(" "));
            document.add(new Paragraph(
                "Estadisticas individuales",
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)
            ));
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
        addPdfHeaders(table, headers);

        for (int index = 0; index < ranking.size(); index++) {
            RankingEquipoResponse item = ranking.get(index);
            addPdfRow(table,
                String.valueOf(index + 1),
                item.equipo(),
                String.valueOf(item.partidosJugados()),
                String.valueOf(item.victorias()),
                String.valueOf(item.empates()),
                String.valueOf(item.derrotas()),
                String.valueOf(item.puntos()),
                String.valueOf(item.tantosFavor()),
                String.valueOf(item.tantosContra()),
                String.valueOf(item.tantosFavor() - item.tantosContra())
            );
        }
        return table;
    }

    private PdfPTable buildIndividualTable(List<GoleadorResponse> individuales) {
        PdfPTable table = new PdfPTable(new float[]{0.8f, 3f, 2.5f, 2f, 1.2f});
        table.setWidthPercentage(100);
        addPdfHeaders(table, new String[]{"Pos.", "Participante", "Equipo", "Indicador", "Cantidad"});
        for (int index = 0; index < individuales.size(); index++) {
            GoleadorResponse item = individuales.get(index);
            addPdfRow(table,
                String.valueOf(index + 1),
                item.nombre(),
                item.equipo(),
                item.indicador(),
                String.valueOf(item.anotaciones())
            );
        }
        return table;
    }

    private void addPdfHeaders(PdfPTable table, String[] headers) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.WHITE);
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, font));
            cell.setBackgroundColor(BLUE);
            cell.setPadding(6);
            table.addCell(cell);
        }
    }

    private void addPdfRow(PdfPTable table, String... values) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.DARK_GRAY);
        for (String value : values) {
            PdfPCell cell = new PdfPCell(new Phrase(value, font));
            cell.setPadding(5);
            table.addCell(cell);
        }
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
}
