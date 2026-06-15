package com.sistema.olimpiadas_peru.institucion.dto;

import com.sistema.olimpiadas_peru.common.enums.TipoInstitucion;

public record InstitucionResponse(
        Long id,
        String nombre,
        String codigoModular,
        String ruc,
        TipoInstitucion tipo,
        String nivelEducativo,
        String region,
        String ciudad,
        String direccion,
        String telefono,
        String email,
        String administradorNombre,
        String administradorEmail) {
}
