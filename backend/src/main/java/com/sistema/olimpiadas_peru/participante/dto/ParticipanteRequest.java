package com.sistema.olimpiadas_peru.participante.dto;

import com.sistema.olimpiadas_peru.common.enums.Genero;
import com.sistema.olimpiadas_peru.common.enums.RolParticipante;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record ParticipanteRequest(
        @NotBlank(message = "Los nombres son obligatorios")
        String nombres,
        @NotBlank(message = "Los apellidos son obligatorios")
        String apellidos,
        @NotBlank(message = "El numero de documento es obligatorio")
        String numeroDocumento,
        @NotNull(message = "El genero es obligatorio")
        Genero genero,
        @NotNull(message = "La fecha de nacimiento es obligatoria")
        LocalDate fechaNacimiento,
        @NotBlank(message = "El codigo del estudiante es obligatorio")
        String codigoEstudiante,
        @NotNull(message = "El equipo es obligatorio")
        Long equipoId,
        RolParticipante rolEquipo,
        Integer numeroCamiseta,
        String fotografiaUrl) {

    public ParticipanteRequest(String nombres, String apellidos, String numeroDocumento, Genero genero,
                               LocalDate fechaNacimiento, String codigoEstudiante, Long equipoId) {
        this(nombres, apellidos, numeroDocumento, genero, fechaNacimiento, codigoEstudiante,
                equipoId, RolParticipante.JUGADOR, null, null);
    }
}
