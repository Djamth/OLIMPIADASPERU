package com.sistema.olimpiadas_peru.dashboard.dto;

public record DashboardCountrySummaryResponse(
        String pais,
        String bandera,
        String categoria,
        Long equipos,
        Long participantes,
        Long partidos,
        Long resultados) {
}
