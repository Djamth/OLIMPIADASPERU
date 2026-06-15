package com.sistema.olimpiadas_peru.pais.dto;

public record PaisResponse(
        Long id,
        String nombre,
        String codigo,
        String bandera,
        String colorPrimario,
        String colorSecundario,
        String datoCultural,
        boolean activo) {
}
