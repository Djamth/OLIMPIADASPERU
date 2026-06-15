package com.sistema.olimpiadas_peru.participante.dto;

import com.sistema.olimpiadas_peru.common.enums.Genero;
import com.sistema.olimpiadas_peru.common.enums.RolParticipante;
import java.time.LocalDate;

public record ParticipanteResponse(
        Long id,
        String nombres,
        String apellidos,
        String numeroDocumento,
        Genero genero,
        LocalDate fechaNacimiento,
        String codigoEstudiante,
        Long equipoId,
        String equipoNombre,
        Long institucionId,
        String institucionNombre,
        RolParticipante rolEquipo,
        Integer numeroCamiseta,
        String fotografiaUrl,
        Long categoriaEventoId,
        String categoriaEventoNombre,
        String paisNombre,
        String bandera,
        Long deporteId,
        String deporteNombre) {
}
