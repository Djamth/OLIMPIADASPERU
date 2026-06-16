package com.sistema.olimpiadas_peru.programacion.event;

import java.time.LocalDateTime;

public record PartidoProgramadoEvent(
        String emailLocal,
        String emailVisitante,
        String deporte,
        String equipoLocal,
        String equipoVisitante,
        LocalDateTime fechaHora,
        String sede,
        boolean reprogramado) {
}
