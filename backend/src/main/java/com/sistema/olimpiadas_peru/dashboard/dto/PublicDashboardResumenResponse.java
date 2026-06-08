package com.sistema.olimpiadas_peru.dashboard.dto;

import java.util.List;

public record PublicDashboardResumenResponse(
        List<DashboardMetricResponse> metricas,
        List<DashboardUpcomingMatchResponse> proximasContiendas,
        List<DashboardRecentResultResponse> ultimosResultados) {
}
