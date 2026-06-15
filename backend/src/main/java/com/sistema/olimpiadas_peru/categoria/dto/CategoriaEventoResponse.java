package com.sistema.olimpiadas_peru.categoria.dto;

public record CategoriaEventoResponse(
        Long id,
        String nombre,
        String nivel,
        String descripcion,
        Long eventoId,
        String eventoNombre,
        Long institucionId,
        String institucionNombre,
        Long paisId,
        String paisNombre,
        String paisCodigo,
        String bandera,
        String colorPrimario,
        String colorSecundario) {
}
