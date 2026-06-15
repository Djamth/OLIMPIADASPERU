package com.sistema.olimpiadas_peru.evento.dto;

import com.sistema.olimpiadas_peru.common.enums.EstadoEvento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public record EventoRequest(
        @NotBlank String nombre,
        @NotNull @Positive Integer anio,
        @NotNull LocalDate fechaInicio,
        @NotNull LocalDate fechaFin,
        @NotNull EstadoEvento estado,
        @NotNull Long institucionId) {
}
