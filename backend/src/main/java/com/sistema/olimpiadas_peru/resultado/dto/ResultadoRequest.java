package com.sistema.olimpiadas_peru.resultado.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ResultadoRequest(
        @NotNull(message = "El partido es obligatorio")
        Long partidoId,
        @NotNull(message = "El puntaje local es obligatorio")
        @Min(value = 0, message = "El puntaje no puede ser negativo")
        Integer puntajeLocal,
        @NotNull(message = "El puntaje visitante es obligatorio")
        @Min(value = 0, message = "El puntaje no puede ser negativo")
        Integer puntajeVisitante,
        String observaciones,
        @NotBlank(message = "Debe indicar los goleadores o participantes destacados")
        String goleadores) {
}
