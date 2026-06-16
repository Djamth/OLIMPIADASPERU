package com.sistema.olimpiadas_peru.reporte.controller;

import com.sistema.olimpiadas_peru.reporte.dto.ReportePaisResponse;
import com.sistema.olimpiadas_peru.reporte.dto.ReporteEjecutivoResponse;
import com.sistema.olimpiadas_peru.reporte.service.ReportePaisService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reportes/eventos")
@RequiredArgsConstructor
@PreAuthorize("@rolSecurityService.tieneModulo(authentication, 'estadisticas')")
public class ReportePaisController {

    private final ReportePaisService service;

    @GetMapping("/{eventoId}/paises")
    public List<ReportePaisResponse> porPaises(@PathVariable Long eventoId) {
        return service.generar(eventoId);
    }

    @GetMapping("/{eventoId}/ejecutivo")
    public ReporteEjecutivoResponse ejecutivo(@PathVariable Long eventoId) {
        return service.generarEjecutivo(eventoId);
    }
}
