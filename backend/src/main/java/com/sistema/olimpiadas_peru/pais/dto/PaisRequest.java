package com.sistema.olimpiadas_peru.pais.dto;

import jakarta.validation.constraints.NotBlank;

public record PaisRequest(
        @NotBlank String nombre,
        @NotBlank String codigo,
        @NotBlank String bandera,
        @NotBlank String colorPrimario,
        @NotBlank String colorSecundario,
        String datoCultural,
        boolean activo) {
}
