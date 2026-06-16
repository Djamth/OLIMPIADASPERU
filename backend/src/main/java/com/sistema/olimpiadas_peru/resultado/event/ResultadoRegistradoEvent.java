package com.sistema.olimpiadas_peru.resultado.event;

public record ResultadoRegistradoEvent(
        String emailLocal,
        String emailVisitante,
        String deporte,
        String equipoLocal,
        String equipoVisitante,
        Integer puntajeLocal,
        Integer puntajeVisitante) {
}
