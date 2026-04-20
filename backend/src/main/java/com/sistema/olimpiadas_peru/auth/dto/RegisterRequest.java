package com.sistema.olimpiadas_peru.auth.dto;

import com.sistema.olimpiadas_peru.auth.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.Set;

public record RegisterRequest(
        @NotBlank(message = "El nombre es obligatorio")
        String nombreCompleto,
        @NotBlank(message = "El usuario es obligatorio")
        String username,
        @Email(message = "El email no es valido")
        @NotBlank(message = "El email es obligatorio")
        String email,
        @NotBlank(message = "La contrasena es obligatoria")
        String password,
        @NotEmpty(message = "Debe registrar al menos un rol")
        Set<Role> roles) {
}
