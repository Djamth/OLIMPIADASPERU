package com.sistema.olimpiadas_peru.deporte.dto;

public record DeporteResponse(
        Long id,
        String nombre,
        String descripcion,
        Integer maximoEquiposPorGrupo,
        Integer numeroJugadores) {
}
