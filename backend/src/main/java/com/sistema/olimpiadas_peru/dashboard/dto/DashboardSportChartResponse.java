package com.sistema.olimpiadas_peru.dashboard.dto;

public record DashboardSportChartResponse(
        String deporte,
        Long equipos,
        Long participantes,
        Long partidos,
        Long resultados) {
}
