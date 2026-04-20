package com.sistema.olimpiadas_peru.estadistica.service;

import com.sistema.olimpiadas_peru.estadistica.dto.GoleadorResponse;
import com.sistema.olimpiadas_peru.estadistica.dto.RankingEquipoResponse;
import com.sistema.olimpiadas_peru.resultado.entity.Resultado;
import com.sistema.olimpiadas_peru.resultado.repository.ResultadoRepository;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EstadisticaService {

    private final ResultadoRepository resultadoRepository;

    public List<GoleadorResponse> obtenerGoleadores(Long deporteId) {
        Map<String, Integer> acumulado = new HashMap<>();
        for (Resultado resultado : resultadoRepository.findByPartidoDeporteId(deporteId)) {
            String[] goleadores = resultado.getGoleadores().split(",");
            for (String goleador : goleadores) {
                String limpio = goleador.trim();
                if (!limpio.isBlank()) {
                    acumulado.merge(limpio, 1, Integer::sum);
                }
            }
        }
        return acumulado.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .map(entry -> new GoleadorResponse(entry.getKey(), entry.getValue()))
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
}
