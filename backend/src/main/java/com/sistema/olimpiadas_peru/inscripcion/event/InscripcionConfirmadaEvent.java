package com.sistema.olimpiadas_peru.inscripcion.event;

public record InscripcionConfirmadaEvent(
    String destinatario,
    String institucion,
    String equipo,
    String deporte
) {
}
