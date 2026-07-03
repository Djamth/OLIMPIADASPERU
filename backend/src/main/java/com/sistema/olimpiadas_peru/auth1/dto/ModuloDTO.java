package com.sistema.olimpiadas_peru.auth1.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuloDTO {
    private Integer id;
    private String nombre;
    private String ruta;
    private String icono;
    private Integer moduloPadreId;
    private String moduloPadreNombre;
    private java.util.List<String> acciones;
    private Boolean puedeVer;
    private Boolean puedeCrear;
    private Boolean puedeEditar;
    private Boolean puedeEliminar;
    private Boolean puedeExportar;
}
