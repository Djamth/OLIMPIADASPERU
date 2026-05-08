package com.sistema.olimpiadas_peru.resultado.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ResultadoAnotacionRequest(
        @NotNull(message = "El participante es obligatorio")
        Long participanteId,
        @NotNull(message = "La cantidad es obligatoria")
        @Min(value = 1, message = "La cantidad debe ser al menos 1")
        Integer cantidad) {
}
