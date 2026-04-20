package com.sistema.olimpiadas_peru.inscripcion.dto;

import com.sistema.olimpiadas_peru.common.enums.EstadoInscripcion;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record InscripcionRequest(
        @NotNull(message = "El equipo es obligatorio")
        Long equipoId,
        @NotNull(message = "El deporte es obligatorio")
        Long deporteId,
        @NotNull(message = "El estado es obligatorio")
        EstadoInscripcion estado,
        @NotNull(message = "La fecha de inscripcion es obligatoria")
        LocalDate fechaInscripcion) {
}
