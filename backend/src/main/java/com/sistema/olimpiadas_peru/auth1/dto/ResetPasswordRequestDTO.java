package com.sistema.olimpiadas_peru.auth1.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResetPasswordRequestDTO {
    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no tiene un formato valido")
    private String email;

    @NotBlank(message = "El codigo es obligatorio")
    @Pattern(regexp = "\\d{6}", message = "El codigo debe contener 6 digitos")
    private String codigo;

    @NotBlank(message = "La nueva contrasena es obligatoria")
    @Size(min = 8, max = 72, message = "La contrasena debe tener entre 8 y 72 caracteres")
    private String nuevaPassword;
}
