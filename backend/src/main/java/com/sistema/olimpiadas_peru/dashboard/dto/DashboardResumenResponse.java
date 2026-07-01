package com.sistema.olimpiadas_peru.dashboard.dto;

import java.util.List;

public record DashboardResumenResponse(
        List<DashboardMetricResponse> metricas,
        List<DashboardProgressResponse> avanceFuncional,
        List<DashboardUpcomingMatchResponse> proximasContiendas,
        List<DashboardRecentResultResponse> ultimosResultados,
        List<DashboardActivityResponse> actividadReciente,
        List<DashboardSportChartResponse> graficasPorDeporte,
        List<DashboardAlertResponse> alertas,
        List<DashboardCountrySummaryResponse> resumenPorPais) {
}
