package com.sistema.olimpiadas_peru.auth1.dto;

import java.time.LocalDateTime;

public record AuditoriaDTO(
    Integer id,
    Integer usuarioId,
    String usuarioNombre,
    String usuarioEmail,
    String accion,
    String descripcion,
    LocalDateTime fecha
) {
}
