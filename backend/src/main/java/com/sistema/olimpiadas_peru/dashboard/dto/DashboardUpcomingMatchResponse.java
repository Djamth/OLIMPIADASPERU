package com.sistema.olimpiadas_peru.dashboard.dto;

import com.sistema.olimpiadas_peru.common.enums.EstadoPartido;
import java.time.LocalDateTime;

public record DashboardUpcomingMatchResponse(
        Long id,
        String deporte,
        String encuentro,
        LocalDateTime fechaHora,
        String sede,
        EstadoPartido estado) {
}
