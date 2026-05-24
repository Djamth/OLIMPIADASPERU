package com.sistema.olimpiadas_peru.dashboard.dto;

public record DashboardRecentResultResponse(
        Long id,
        String deporte,
        String encuentro,
        Integer puntajeLocal,
        Integer puntajeVisitante,
        String ganador,
        String observaciones) {
}
