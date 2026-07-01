package com.sistema.olimpiadas_peru.auth1.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CambiarPasswordDTO {

    @NotBlank(message = "La contraseña actual es obligatoria")
    private String passwordActual;

    @NotBlank(message = "La nueva contraseña es obligatoria")
    @Size(min = 6, max = 80, message = "La nueva contraseña debe tener entre 6 y 80 caracteres")
    private String nuevaPassword;
}
