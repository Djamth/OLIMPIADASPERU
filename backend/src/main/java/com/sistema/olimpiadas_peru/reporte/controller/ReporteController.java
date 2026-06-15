package com.sistema.olimpiadas_peru.reporte.controller;

import com.sistema.olimpiadas_peru.reporte.dto.ReporteArchivo;
import com.sistema.olimpiadas_peru.reporte.service.ReporteEstadisticaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
@PreAuthorize("@rolSecurityService.tieneModulo(authentication, 'estadisticas')")
public class ReporteController {

    private final ReporteEstadisticaService reporteEstadisticaService;

    @GetMapping("/estadisticas/{deporteId}/pdf")
    public ResponseEntity<byte[]> descargarPdf(@PathVariable Long deporteId) {
        return fileResponse(reporteEstadisticaService.generarPdf(deporteId));
    }

    @GetMapping("/estadisticas/{deporteId}/excel")
    public ResponseEntity<byte[]> descargarExcel(@PathVariable Long deporteId) {
        return fileResponse(reporteEstadisticaService.generarExcel(deporteId));
    }

    private ResponseEntity<byte[]> fileResponse(ReporteArchivo reporte) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(reporte.contentType()));
        headers.setContentDisposition(ContentDisposition.attachment()
            .filename(reporte.nombreArchivo())
            .build());
        headers.setContentLength(reporte.contenido().length);
        return ResponseEntity.ok().headers(headers).body(reporte.contenido());
    }
}
