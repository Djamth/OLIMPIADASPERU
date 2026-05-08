package com.sistema.olimpiadas_peru.resultado.dto;

public record ResultadoAnotacionResponse(
        Long participanteId,
        String participanteNombreCompleto,
        Long equipoId,
        String equipoNombre,
        Integer cantidad) {
}
