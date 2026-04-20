package com.sistema.olimpiadas_peru.sorteo.dto;

import java.util.List;

public record GrupoResponse(
        Long id,
        String nombre,
        Long deporteId,
        String deporteNombre,
        List<GrupoEquipoResponse> equipos) {
}
