package com.sistema.olimpiadas_peru.evento.dto;

import com.sistema.olimpiadas_peru.common.enums.EstadoEvento;
import java.time.LocalDate;

public record EventoResponse(
        Long id,
        String nombre,
        Integer anio,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        EstadoEvento estado,
        Long institucionId,
        String institucionNombre) {
}
