package com.sistema.olimpiadas_peru.sorteo.dto;

public record GrupoEquipoResponse(
        Long equipoId,
        String equipoNombre,
        Integer posicion,
        String paisNombre,
        String bandera,
        String colorPrimario,
        String colorSecundario) {
}
