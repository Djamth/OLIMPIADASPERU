package com.sistema.olimpiadas_peru.estadistica.dto;

public record GoleadorResponse(
        Long participanteId,
        String nombre,
        Long equipoId,
        String equipo,
        String deporte,
        String indicador,
        int anotaciones) {
}
