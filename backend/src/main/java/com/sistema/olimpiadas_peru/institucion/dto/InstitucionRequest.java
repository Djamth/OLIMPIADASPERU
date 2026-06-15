package com.sistema.olimpiadas_peru.institucion.dto;

import com.sistema.olimpiadas_peru.common.enums.TipoInstitucion;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record InstitucionRequest(
        @NotBlank(message = "El nombre es obligatorio")
        String nombre,
        @NotBlank(message = "El codigo modular es obligatorio")
        String codigoModular,
        String ruc,
        TipoInstitucion tipo,
        String nivelEducativo,
        @NotBlank(message = "La region es obligatoria")
        String region,
        @NotBlank(message = "La ciudad es obligatoria")
        String ciudad,
        String direccion,
        String telefono,
        @Email(message = "El email no es valido")
        String email,
        String administradorNombre,
        @Email(message = "El email del administrador no es valido")
        String administradorEmail) {

    public InstitucionRequest(String nombre, String codigoModular, String region, String ciudad,
                              String direccion, String telefono, String email) {
        this(nombre, codigoModular, null, TipoInstitucion.COLEGIO, null, region, ciudad,
                direccion, telefono, email, null, null);
    }
}
