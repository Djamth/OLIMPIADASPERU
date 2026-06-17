package com.sistema.olimpiadas_peru.reporte.service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.sistema.olimpiadas_peru.evento.service.EventoService;
import com.sistema.olimpiadas_peru.reporte.dto.ReporteArchivo;
import com.sistema.olimpiadas_peru.reporte.dto.ReporteEjecutivoResponse;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
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
public class ReporteEjecutivoArchivoService {

    private static final Color NAVY = new Color(12, 37, 73);
    private static final Color BLUE = new Color(21, 101, 192);
    private static final Color LIGHT = new Color(241, 245, 249);
    private static final Color BORDER = new Color(220, 228, 239);
    private static final DateTimeFormatter DATE_TIME = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final EventoService eventoService;
    private final ReportePaisService reportePaisService;

    public ReporteArchivo generarPdf(Long eventoId) {
        var evento = eventoService.getEntity(eventoId);
        ReporteEjecutivoResponse reporte = reportePaisService.generarEjecutivo(eventoId);

        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate(), 36, 36, 38, 38);
            PdfWriter.getInstance(document, output);
            document.open();

            document.add(header(evento.getNombre(), evento.getInstitucion().getNombre()));
            document.add(spacer(10));
            document.add(section("Ranking por país"));
            document.add(table(
                    new String[]{"Pos.", "País", "Pts", "V", "E", "D", "Favor", "Contra"},
                    reporte.rankingPaises().stream()
                            .map(item -> List.of(
                                    String.valueOf(reporte.rankingPaises().indexOf(item) + 1),
                                    item.pais(),
                                    String.valueOf(item.puntos()),
                                    String.valueOf(item.victorias()),
                                    String.valueOf(item.empates()),
                                    String.valueOf(item.derrotas()),
                                    String.valueOf(item.tantosFavor()),
                                    String.valueOf(item.tantosContra())))
                            .toList()));
            document.add(spacer(10));
            document.add(section("Medallero"));
            document.add(table(
                    new String[]{"País", "Oro", "Plata", "Bronce", "Total"},
                    reporte.medallero().stream()
                            .map(item -> List.of(item.pais(), String.valueOf(item.oro()), String.valueOf(item.plata()),
                                    String.valueOf(item.bronce()), String.valueOf(item.total())))
                            .toList()));
            document.add(spacer(10));
            document.add(section("Participantes por institución"));
            document.add(table(
                    new String[]{"Institución", "Equipos", "Participantes"},
                    reporte.participantesPorInstitucion().stream()
                            .map(item -> List.of(item.institucion(), String.valueOf(item.equipos()), String.valueOf(item.participantes())))
                            .toList()));
            document.add(spacer(10));
            document.add(section("Fixture completo"));
            document.add(table(
                    new String[]{"Deporte", "Grupo", "Encuentro", "Fecha", "Sede", "Estado"},
                    reporte.fixture().stream()
                            .map(item -> List.of(
                                    item.deporte(),
                                    item.grupo(),
                                    item.equipoLocal() + " vs " + item.equipoVisitante(),
                                    item.fechaHora().format(DATE_TIME),
                                    item.sede(),
                                    item.estado()))
                            .toList()));

