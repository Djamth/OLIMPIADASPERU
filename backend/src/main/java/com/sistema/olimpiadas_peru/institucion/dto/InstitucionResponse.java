package com.sistema.olimpiadas_peru.institucion.dto;

public record InstitucionResponse(
        Long id,
        String nombre,
        String codigoModular,
        String region,
        String ciudad,
        String direccion,
        String telefono,
        String email) {
}
