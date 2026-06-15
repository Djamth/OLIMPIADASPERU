package com.sistema.olimpiadas_peru.participante.dto;

import com.sistema.olimpiadas_peru.common.enums.RolParticipante;

public record PlantillaEquipoResponse(
        Long id,
        Long participanteId,
        String participanteNombre,
        Long equipoId,
        String equipoNombre,
        Long deporteId,
        String deporteNombre,
        Long categoriaEventoId,
        String categoriaEventoNombre,
        String paisNombre,
        RolParticipante rol,
        Integer numeroCamiseta) {
}
