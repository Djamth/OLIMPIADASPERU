package com.sistema.olimpiadas_peru.programacion.dto;

import com.sistema.olimpiadas_peru.common.enums.EstadoPartido;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record PartidoRequest(
        Long grupoId,
        @NotNull(message = "El deporte es obligatorio")
        Long deporteId,
        @NotNull(message = "El equipo local es obligatorio")
        Long equipoLocalId,
        @NotNull(message = "El equipo visitante es obligatorio")
        Long equipoVisitanteId,
        @NotNull(message = "La fecha y hora son obligatorias")
        @Future(message = "La fecha del partido debe ser futura")
        LocalDateTime fechaHora,
        @NotBlank(message = "La sede es obligatoria")
        String sede,
        @NotNull(message = "El estado es obligatorio")
        EstadoPartido estado) {
}
