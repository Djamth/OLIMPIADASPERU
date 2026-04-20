package com.sistema.olimpiadas_peru.institucion.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record InstitucionRequest(
        @NotBlank(message = "El nombre es obligatorio")
        String nombre,
        @NotBlank(message = "El codigo modular es obligatorio")
        String codigoModular,
        @NotBlank(message = "La region es obligatoria")
        String region,
        @NotBlank(message = "La ciudad es obligatoria")
        String ciudad,
        String direccion,
        String telefono,
        @Email(message = "El email no es valido")
        String email) {
}
