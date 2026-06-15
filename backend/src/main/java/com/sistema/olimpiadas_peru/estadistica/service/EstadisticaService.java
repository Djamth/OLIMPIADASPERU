package com.sistema.olimpiadas_peru.estadistica.service;

import com.sistema.olimpiadas_peru.estadistica.dto.GoleadorResponse;
import com.sistema.olimpiadas_peru.estadistica.dto.RankingEquipoResponse;
import com.sistema.olimpiadas_peru.participante.entity.Participante;
import com.sistema.olimpiadas_peru.resultado.entity.ResultadoAnotacion;
import com.sistema.olimpiadas_peru.resultado.repository.ResultadoAnotacionRepository;
import com.sistema.olimpiadas_peru.resultado.entity.Resultado;
import com.sistema.olimpiadas_peru.resultado.repository.ResultadoRepository;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EstadisticaService {

    private final ResultadoRepository resultadoRepository;
    private final ResultadoAnotacionRepository resultadoAnotacionRepository;

    public List<GoleadorResponse> obtenerGoleadores(Long deporteId) {
        Map<Long, AnotadorBuilder> acumulado = new HashMap<>();
        for (Resultado resultado : resultadoRepository.findByPartidoDeporteId(deporteId)) {
            String deporte = resultado.getPartido().getDeporte().getNombre();
            String indicador = obtenerIndicadorIndividual(deporte);
            for (ResultadoAnotacion anotacion : resultadoAnotacionRepository.findByResultadoId(resultado.getId())) {
                Participante participante = anotacion.getParticipante();
                acumulado
                        .computeIfAbsent(participante.getId(), key -> new AnotadorBuilder(participante, deporte, indicador))
                        .cantidad += anotacion.getCantidad();
            }
        }
        return acumulado.values().stream()
                .sorted(Comparator.comparingInt(AnotadorBuilder::getCantidad).reversed()
                        .thenComparing(AnotadorBuilder::getNombre))
                .map(AnotadorBuilder::toResponse)
                .toList();
    }

    public List<RankingEquipoResponse> obtenerRanking(Long deporteId) {
        Map<String, RankingBuilder> tabla = new HashMap<>();

        for (Resultado resultado : resultadoRepository.findByPartidoDeporteId(deporteId)) {
            String local = resultado.getPartido().getEquipoLocal().getNombre();
            String visitante = resultado.getPartido().getEquipoVisitante().getNombre();

            RankingBuilder localStats = tabla.computeIfAbsent(local, key -> new RankingBuilder(local));
            RankingBuilder visitaStats = tabla.computeIfAbsent(visitante, key -> new RankingBuilder(visitante));

            localStats.partidosJugados++;
            visitaStats.partidosJugados++;
            localStats.tantosFavor += resultado.getPuntajeLocal();
            localStats.tantosContra += resultado.getPuntajeVisitante();
            visitaStats.tantosFavor += resultado.getPuntajeVisitante();
            visitaStats.tantosContra += resultado.getPuntajeLocal();

            if (resultado.getPuntajeLocal() > resultado.getPuntajeVisitante()) {
                localStats.victorias++;
                localStats.puntos += 3;
                visitaStats.derrotas++;
            } else if (resultado.getPuntajeLocal() < resultado.getPuntajeVisitante()) {
                visitaStats.victorias++;
                visitaStats.puntos += 3;
                localStats.derrotas++;
            } else {
                localStats.empates++;
                visitaStats.empates++;
                localStats.puntos++;
                visitaStats.puntos++;
            }
        }

        List<RankingEquipoResponse> ranking = new ArrayList<>();
        tabla.values().stream()
                .sorted(Comparator.comparingInt(RankingBuilder::getPuntos)
                        .thenComparingInt(RankingBuilder::getDiferencia)
                        .reversed())
                .forEach(item -> ranking.add(item.toResponse()));
        return ranking;
    }

    private static class RankingBuilder {
        private final String equipo;
        private int partidosJugados;
        private int victorias;
        private int empates;
        private int derrotas;
        private int puntos;
        private int tantosFavor;
        private int tantosContra;

        private RankingBuilder(String equipo) {
            this.equipo = equipo;
        }

        private int getPuntos() {
            return puntos;
        }

        private int getDiferencia() {
            return tantosFavor - tantosContra;
        }

        private RankingEquipoResponse toResponse() {
            return new RankingEquipoResponse(
                    equipo,
                    partidosJugados,
                    victorias,
                    empates,
                    derrotas,
                    puntos,
                    tantosFavor,
                    tantosContra);
        }
    }

    private static class AnotadorBuilder {
        private final Long participanteId;
        private final String nombre;
        private final Long equipoId;
        private final String equipo;
        private final String deporte;
        private final String indicador;
        private int cantidad;

        private AnotadorBuilder(Participante participante, String deporte, String indicador) {
            this.participanteId = participante.getId();
            this.nombre = participante.getNombres() + " " + participante.getApellidos();
            this.equipoId = participante.getEquipo().getId();
            this.equipo = participante.getEquipo().getNombre();
            this.deporte = deporte;
            this.indicador = indicador;
        }

        private int getCantidad() {
            return cantidad;
        }

        private String getNombre() {
            return nombre;
        }

        private GoleadorResponse toResponse() {
            return new GoleadorResponse(participanteId, nombre, equipoId, equipo, deporte, indicador, cantidad);
        }
    }

    private String obtenerIndicadorIndividual(String deporte) {
        String normalizado = deporte == null ? "" : deporte.trim().toUpperCase(Locale.ROOT);
        if (normalizado.contains("FUTBOL") || normalizado.contains("FUTSAL")) {
            return "Goles";
        }
        if (normalizado.contains("BASQUET")) {
            return "Puntos anotados";
        }
        if (normalizado.contains("VOLEY")) {
            return "Sets ganados";
        }
        if (normalizado.contains("PING")) {
            return "Puntos/Sets";
        }
        return "Anotaciones";
    }
}
