package com.sistema.olimpiadas_peru.notificacion.dto;

import java.util.List;

public record NotificacionResumenResponse(
    long noLeidas,
    List<NotificacionResponse> items
) {
}
