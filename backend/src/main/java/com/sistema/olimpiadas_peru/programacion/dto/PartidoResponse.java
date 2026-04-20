package com.sistema.olimpiadas_peru.programacion.dto;

import com.sistema.olimpiadas_peru.common.enums.EstadoPartido;
import java.time.LocalDateTime;

public record PartidoResponse(
        Long id,
        Long grupoId,
        String grupoNombre,
        Long deporteId,
        String deporteNombre,
        Long equipoLocalId,
        String equipoLocalNombre,
        Long equipoVisitanteId,
        String equipoVisitanteNombre,
        LocalDateTime fechaHora,
        String sede,
        EstadoPartido estado) {
}
