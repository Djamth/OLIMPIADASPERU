package com.sistema.olimpiadas_peru.categoria.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CategoriaEventoRequest(
        @NotBlank String nombre,
        String nivel,
        String descripcion,
        @NotNull Long eventoId,
        Long paisId) {
}
