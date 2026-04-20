package com.sistema.olimpiadas_peru.equipo.dto;

import com.sistema.olimpiadas_peru.common.enums.CategoriaEquipo;
import com.sistema.olimpiadas_peru.common.enums.Genero;

public record EquipoResponse(
        Long id,
        String nombre,
        CategoriaEquipo categoria,
        Genero genero,
        String entrenador,
        Long institucionId,
        String institucionNombre) {
}
