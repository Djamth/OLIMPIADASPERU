package com.sistema.olimpiadas_peru.dashboard.dto;

import java.time.LocalDateTime;

public record DashboardActivityResponse(
        Integer id,
        String usuario,
        String accion,
        String descripcion,
        LocalDateTime fecha) {
}