            document.close();
            return new ReporteArchivo(output.toByteArray(), fileName(evento.getNombre(), "pdf"), "application/pdf");
        } catch (DocumentException | IOException exception) {
            throw new IllegalStateException("No se pudo generar el reporte ejecutivo PDF", exception);
        }
    }

    public ReporteArchivo generarExcel(Long eventoId) {
        var evento = eventoService.getEntity(eventoId);
        ReporteEjecutivoResponse reporte = reportePaisService.generarEjecutivo(eventoId);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            CellStyle header = headerStyle(workbook);
            createSheet(workbook, "Ranking paises", new String[]{"Pais", "Puntos", "Victorias", "Empates", "Derrotas", "Favor", "Contra"},
                    reporte.rankingPaises().stream()
                            .map(item -> List.of(item.pais(), item.puntos(), item.victorias(), item.empates(), item.derrotas(), item.tantosFavor(), item.tantosContra()))
                            .toList(), header);
            createSheet(workbook, "Medallero", new String[]{"Pais", "Oro", "Plata", "Bronce", "Total"},
                    reporte.medallero().stream()
                            .map(item -> List.of(item.pais(), item.oro(), item.plata(), item.bronce(), item.total()))
                            .toList(), header);
            createSheet(workbook, "Participantes", new String[]{"Institucion", "Equipos", "Participantes"},
                    reporte.participantesPorInstitucion().stream()
                            .map(item -> List.of(item.institucion(), item.equipos(), item.participantes()))
                            .toList(), header);
            createSheet(workbook, "Fixture", new String[]{"Deporte", "Grupo", "Local", "Visitante", "Fecha", "Sede", "Estado"},
                    reporte.fixture().stream()
                            .map(item -> List.of(item.deporte(), item.grupo(), item.equipoLocal(), item.equipoVisitante(),
                                    item.fechaHora().format(DATE_TIME), item.sede(), item.estado()))
                            .toList(), header);

            workbook.write(output);
            return new ReporteArchivo(
                    output.toByteArray(),
                    fileName(evento.getNombre(), "xlsx"),
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo generar el reporte ejecutivo Excel", exception);
        }
    }

    private PdfPTable header(String evento, String institucion) {
        PdfPTable table = new PdfPTable(new float[]{3f, 1.2f});
        table.setWidthPercentage(100);
        PdfPCell brand = cell("OLIMPIADAS PERÚ\nReporte ejecutivo del evento", NAVY, Color.WHITE, true);
        brand.setPadding(16);
        PdfPCell details = cell(evento + "\n" + institucion, BLUE, Color.WHITE, true);
        details.setPadding(16);
        table.addCell(brand);
        table.addCell(details);
        return table;
    }

    private Paragraph section(String title) {
        Paragraph paragraph = new Paragraph(title, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, NAVY));
        paragraph.setSpacingAfter(6);
        return paragraph;
    }

    private PdfPTable table(String[] headers, List<List<String>> rows) {
        PdfPTable table = new PdfPTable(headers.length);
        table.setWidthPercentage(100);
        table.setHeaderRows(1);
        for (String header : headers) {
            PdfPCell cell = cell(header, NAVY, Color.WHITE, true);
            cell.setPadding(7);
            table.addCell(cell);
        }
        if (rows.isEmpty()) {
            PdfPCell empty = cell("Sin datos registrados", LIGHT, NAVY, false);
            empty.setColspan(headers.length);
            empty.setPadding(12);
            table.addCell(empty);
            return table;
        }
        for (int rowIndex = 0; rowIndex < rows.size(); rowIndex++) {
            Color background = rowIndex % 2 == 0 ? Color.WHITE : LIGHT;
            for (String value : rows.get(rowIndex)) {
                PdfPCell cell = cell(value, background, NAVY, false);
                cell.setPadding(6);
                table.addCell(cell);
            }
        }
        return table;
    }

    private PdfPCell cell(String text, Color background, Color textColor, boolean bold) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(
                bold ? FontFactory.HELVETICA_BOLD : FontFactory.HELVETICA,
                8,
                textColor)));
        cell.setBackgroundColor(background);
        cell.setBorderColor(BORDER);
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        return cell;
    }

    private Paragraph spacer(float size) {
        Paragraph paragraph = new Paragraph(" ");
        paragraph.setLeading(size);
        return paragraph;
    }

    private void createSheet(Workbook workbook, String name, String[] headers, List<? extends List<?>> rows, CellStyle headerStyle) {
        Sheet sheet = workbook.createSheet(name);
        Row headerRow = sheet.createRow(0);
        for (int index = 0; index < headers.length; index++) {
            Cell cell = headerRow.createCell(index);
            cell.setCellValue(headers[index]);
            cell.setCellStyle(headerStyle);
        }
        for (int rowIndex = 0; rowIndex < rows.size(); rowIndex++) {
            Row row = sheet.createRow(rowIndex + 1);
            List<?> values = rows.get(rowIndex);
            for (int column = 0; column < values.size(); column++) {
                Object value = values.get(column);
                if (value instanceof Number number) {
                    row.createCell(column).setCellValue(number.doubleValue());
                } else {
                    row.createCell(column).setCellValue(String.valueOf(value));
                }
            }
        }
        sheet.createFreezePane(0, 1);
        for (int index = 0; index < headers.length; index++) {
            sheet.autoSizeColumn(index);
        }
    }

    private CellStyle headerStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        org.apache.poi.ss.usermodel.Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        return style;
    }

    private String fileName(String evento, String extension) {
        String safeName = evento.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        return "reporte-ejecutivo-" + safeName + "." + extension;
    }
}
