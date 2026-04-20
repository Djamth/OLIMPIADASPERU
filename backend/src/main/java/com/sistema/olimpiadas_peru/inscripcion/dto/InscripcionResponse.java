package com.sistema.olimpiadas_peru.inscripcion.dto;

import com.sistema.olimpiadas_peru.common.enums.EstadoInscripcion;
import java.time.LocalDate;

public record InscripcionResponse(
        Long id,
        Long equipoId,
        String equipoNombre,
        Long deporteId,
        String deporteNombre,
        EstadoInscripcion estado,
        LocalDate fechaInscripcion) {
}
