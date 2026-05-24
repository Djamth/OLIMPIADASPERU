package com.sistema.olimpiadas_peru.dashboard.service;

import com.sistema.olimpiadas_peru.common.enums.EstadoInscripcion;
import com.sistema.olimpiadas_peru.common.enums.EstadoPartido;
import com.sistema.olimpiadas_peru.auth1.model.Auditoria;
import com.sistema.olimpiadas_peru.auth1.repository.AuditoriaRepository;
import com.sistema.olimpiadas_peru.dashboard.dto.DashboardActivityResponse;
import com.sistema.olimpiadas_peru.dashboard.dto.DashboardMetricResponse;
import com.sistema.olimpiadas_peru.dashboard.dto.DashboardProgressResponse;
import com.sistema.olimpiadas_peru.dashboard.dto.DashboardRecentResultResponse;
import com.sistema.olimpiadas_peru.dashboard.dto.DashboardResumenResponse;
import com.sistema.olimpiadas_peru.dashboard.dto.DashboardUpcomingMatchResponse;
import com.sistema.olimpiadas_peru.equipo.repository.EquipoRepository;
import com.sistema.olimpiadas_peru.inscripcion.repository.InscripcionRepository;
import com.sistema.olimpiadas_peru.participante.repository.ParticipanteRepository;
import com.sistema.olimpiadas_peru.programacion.entity.Partido;
import com.sistema.olimpiadas_peru.programacion.repository.PartidoRepository;
import com.sistema.olimpiadas_peru.resultado.entity.Resultado;
import com.sistema.olimpiadas_peru.resultado.repository.ResultadoRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final EquipoRepository equipoRepository;
    private final ParticipanteRepository participanteRepository;
    private final PartidoRepository partidoRepository;
    private final ResultadoRepository resultadoRepository;
    private final InscripcionRepository inscripcionRepository;
    private final AuditoriaRepository auditoriaRepository;

    @Transactional(readOnly = true)
    public DashboardResumenResponse obtenerResumen() {
        long equipos = equipoRepository.count();
        long participantes = participanteRepository.count();
        long partidosProgramados = partidoRepository.countByEstado(EstadoPartido.PROGRAMADO);
        long resultados = resultadoRepository.count();
        long inscripciones = inscripcionRepository.count();
        long inscripcionesConfirmadas = inscripcionRepository.findAll().stream()
                .filter(item -> item.getEstado() == EstadoInscripcion.CONFIRMADA)
                .count();

        List<DashboardMetricResponse> metricas = List.of(
                new DashboardMetricResponse("Equipos activos", String.valueOf(equipos), "Delegaciones registradas", "primary"),
                new DashboardMetricResponse("Participantes", String.valueOf(participantes), "Jugadores inscritos", "success"),
                new DashboardMetricResponse("Partidos programados", String.valueOf(partidosProgramados), "Pendientes de jugar", "warning"),
                new DashboardMetricResponse("Resultados cargados", String.valueOf(resultados), "Ranking actualizado", "danger")
        );

        int avanceInscripciones = porcentaje(inscripcionesConfirmadas, inscripciones);
        int avanceResultados = porcentaje(resultados, Math.max(partidoRepository.count(), 1));

        List<DashboardProgressResponse> avance = List.of(
                new DashboardProgressResponse("Autenticacion y seguridad", 100),
                new DashboardProgressResponse("CRUD principales", 90),
                new DashboardProgressResponse("Inscripciones confirmadas", avanceInscripciones),
                new DashboardProgressResponse("Resultados registrados", avanceResultados)
        );

        List<DashboardUpcomingMatchResponse> proximas = partidoRepository
                .findTop5ByEstadoNotOrderByFechaHoraAsc(EstadoPartido.FINALIZADO)
                .stream()
                .map(this::toUpcoming)
                .toList();

        List<DashboardRecentResultResponse> ultimosResultados = resultadoRepository
                .findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(this::toRecentResult)
                .toList();

        List<DashboardActivityResponse> actividad = auditoriaRepository
                .findTop20ByOrderByFechaDesc()
                .stream()
                .limit(5)
                .map(this::toActivity)
                .toList();

        return new DashboardResumenResponse(metricas, avance, proximas, ultimosResultados, actividad);
    }

    private int porcentaje(long parte, long total) {
        if (total <= 0) {
            return 0;
        }
        return (int) Math.min(100, Math.round((parte * 100.0) / total));
    }

    private DashboardUpcomingMatchResponse toUpcoming(Partido partido) {
        return new DashboardUpcomingMatchResponse(
                partido.getId(),
                partido.getDeporte().getNombre(),
                partido.getEquipoLocal().getNombre() + " vs " + partido.getEquipoVisitante().getNombre(),
                partido.getFechaHora(),
                partido.getSede(),
                partido.getEstado());
    }

    private DashboardRecentResultResponse toRecentResult(Resultado resultado) {
        Partido partido = resultado.getPartido();
        String local = partido.getEquipoLocal().getNombre();
        String visitante = partido.getEquipoVisitante().getNombre();
        String ganador = resultado.getPuntajeLocal().equals(resultado.getPuntajeVisitante())
                ? "Empate"
                : resultado.getPuntajeLocal() > resultado.getPuntajeVisitante() ? local : visitante;

        return new DashboardRecentResultResponse(
                resultado.getId(),
                partido.getDeporte().getNombre(),
                local + " vs " + visitante,
                resultado.getPuntajeLocal(),
                resultado.getPuntajeVisitante(),
                ganador,
                resultado.getObservaciones());
    }

    private DashboardActivityResponse toActivity(Auditoria auditoria) {
        return new DashboardActivityResponse(
                auditoria.getId(),
                auditoria.getUsuario() != null ? auditoria.getUsuario().getNombre() : "Sistema",
                auditoria.getAccion(),
                auditoria.getDescripcion(),
                auditoria.getFecha());
    }
}
