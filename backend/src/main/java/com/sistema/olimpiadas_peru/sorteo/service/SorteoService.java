package com.sistema.olimpiadas_peru.sorteo.service;

import com.sistema.olimpiadas_peru.common.enums.EstadoInscripcion;
import com.sistema.olimpiadas_peru.common.exception.BusinessException;
import com.sistema.olimpiadas_peru.deporte.entity.Deporte;
import com.sistema.olimpiadas_peru.deporte.service.ReglaDeporteService;
import com.sistema.olimpiadas_peru.deporte.service.DeporteService;
import com.sistema.olimpiadas_peru.evento.entity.Evento;
import com.sistema.olimpiadas_peru.evento.service.EventoService;
import com.sistema.olimpiadas_peru.evento.service.EventoReglaService;
import com.sistema.olimpiadas_peru.auth1.security.InstitucionAccessService;
import com.sistema.olimpiadas_peru.inscripcion.entity.Inscripcion;
import com.sistema.olimpiadas_peru.inscripcion.repository.InscripcionRepository;
import com.sistema.olimpiadas_peru.participante.repository.ParticipanteRepository;
import com.sistema.olimpiadas_peru.participante.service.PlantillaEquipoService;
import com.sistema.olimpiadas_peru.sorteo.dto.GrupoEquipoResponse;
import com.sistema.olimpiadas_peru.sorteo.dto.GrupoResponse;
import com.sistema.olimpiadas_peru.sorteo.entity.Grupo;
import com.sistema.olimpiadas_peru.sorteo.entity.GrupoEquipo;
import com.sistema.olimpiadas_peru.sorteo.repository.GrupoEquipoRepository;
import com.sistema.olimpiadas_peru.sorteo.repository.GrupoRepository;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SorteoService {

    private final GrupoRepository grupoRepository;
    private final GrupoEquipoRepository grupoEquipoRepository;
    private final InscripcionRepository inscripcionRepository;
    private final DeporteService deporteService;
    private final ReglaDeporteService reglaDeporteService;
    private final ParticipanteRepository participanteRepository;
    private final EventoService eventoService;
    private final PlantillaEquipoService plantillaEquipoService;
    private final EventoReglaService eventoReglaService;
    private final InstitucionAccessService accessService;

    @Transactional
    public List<GrupoResponse> generarGrupos(Long deporteId) {
        return generarGrupos(null, deporteId);
    }

    @Transactional
    public List<GrupoResponse> generarGrupos(Long eventoId, Long deporteId) {
        Deporte deporte = deporteService.getEntity(deporteId);
        Evento evento = eventoId == null ? null : eventoService.getEntity(eventoId);
        if (evento != null) {
            accessService.validar(evento.getInstitucion().getId());
            eventoReglaService.validarSorteo(evento);
        }
        List<Inscripcion> inscripciones = eventoId == null
                ? inscripcionRepository.findByDeporteIdAndEstado(deporteId, EstadoInscripcion.CONFIRMADA)
                : inscripcionRepository.findByEventoIdAndDeporteIdAndEstado(
                        eventoId, deporteId, EstadoInscripcion.CONFIRMADA);

        if (inscripciones.size() < 2) {
            throw new BusinessException("Se requieren al menos dos equipos con inscripción confirmada para realizar el sorteo");
        }

        inscripciones.forEach(inscripcion -> {
            long count = plantillaEquipoService.countByEquipo(inscripcion.getEquipo().getId());
            reglaDeporteService.validarEquipoCompleto(deporte, count < 0
                    ? participanteRepository.countByEquipoId(inscripcion.getEquipo().getId())
                    : count);
        });

        if (eventoId == null) {
            grupoEquipoRepository.deleteByGrupoDeporteId(deporteId);
            grupoRepository.deleteByDeporteId(deporteId);
        } else {
            grupoEquipoRepository.deleteByGrupoEventoIdAndGrupoDeporteId(eventoId, deporteId);
            grupoRepository.deleteByEventoIdAndDeporteId(eventoId, deporteId);
        }

        List<Inscripcion> mezcladas = new ArrayList<>(inscripciones);
        Collections.shuffle(mezcladas);

        int equiposPorGrupo = deporte.getMaximoEquiposPorGrupo();
        int totalGrupos = (int) Math.ceil((double) mezcladas.size() / equiposPorGrupo);

        List<Grupo> grupos = new ArrayList<>();
        for (int i = 0; i < totalGrupos; i++) {
            Grupo grupo = new Grupo();
            grupo.setNombre("Grupo " + (char) ('A' + i));
            grupo.setDeporte(deporte);
            grupo.setEvento(evento);
            grupos.add(grupoRepository.save(grupo));
        }

        for (int i = 0; i < mezcladas.size(); i++) {
            Grupo grupo = grupos.get(i % totalGrupos);
            GrupoEquipo grupoEquipo = new GrupoEquipo();
            grupoEquipo.setGrupo(grupo);
            grupoEquipo.setEquipo(mezcladas.get(i).getEquipo());
            grupoEquipo.setPosicion((i / totalGrupos) + 1);
            grupoEquipoRepository.save(grupoEquipo);
        }

        return listar(eventoId, deporteId);
    }

    public List<GrupoResponse> listarPorDeporte(Long deporteId) {
        return listar(null, deporteId);
    }

    public List<GrupoResponse> listar(Long eventoId, Long deporteId) {
        List<Grupo> grupos = eventoId == null
                ? grupoRepository.findByDeporteIdOrderByNombreAsc(deporteId)
                : grupoRepository.findByEventoIdAndDeporteIdOrderByNombreAsc(eventoId, deporteId);
        return grupos.stream()
                .filter(grupo -> grupo.getEvento() == null || accessService.institucionActual()
                        .map(id -> id.equals(grupo.getEvento().getInstitucion().getId())).orElse(true))
                .map(this::toResponse)
                .toList();
    }

    private GrupoResponse toResponse(Grupo grupo) {
        List<GrupoEquipoResponse> equipos = grupoEquipoRepository.findByGrupoId(grupo.getId()).stream()
                .map(ge -> {
                    var categoria = ge.getEquipo().getCategoriaEvento();
                    var pais = categoria == null ? null : categoria.getPais();
                    return new GrupoEquipoResponse(
                            ge.getEquipo().getId(),
                            ge.getEquipo().getNombre(),
                            ge.getPosicion(),
                            pais == null ? null : pais.getNombre(),
                            pais == null ? null : pais.getBandera(),
                            pais == null ? null : pais.getColorPrimario(),
                            pais == null ? null : pais.getColorSecundario());
                })
                .toList();

        return new GrupoResponse(
                grupo.getId(),
                grupo.getNombre(),
                grupo.getEvento() == null ? null : grupo.getEvento().getId(),
                grupo.getEvento() == null ? null : grupo.getEvento().getNombre(),
                grupo.getDeporte().getId(),
                grupo.getDeporte().getNombre(),
                equipos);
    }
}
