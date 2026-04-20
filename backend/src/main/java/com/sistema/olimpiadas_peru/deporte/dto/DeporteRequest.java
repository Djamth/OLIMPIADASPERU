package com.sistema.olimpiadas_peru.deporte.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DeporteRequest(
        @NotBlank(message = "El nombre es obligatorio")
        String nombre,
        String descripcion,
        @NotNull(message = "El maximo de equipos por grupo es obligatorio")
        @Min(value = 2, message = "Debe ser al menos 2")
        Integer maximoEquiposPorGrupo,
        @NotNull(message = "El numero de jugadores es obligatorio")
        @Min(value = 1, message = "Debe ser al menos 1")
        Integer numeroJugadores) {
}
