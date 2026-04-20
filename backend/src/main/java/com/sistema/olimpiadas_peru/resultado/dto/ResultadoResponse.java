package com.sistema.olimpiadas_peru.resultado.dto;

public record ResultadoResponse(
        Long id,
        Long partidoId,
        String deporte,
        String equipoLocal,
        String equipoVisitante,
        Integer puntajeLocal,
        Integer puntajeVisitante,
        String observaciones,
        String goleadores) {
}
