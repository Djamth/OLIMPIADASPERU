package com.sistema.olimpiadas_peru.dashboard.dto;

public record DashboardMetricResponse(
        String title,
        String value,
        String change,
        String tone) {
}
