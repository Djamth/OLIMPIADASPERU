package com.sistema.olimpiadas_peru.reporte.service;

import com.sistema.olimpiadas_peru.categoria.entity.CategoriaEvento;
import com.sistema.olimpiadas_peru.categoria.repository.CategoriaEventoRepository;
import com.sistema.olimpiadas_peru.common.enums.EstadoPartido;
import com.sistema.olimpiadas_peru.equipo.entity.Equipo;
import com.sistema.olimpiadas_peru.equipo.repository.EquipoRepository;
import com.sistema.olimpiadas_peru.participante.repository.ParticipanteRepository;
import com.sistema.olimpiadas_peru.participante.repository.PlantillaEquipoRepository;
import com.sistema.olimpiadas_peru.programacion.entity.Partido;
import com.sistema.olimpiadas_peru.programacion.repository.PartidoRepository;
import com.sistema.olimpiadas_peru.reporte.dto.ReporteEjecutivoResponse;
import com.sistema.olimpiadas_peru.reporte.dto.ReportePaisResponse;
import com.sistema.olimpiadas_peru.evento.service.EventoService;
import com.sistema.olimpiadas_peru.resultado.entity.Resultado;
import com.sistema.olimpiadas_peru.resultado.repository.ResultadoRepository;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportePaisService {

    private final CategoriaEventoRepository categoriaRepository;
    private final EquipoRepository equipoRepository;
    private final PlantillaEquipoRepository plantillaRepository;
    private final ParticipanteRepository participanteRepository;
    private final ResultadoRepository resultadoRepository;
    private final PartidoRepository partidoRepository;
    private final EventoService eventoService;

    public List<ReportePaisResponse> generar(Long eventoId) {
        eventoService.getEntity(eventoId);
        return categoriaRepository.findByEventoIdOrderByNombreAsc(eventoId).stream()
                .map(this::toResponse)
                .toList();
    }

    public ReporteEjecutivoResponse generarEjecutivo(Long eventoId) {
        eventoService.getEntity(eventoId);
        List<Resultado> resultados = resultadoRepository.findAll().stream()
                .filter(resultado -> perteneceAlEvento(resultado.getPartido(), eventoId))
                .toList();
        List<Partido> partidos = partidoRepository.findAll().stream()
                .filter(partido -> perteneceAlEvento(partido, eventoId))
                .sorted(Comparator.comparing(Partido::getFechaHora))
                .toList();

        List<ReporteEjecutivoResponse.RankingPaisResponse> ranking = rankingPorPais(resultados);
        return new ReporteEjecutivoResponse(
                ranking,
                medalleroPorPais(resultados),
                participantesPorInstitucion(eventoId),
                partidos.stream().map(this::toFixture).toList());
    }

    private ReportePaisResponse toResponse(CategoriaEvento categoria) {
        var equipos = equipoRepository.findByCategoriaEventoIdOrderByDeporteNombreAsc(categoria.getId()).stream()
                .map(equipo -> new ReportePaisResponse.EquipoPaisResponse(
                        equipo.getId(),
                        equipo.getNombre(),
                        equipo.getDeporte() == null ? "Sin deporte" : equipo.getDeporte().getNombre(),
                        plantillaRepository.findByEquipoIdOrderByParticipanteApellidosAscParticipanteNombresAsc(
                                        equipo.getId()).stream()
                                .map(plantilla -> new ReportePaisResponse.ParticipantePaisResponse(
                                        plantilla.getParticipante().getId(),
                                        plantilla.getParticipante().getNombres() + " "
                                                + plantilla.getParticipante().getApellidos(),
                                        plantilla.getParticipante().getNumeroDocumento(),
                                        plantilla.getRol().name(),
                                        plantilla.getNumeroCamiseta()))
                                .toList()))
                .toList();
        return new ReportePaisResponse(
                categoria.getPais().getId(),
                categoria.getPais().getNombre(),
                categoria.getPais().getBandera(),
                categoria.getNombre(),
                categoria.getEvento().getInstitucion().getNombre(),
                equipos);
    }

    private List<ReporteEjecutivoResponse.RankingPaisResponse> rankingPorPais(List<Resultado> resultados) {
        Map<Long, PaisStats> stats = new HashMap<>();
        for (Resultado resultado : resultados) {
            Partido partido = resultado.getPartido();
            CategoriaEvento local = partido.getEquipoLocal().getCategoriaEvento();
            CategoriaEvento visitante = partido.getEquipoVisitante().getCategoriaEvento();
            if (local == null || visitante == null) {
                continue;
            }
            PaisStats localStats = stats.computeIfAbsent(local.getPais().getId(), id -> PaisStats.of(local));
            PaisStats visitanteStats = stats.computeIfAbsent(visitante.getPais().getId(), id -> PaisStats.of(visitante));
            localStats.tantosFavor += resultado.getPuntajeLocal();
            localStats.tantosContra += resultado.getPuntajeVisitante();
            visitanteStats.tantosFavor += resultado.getPuntajeVisitante();
            visitanteStats.tantosContra += resultado.getPuntajeLocal();
            if (resultado.getPuntajeLocal() > resultado.getPuntajeVisitante()) {
                localStats.victorias++;
                localStats.puntos += 3;
                visitanteStats.derrotas++;
            } else if (resultado.getPuntajeLocal() < resultado.getPuntajeVisitante()) {
                visitanteStats.victorias++;
                visitanteStats.puntos += 3;
                localStats.derrotas++;
            } else {
                localStats.empates++;
                visitanteStats.empates++;
                localStats.puntos++;
                visitanteStats.puntos++;
            }
        }
        return stats.values().stream()
                .sorted(Comparator.comparingInt(PaisStats::puntos).reversed()
                        .thenComparing(Comparator.comparingInt(PaisStats::diferencia).reversed())
                        .thenComparing(PaisStats::pais))
                .map(PaisStats::toRanking)
                .toList();
    }

    private List<ReporteEjecutivoResponse.MedalleroResponse> medalleroPorPais(List<Resultado> resultados) {
        Map<String, List<PaisStats>> rankingPorDeporte = new HashMap<>();
        for (ReporteEjecutivoResponse.RankingPaisResponse ranking : rankingPorPais(resultados)) {
            rankingPorDeporte.computeIfAbsent("GENERAL", key -> new ArrayList<>())
                    .add(PaisStats.fromRanking(ranking));
        }
        Map<Long, MedalStats> medals = new HashMap<>();
        rankingPorDeporte.values().forEach(items -> {
            for (int index = 0; index < Math.min(3, items.size()); index++) {
                PaisStats pais = items.get(index);
                MedalStats medal = medals.computeIfAbsent(pais.paisId, id -> new MedalStats(pais.paisId, pais.pais, pais.bandera));
                if (index == 0) medal.oro++;
                if (index == 1) medal.plata++;
                if (index == 2) medal.bronce++;
            }
        });
        return medals.values().stream()
                .sorted(Comparator.comparingInt(MedalStats::total).reversed()
                        .thenComparing(Comparator.comparingInt(MedalStats::oro).reversed())
                        .thenComparing(MedalStats::pais))
                .map(MedalStats::toResponse)
                .toList();
    }

    private List<ReporteEjecutivoResponse.ParticipantesInstitucionResponse> participantesPorInstitucion(Long eventoId) {
        return equipoRepository.findAll().stream()
                .filter(equipo -> equipo.getCategoriaEvento() != null
                        && eventoId.equals(equipo.getCategoriaEvento().getEvento().getId()))
                .collect(java.util.stream.Collectors.groupingBy(Equipo::getInstitucion))
                .entrySet().stream()
                .map(entry -> new ReporteEjecutivoResponse.ParticipantesInstitucionResponse(
                        entry.getKey().getId(),
                        entry.getKey().getNombre(),
                        entry.getValue().stream().mapToLong(equipo -> participanteRepository.countByEquipoId(equipo.getId())).sum(),
                        entry.getValue().size()))
                .sorted(Comparator.comparingLong(ReporteEjecutivoResponse.ParticipantesInstitucionResponse::participantes).reversed())
                .toList();
    }

    private ReporteEjecutivoResponse.FixtureResponse toFixture(Partido partido) {
        return new ReporteEjecutivoResponse.FixtureResponse(
                partido.getId(),
                partido.getDeporte().getNombre(),
                partido.getGrupo() == null ? "Sin grupo" : partido.getGrupo().getNombre(),
                partido.getEquipoLocal().getNombre(),
                partido.getEquipoVisitante().getNombre(),
                partido.getFechaHora(),
                partido.getSede(),
                partido.getEstado().name());
    }

    private boolean perteneceAlEvento(Partido partido, Long eventoId) {
        return partido.getEquipoLocal().getCategoriaEvento() != null
                && eventoId.equals(partido.getEquipoLocal().getCategoriaEvento().getEvento().getId())
                && partido.getEstado() != EstadoPartido.REPROGRAMADO;
    }

    private static class PaisStats {
        private final Long paisId;
        private final String pais;
        private final String bandera;
        private int puntos;
        private int victorias;
        private int empates;
        private int derrotas;
        private int tantosFavor;
        private int tantosContra;

        private PaisStats(Long paisId, String pais, String bandera) {
            this.paisId = paisId;
            this.pais = pais;
            this.bandera = bandera;
        }

        private static PaisStats of(CategoriaEvento categoria) {
            return new PaisStats(categoria.getPais().getId(), categoria.getPais().getNombre(), categoria.getPais().getBandera());
        }

        private static PaisStats fromRanking(ReporteEjecutivoResponse.RankingPaisResponse ranking) {
            PaisStats stats = new PaisStats(ranking.paisId(), ranking.pais(), ranking.bandera());
            stats.puntos = ranking.puntos();
            stats.victorias = ranking.victorias();
            stats.empates = ranking.empates();
            stats.derrotas = ranking.derrotas();
            stats.tantosFavor = ranking.tantosFavor();
            stats.tantosContra = ranking.tantosContra();
            return stats;
        }

        private int puntos() {
            return puntos;
        }

        private int diferencia() {
            return tantosFavor - tantosContra;
        }

        private String pais() {
            return pais;
        }

        private ReporteEjecutivoResponse.RankingPaisResponse toRanking() {
            return new ReporteEjecutivoResponse.RankingPaisResponse(
                    paisId, pais, bandera, puntos, victorias, empates, derrotas, tantosFavor, tantosContra);
        }
    }

    private static class MedalStats {
        private final Long paisId;
        private final String pais;
        private final String bandera;
        private int oro;
        private int plata;
        private int bronce;

        private MedalStats(Long paisId, String pais, String bandera) {
            this.paisId = paisId;
            this.pais = pais;
            this.bandera = bandera;
        }

        private int total() {
            return oro + plata + bronce;
        }

        private int oro() {
            return oro;
        }

        private String pais() {
            return pais;
        }

        private ReporteEjecutivoResponse.MedalleroResponse toResponse() {
            return new ReporteEjecutivoResponse.MedalleroResponse(paisId, pais, bandera, oro, plata, bronce, total());
        }
    }
}
