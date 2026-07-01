package com.sistema.olimpiadas_peru.auth1.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuloPermisoDTO {
    private Integer moduloId;
    private Boolean puedeVer;
    private Boolean puedeCrear;
    private Boolean puedeEditar;
    private Boolean puedeEliminar;
    private Boolean puedeExportar;
}
