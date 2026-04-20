package com.sistema.olimpiadas_peru.estadistica.dto;

public record RankingEquipoResponse(
        String equipo,
        int partidosJugados,
        int victorias,
        int empates,
        int derrotas,
        int puntos,
        int tantosFavor,
        int tantosContra) {
}
