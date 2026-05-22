package com.sistema.olimpiadas_peru.dashboard.dto;

import java.util.List;

public record DashboardResumenResponse(
        List<DashboardMetricResponse> metricas,
        List<DashboardProgressResponse> avanceFuncional,
        List<DashboardUpcomingMatchResponse> proximasContiendas) {
}
