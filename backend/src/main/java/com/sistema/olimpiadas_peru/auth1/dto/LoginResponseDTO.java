package com.sistema.olimpiadas_peru.auth1.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponseDTO {
    private Integer id;
    private String nombre;
    private String email;
    private Integer rolId;
    private String rolNombre;
    private String estado;
    private List<ModuloDTO> modulos;
    private String accessToken;
    private String refreshToken;
    private Long expiresIn;
    private String tokenType;
}
