package com.sistema.olimpiadas_peru.auth1.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RolDTO {
    private Integer id;
    private String nombre;
    private String estado;
}
