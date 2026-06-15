package com.sistema.olimpiadas_peru.reporte.dto;

import java.util.List;

public record ReportePaisResponse(
        Long paisId,
        String pais,
        String bandera,
        String categoria,
        String institucion,
        List<EquipoPaisResponse> equipos) {

    public record EquipoPaisResponse(
            Long equipoId,
            String equipo,
            String deporte,
            List<ParticipantePaisResponse> participantes) {
    }

    public record ParticipantePaisResponse(
            Long participanteId,
            String nombreCompleto,
            String documento,
            String rol,
            Integer numeroCamiseta) {
    }
}
