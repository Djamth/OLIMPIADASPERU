package com.sistema.olimpiadas_peru.dashboard.dto;

public record DashboardAlertResponse(
        String tipo,
        String titulo,
        String detalle,
        String severidad,
        String referencia) {
}
