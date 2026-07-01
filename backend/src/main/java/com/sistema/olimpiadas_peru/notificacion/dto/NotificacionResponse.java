package com.sistema.olimpiadas_peru.notificacion.dto;

import java.time.LocalDateTime;

public record NotificacionResponse(
    Long id,
    String tipo,
    String titulo,
    String mensaje,
    String referencia,
    boolean leido,
    LocalDateTime creadoEn
) {
}
