package com.sistema.olimpiadas_peru.auth1.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioDTO {
    private Integer id;
    private String nombre;
    private String email;
    private Integer rolId;
    private String estado;
}
