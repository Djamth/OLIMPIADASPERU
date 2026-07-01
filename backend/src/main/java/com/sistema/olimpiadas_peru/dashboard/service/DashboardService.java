package com.sistema.olimpiadas_peru.dashboard.service;

import com.sistema.olimpiadas_peru.common.enums.EstadoInscripcion;
import com.sistema.olimpiadas_peru.common.enums.EstadoPartido;
import com.sistema.olimpiadas_peru.auth1.model.Auditoria;
import com.sistema.olimpiadas_peru.auth1.repository.AuditoriaRepository;
import com.sistema.olimpiadas_peru.auth1.security.InstitucionAccessService;
import com.sistema.olimpiadas_peru.dashboard.dto.DashboardActivityResponse;
import com.sistema.olimpiadas_peru.dashboard.dto.DashboardAlertResponse;
import com.sistema.olimpiadas_peru.dashboard.dto.DashboardCountrySummaryResponse;
import com.sistema.olimpiadas_peru.dashboard.dto.DashboardMetricResponse;
import com.sistema.olimpiadas_peru.dashboard.dto.DashboardProgressResponse;
import com.sistema.olimpiadas_peru.dashboard.dto.DashboardRecentResultResponse;
import com.sistema.olimpiadas_peru.dashboard.dto.DashboardResumenResponse;
import com.sistema.olimpiadas_peru.dashboard.dto.DashboardSportChartResponse;
import com.sistema.olimpiadas_peru.dashboard.dto.DashboardUpcomingMatchResponse;
import com.sistema.olimpiadas_peru.equipo.entity.Equipo;
import com.sistema.olimpiadas_peru.equipo.repository.EquipoRepository;
import com.sistema.olimpiadas_peru.inscripcion.entity.Inscripcion;
import com.sistema.olimpiadas_peru.inscripcion.repository.InscripcionRepository;
import com.sistema.olimpiadas_peru.participante.entity.Participante;
import com.sistema.olimpiadas_peru.participante.repository.ParticipanteRepository;
import com.sistema.olimpiadas_peru.programacion.entity.Partido;
import com.sistema.olimpiadas_peru.programacion.repository.PartidoRepository;
import com.sistema.olimpiadas_peru.resultado.entity.Resultado;
import com.sistema.olimpiadas_peru.resultado.repository.ResultadoRepository;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
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
    private final InstitucionAccessService accessService;

    @Transactional(readOnly = true)
    public DashboardResumenResponse obtenerResumen() {
        return construirResumen(accessService.institucionActual());
    }

    @Transactional(readOnly = true)
    public DashboardResumenResponse obtenerResumenPublico() {
        return construirResumen(Optional.empty());
    }

    private DashboardResumenResponse construirResumen(Optional<Long> institucionId) {
        var equiposAlcance = equipoRepository.findAll().stream()
                .filter(item -> pertenece(item.getInstitucion().getId(), institucionId))
                .toList();
        var participantesAlcance = participanteRepository.findAll().stream()
                .filter(item -> pertenece(item.getEquipo().getInstitucion().getId(), institucionId))
                .toList();
        var partidosAlcance = partidoRepository.findAll().stream()
                .filter(item -> pertenece(item.getEquipoLocal().getInstitucion().getId(), institucionId))
                .toList();
        var resultadosAlcance = resultadoRepository.findAll().stream()
                .filter(item -> pertenece(
                        item.getPartido().getEquipoLocal().getInstitucion().getId(), institucionId))
                .toList();
        var inscripcionesAlcance = inscripcionRepository.findAll().stream()
                .filter(item -> pertenece(item.getEquipo().getInstitucion().getId(), institucionId))
                .toList();

        long equipos = equiposAlcance.size();
        long participantes = participantesAlcance.size();
        long partidosProgramados = partidosAlcance.stream()
                .filter(item -> item.getEstado() == EstadoPartido.PROGRAMADO)
                .count();
        long resultados = resultadosAlcance.size();
        long inscripciones = inscripcionesAlcance.size();
        long inscripcionesConfirmadas = inscripcionesAlcance.stream()
                .filter(item -> item.getEstado() == EstadoInscripcion.CONFIRMADA)
                .count();

        List<DashboardMetricResponse> metricas = List.of(
                new DashboardMetricResponse("Equipos activos", String.valueOf(equipos), "Delegaciones registradas", "primary"),
                new DashboardMetricResponse("Participantes", String.valueOf(participantes), "Jugadores inscritos", "success"),
                new DashboardMetricResponse("Partidos programados", String.valueOf(partidosProgramados), "Pendientes de jugar", "warning"),
                new DashboardMetricResponse("Resultados cargados", String.valueOf(resultados), "Ranking actualizado", "danger")
        );

        int avanceInscripciones = porcentaje(inscripcionesConfirmadas, inscripciones);
        int avanceResultados = porcentaje(resultados, Math.max(partidosAlcance.size(), 1));

        List<DashboardProgressResponse> avance = List.of(
                new DashboardProgressResponse("Autenticacion y seguridad", 100),
                new DashboardProgressResponse("CRUD principales", 90),
                new DashboardProgressResponse("Inscripciones confirmadas", avanceInscripciones),
                new DashboardProgressResponse("Resultados registrados", avanceResultados)
        );

        List<DashboardUpcomingMatchResponse> proximas = partidosAlcance.stream()
                .filter(item -> item.getEstado() != EstadoPartido.FINALIZADO)
                .sorted(Comparator.comparing(Partido::getFechaHora))
                .limit(5)
                .map(this::toUpcoming)
                .toList();

        List<DashboardRecentResultResponse> ultimosResultados = resultadosAlcance.stream()
                .sorted(Comparator.comparing(Resultado::getCreatedAt).reversed())
                .limit(5)
                .map(this::toRecentResult)
                .toList();

        List<DashboardActivityResponse> actividad = auditoriaRepository
                .findTop20ByOrderByFechaDesc()
                .stream()
                .filter(item -> item.getUsuario() == null
                        ? institucionId.isEmpty()
                        : pertenece(item.getUsuario().getInstitucion() == null
                                ? null
                                : item.getUsuario().getInstitucion().getId(), institucionId))
                .limit(5)
                .map(this::toActivity)
                .toList();

        List<DashboardSportChartResponse> graficasPorDeporte = construirGraficasPorDeporte(
                equiposAlcance,
                participantesAlcance,
                partidosAlcance,
                resultadosAlcance
        );

        List<DashboardAlertResponse> alertas = construirAlertas(inscripcionesAlcance, partidosAlcance, resultadosAlcance);
        List<DashboardCountrySummaryResponse> resumenPorPais = construirResumenPorPais(
                equiposAlcance,
                participantesAlcance,
                partidosAlcance,
                resultadosAlcance
        );

        return new DashboardResumenResponse(
                metricas,
                avance,
                proximas,
                ultimosResultados,
                actividad,
                graficasPorDeporte,
                alertas,
                resumenPorPais
        );
    }

    private List<DashboardSportChartResponse> construirGraficasPorDeporte(
            List<Equipo> equipos,
            List<Participante> participantes,
            List<Partido> partidos,
            List<Resultado> resultados) {

        Set<String> deportes = equipos.stream()
                .filter(item -> item.getDeporte() != null)
                .map(item -> item.getDeporte().getNombre())
                .collect(Collectors.toSet());
        partidos.stream()
                .filter(item -> item.getDeporte() != null)
                .map(item -> item.getDeporte().getNombre())
                .forEach(deportes::add);

        return deportes.stream()
                .sorted()
                .map(deporte -> new DashboardSportChartResponse(
                        deporte,
                        equipos.stream()
                                .filter(item -> item.getDeporte() != null && deporte.equals(item.getDeporte().getNombre()))
                                .count(),
                        participantes.stream()
                                .filter(item -> item.getEquipo() != null
                                        && item.getEquipo().getDeporte() != null
                                        && deporte.equals(item.getEquipo().getDeporte().getNombre()))
                                .count(),
                        partidos.stream()
                                .filter(item -> item.getDeporte() != null && deporte.equals(item.getDeporte().getNombre()))
                                .count(),
                        resultados.stream()
                                .filter(item -> item.getPartido() != null
                                        && item.getPartido().getDeporte() != null
                                        && deporte.equals(item.getPartido().getDeporte().getNombre()))
                                .count()
                ))
                .toList();
    }

    private List<DashboardAlertResponse> construirAlertas(
            List<Inscripcion> inscripciones,
            List<Partido> partidos,
            List<Resultado> resultados) {

        Set<Long> partidosConResultado = resultados.stream()
                .filter(item -> item.getPartido() != null)
                .map(item -> item.getPartido().getId())
                .collect(Collectors.toSet());

        List<DashboardAlertResponse> alertasPartidos = partidos.stream()
                .filter(item -> item.getEstado() == EstadoPartido.FINALIZADO || item.getFechaHora().isBefore(java.time.LocalDateTime.now()))
                .filter(item -> !partidosConResultado.contains(item.getId()))
                .sorted(Comparator.comparing(Partido::getFechaHora).reversed())
                .limit(4)
                .map(item -> new DashboardAlertResponse(
                        "RESULTADO_PENDIENTE",
                        "Partido sin resultado",
                        item.getEquipoLocal().getNombre() + " vs " + item.getEquipoVisitante().getNombre(),
                        "danger",
                        "/resultados"
                ))
                .toList();

        List<DashboardAlertResponse> alertasInscripciones = inscripciones.stream()
                .collect(Collectors.groupingBy(item -> item.getDeporte().getNombre(), Collectors.counting()))
                .entrySet()
                .stream()
                .filter(entry -> entry.getValue() < 2)
                .sorted(Map.Entry.comparingByKey())
                .limit(4)
                .map(entry -> new DashboardAlertResponse(
                        "POCOS_INSCRITOS",
                        "Deporte con pocos inscritos",
                        entry.getKey() + " tiene " + entry.getValue() + " inscripción(es).",
                        "warning",
                        "/inscripciones"
                ))
                .toList();

        return java.util.stream.Stream.concat(alertasPartidos.stream(), alertasInscripciones.stream())
                .limit(6)
                .toList();
    }

    private List<DashboardCountrySummaryResponse> construirResumenPorPais(
            List<Equipo> equipos,
            List<Participante> participantes,
            List<Partido> partidos,
            List<Resultado> resultados) {

        Map<Long, List<Equipo>> equiposPorCategoria = equipos.stream()
                .filter(item -> item.getCategoriaEvento() != null && item.getCategoriaEvento().getPais() != null)
                .collect(Collectors.groupingBy(item -> item.getCategoriaEvento().getId()));

        Set<Long> partidosConResultado = resultados.stream()
                .filter(item -> item.getPartido() != null)
                .map(item -> item.getPartido().getId())
                .collect(Collectors.toSet());

        Map<Long, Long> participantesPorCategoria = participantes.stream()
                .filter(item -> item.getEquipo() != null && item.getEquipo().getCategoriaEvento() != null)
                .collect(Collectors.groupingBy(item -> item.getEquipo().getCategoriaEvento().getId(), Collectors.counting()));

        Map<Long, Long> partidosPorCategoria = partidos.stream()
                .flatMap(item -> java.util.stream.Stream.of(item.getEquipoLocal(), item.getEquipoVisitante()))
                .filter(item -> item != null && item.getCategoriaEvento() != null)
                .collect(Collectors.groupingBy(item -> item.getCategoriaEvento().getId(), Collectors.counting()));

        Map<Long, Long> resultadosPorCategoria = partidos.stream()
                .filter(item -> partidosConResultado.contains(item.getId()))
                .flatMap(item -> java.util.stream.Stream.of(item.getEquipoLocal(), item.getEquipoVisitante()))
                .filter(item -> item != null && item.getCategoriaEvento() != null)
                .collect(Collectors.groupingBy(item -> item.getCategoriaEvento().getId(), Collectors.counting()));

        return equiposPorCategoria.entrySet()
                .stream()
                .map(entry -> {
                    Equipo equipo = entry.getValue().get(0);
                    var categoria = equipo.getCategoriaEvento();
                    var pais = categoria.getPais();
                    return new DashboardCountrySummaryResponse(
                            pais.getNombre(),
                            pais.getBandera(),
                            categoria.getNombre(),
                            (long) entry.getValue().size(),
                            participantesPorCategoria.getOrDefault(entry.getKey(), 0L),
                            partidosPorCategoria.getOrDefault(entry.getKey(), 0L),
                            resultadosPorCategoria.getOrDefault(entry.getKey(), 0L)
                    );
                })
                .sorted(Comparator.comparing(DashboardCountrySummaryResponse::participantes).reversed())
                .limit(8)
                .toList();
    }

    private boolean pertenece(Long recursoInstitucionId, Optional<Long> institucionId) {
        return institucionId.isEmpty() || institucionId.get().equals(recursoInstitucionId);
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
