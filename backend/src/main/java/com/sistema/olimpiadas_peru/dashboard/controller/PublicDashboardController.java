package com.sistema.olimpiadas_peru.dashboard.controller;

import com.sistema.olimpiadas_peru.dashboard.dto.DashboardResumenResponse;
import com.sistema.olimpiadas_peru.dashboard.dto.PublicDashboardResumenResponse;
import com.sistema.olimpiadas_peru.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PublicDashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/resumen")
    public ResponseEntity<PublicDashboardResumenResponse> obtenerResumenPublico() {
        DashboardResumenResponse resumen = dashboardService.obtenerResumen();
        return ResponseEntity.ok(new PublicDashboardResumenResponse(
                resumen.metricas(),
                resumen.proximasContiendas(),
                resumen.ultimosResultados()
        ));
    }
}
