package com.sistema.olimpiadas_peru.participante.dto;

import com.sistema.olimpiadas_peru.common.enums.RolParticipante;
import jakarta.validation.constraints.NotNull;

public record PlantillaEquipoRequest(
        @NotNull Long participanteId,
        @NotNull Long equipoId,
        RolParticipante rol,
        Integer numeroCamiseta) {
}
