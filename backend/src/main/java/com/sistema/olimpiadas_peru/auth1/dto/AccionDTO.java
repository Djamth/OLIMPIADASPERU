package com.sistema.olimpiadas_peru.auth1.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccionDTO {
    private Integer id;
    private String codigo;
    private String nombre;
    private Long permisosAsignados;
}
