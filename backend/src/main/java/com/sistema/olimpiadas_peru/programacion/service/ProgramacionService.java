package com.sistema.olimpiadas_peru.programacion.service;

import com.sistema.olimpiadas_peru.common.enums.EstadoInscripcion;
import com.sistema.olimpiadas_peru.common.exception.BusinessException;
import com.sistema.olimpiadas_peru.common.exception.ResourceNotFoundException;
import com.sistema.olimpiadas_peru.deporte.entity.Deporte;
import com.sistema.olimpiadas_peru.deporte.service.ReglaDeporteService;
import com.sistema.olimpiadas_peru.deporte.service.DeporteService;
import com.sistema.olimpiadas_peru.equipo.entity.Equipo;
import com.sistema.olimpiadas_peru.equipo.service.EquipoService;
import com.sistema.olimpiadas_peru.inscripcion.repository.InscripcionRepository;
import com.sistema.olimpiadas_peru.participante.repository.ParticipanteRepository;
import com.sistema.olimpiadas_peru.participante.service.PlantillaEquipoService;
import com.sistema.olimpiadas_peru.evento.service.EventoReglaService;
import com.sistema.olimpiadas_peru.auth1.security.InstitucionAccessService;
import com.sistema.olimpiadas_peru.programacion.dto.PartidoRequest;
import com.sistema.olimpiadas_peru.programacion.dto.PartidoResponse;
import com.sistema.olimpiadas_peru.programacion.entity.Partido;
import com.sistema.olimpiadas_peru.programacion.repository.PartidoRepository;
import com.sistema.olimpiadas_peru.sorteo.entity.Grupo;
import com.sistema.olimpiadas_peru.sorteo.repository.GrupoEquipoRepository;
import com.sistema.olimpiadas_peru.sorteo.repository.GrupoRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProgramacionService {

    private final PartidoRepository partidoRepository;
    private final GrupoRepository grupoRepository;
    private final DeporteService deporteService;
    private final EquipoService equipoService;
    private final InscripcionRepository inscripcionRepository;
    private final ParticipanteRepository participanteRepository;
    private final ReglaDeporteService reglaDeporteService;
    private final GrupoEquipoRepository grupoEquipoRepository;
    private final PlantillaEquipoService plantillaEquipoService;
    private final EventoReglaService eventoReglaService;
    private final InstitucionAccessService accessService;

    public List<PartidoResponse> findAll(Long deporteId) {
        List<Partido> partidos = deporteId == null
                ? partidoRepository.findAll()
                : partidoRepository.findByDeporteIdOrderByFechaHoraAsc(deporteId);
        return partidos.stream()
                .filter(item -> accessService.institucionActual()
                        .map(id -> id.equals(item.getEquipoLocal().getInstitucion().getId())).orElse(true))
                .map(this::toResponse).toList();
    }

    public PartidoResponse findById(Long id) {
        return toResponse(getEntity(id));
    }

    @Transactional
    public PartidoResponse create(PartidoRequest request) {
        validarEquipos(request, null);
        Partido partido = new Partido();
        applyChanges(partido, request);
        return toResponse(partidoRepository.save(partido));
    }

    @Transactional
    public PartidoResponse update(Long id, PartidoRequest request) {
        validarEquipos(request, id);
        Partido partido = getEntity(id);
        applyChanges(partido, request);
        return toResponse(partidoRepository.save(partido));
    }

    @Transactional
    public void delete(Long id) {
        partidoRepository.delete(getEntity(id));
    }

    public Partido getEntity(Long id) {
        Partido partido = partidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Partido no encontrado con id " + id));
        accessService.validar(partido.getEquipoLocal().getInstitucion().getId());
        return partido;
    }

    private void validarEquipos(PartidoRequest request, Long partidoId) {
        if (request.equipoLocalId().equals(request.equipoVisitanteId())) {
            throw new BusinessException("Un equipo no puede jugar contra si mismo");
        }

        Deporte deporte = deporteService.getEntity(request.deporteId());
        Equipo equipoLocal = equipoService.getEntity(request.equipoLocalId());
        Equipo equipoVisitante = equipoService.getEntity(request.equipoVisitanteId());

        if (equipoLocal.getCategoriaEvento() != null && equipoVisitante.getCategoriaEvento() != null
                && !equipoLocal.getCategoriaEvento().getEvento().getId()
                .equals(equipoVisitante.getCategoriaEvento().getEvento().getId())) {
            throw new BusinessException("Los equipos deben pertenecer al mismo evento");
        }
        if (equipoLocal.getCategoriaEvento() != null) {
            eventoReglaService.validarCompetencia(equipoLocal.getCategoriaEvento().getEvento());
        }
        if (partidoRepository.existeEquipoEnHorario(
                request.fechaHora(), List.of(equipoLocal.getId(), equipoVisitante.getId()), partidoId)) {
            throw new BusinessException("Uno de los equipos ya tiene un partido programado en ese horario");
        }
        boolean sedeOcupada = partidoId == null
                ? partidoRepository.existsByFechaHoraAndSedeIgnoreCase(request.fechaHora(), request.sede())
                : partidoRepository.existsByFechaHoraAndSedeIgnoreCaseAndIdNot(
                        request.fechaHora(), request.sede(), partidoId);
        if (sedeOcupada) {
            throw new BusinessException("La sede ya esta ocupada en ese horario");
        }

        validarEquipoHabilitadoParaProgramacion(deporte, equipoLocal);
        validarEquipoHabilitadoParaProgramacion(deporte, equipoVisitante);

        if (request.grupoId() != null) {
            Grupo grupo = grupoRepository.findById(request.grupoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Grupo no encontrado con id " + request.grupoId()));

            if (!grupo.getDeporte().getId().equals(request.deporteId())) {
                throw new BusinessException("El grupo no pertenece al deporte seleccionado");
            }
            if (grupo.getEvento() != null && equipoLocal.getCategoriaEvento() != null
                    && !grupo.getEvento().getId().equals(
                    equipoLocal.getCategoriaEvento().getEvento().getId())) {
                throw new BusinessException("El grupo y los equipos pertenecen a eventos diferentes");
            }

            if (!grupoEquipoRepository.existsByGrupoIdAndEquipoId(grupo.getId(), equipoLocal.getId())
                    || !grupoEquipoRepository.existsByGrupoIdAndEquipoId(grupo.getId(), equipoVisitante.getId())) {
                throw new BusinessException("Ambos equipos deben pertenecer al grupo seleccionado");
            }
        }
    }

    private void applyChanges(Partido partido, PartidoRequest request) {
        Grupo grupo = request.grupoId() == null ? null : grupoRepository.findById(request.grupoId())
                .orElseThrow(() -> new ResourceNotFoundException("Grupo no encontrado con id " + request.grupoId()));
        partido.setGrupo(grupo);
        partido.setDeporte(deporteService.getEntity(request.deporteId()));
        partido.setEquipoLocal(equipoService.getEntity(request.equipoLocalId()));
        partido.setEquipoVisitante(equipoService.getEntity(request.equipoVisitanteId()));
        partido.setFechaHora(request.fechaHora());
        partido.setSede(request.sede());
        partido.setEstado(request.estado());
    }

    private void validarEquipoHabilitadoParaProgramacion(Deporte deporte, Equipo equipo) {
        inscripcionRepository.findByEquipoIdAndDeporteIdAndEstado(equipo.getId(), deporte.getId(), EstadoInscripcion.CONFIRMADA)
                .orElseThrow(() -> new BusinessException(
                        "El equipo " + equipo.getNombre() + " no tiene una inscripcion confirmada para " + deporte.getNombre()));

        long count = plantillaEquipoService.countByEquipo(equipo.getId());
        reglaDeporteService.validarEquipoCompleto(deporte,
                count < 0 ? participanteRepository.countByEquipoId(equipo.getId()) : count);
    }

    private PartidoResponse toResponse(Partido partido) {
        return new PartidoResponse(
                partido.getId(),
                partido.getGrupo() != null ? partido.getGrupo().getId() : null,
                partido.getGrupo() != null ? partido.getGrupo().getNombre() : null,
                partido.getDeporte().getId(),
                partido.getDeporte().getNombre(),
                partido.getEquipoLocal().getId(),
                partido.getEquipoLocal().getNombre(),
                partido.getEquipoVisitante().getId(),
                partido.getEquipoVisitante().getNombre(),
                partido.getFechaHora(),
                partido.getSede(),
                partido.getEstado());
    }
}
