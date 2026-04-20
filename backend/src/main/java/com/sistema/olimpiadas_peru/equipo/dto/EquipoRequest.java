package com.sistema.olimpiadas_peru.equipo.dto;

import com.sistema.olimpiadas_peru.common.enums.CategoriaEquipo;
import com.sistema.olimpiadas_peru.common.enums.Genero;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record EquipoRequest(
        @NotBlank(message = "El nombre es obligatorio")
        String nombre,
        @NotNull(message = "La categoria es obligatoria")
        CategoriaEquipo categoria,
        @NotNull(message = "El genero es obligatorio")
        Genero genero,
        @NotBlank(message = "El entrenador es obligatorio")
        String entrenador,
        @NotNull(message = "La institucion es obligatoria")
        Long institucionId) {
}
