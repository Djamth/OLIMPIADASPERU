package com.sistema.olimpiadas_peru.reporte.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ReporteEjecutivoResponse(
        List<RankingPaisResponse> rankingPaises,
        List<MedalleroResponse> medallero,
        List<ParticipantesInstitucionResponse> participantesPorInstitucion,
        List<FixtureResponse> fixture) {

    public record RankingPaisResponse(
            Long paisId,
            String pais,
            String bandera,
            int puntos,
            int victorias,
            int empates,
            int derrotas,
            int tantosFavor,
            int tantosContra) {
    }

    public record MedalleroResponse(
            Long paisId,
            String pais,
            String bandera,
            int oro,
            int plata,
            int bronce,
            int total) {
    }

    public record ParticipantesInstitucionResponse(
            Long institucionId,
            String institucion,
            long participantes,
            long equipos) {
    }

    public record FixtureResponse(
            Long partidoId,
            String deporte,
            String grupo,
            String equipoLocal,
            String equipoVisitante,
            LocalDateTime fechaHora,
            String sede,
            String estado) {
    }
}
