package com.sistema.olimpiadas_peru.inscripcion.service;

import com.sistema.olimpiadas_peru.common.exception.BusinessException;
import com.sistema.olimpiadas_peru.common.exception.ResourceNotFoundException;
import com.sistema.olimpiadas_peru.common.enums.EstadoInscripcion;
import com.sistema.olimpiadas_peru.deporte.entity.Deporte;
import com.sistema.olimpiadas_peru.deporte.service.ReglaDeporteService;
import com.sistema.olimpiadas_peru.equipo.entity.Equipo;
import com.sistema.olimpiadas_peru.deporte.service.DeporteService;
import com.sistema.olimpiadas_peru.equipo.service.EquipoService;
import com.sistema.olimpiadas_peru.inscripcion.dto.InscripcionRequest;
import com.sistema.olimpiadas_peru.inscripcion.dto.InscripcionResponse;
import com.sistema.olimpiadas_peru.inscripcion.entity.Inscripcion;
import com.sistema.olimpiadas_peru.inscripcion.event.InscripcionConfirmadaEvent;
import com.sistema.olimpiadas_peru.inscripcion.repository.InscripcionRepository;
import com.sistema.olimpiadas_peru.participante.repository.ParticipanteRepository;
import com.sistema.olimpiadas_peru.participante.service.PlantillaEquipoService;
import com.sistema.olimpiadas_peru.evento.service.EventoReglaService;
import com.sistema.olimpiadas_peru.auth1.security.InstitucionAccessService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.ApplicationEventPublisher;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InscripcionService {

    private final InscripcionRepository inscripcionRepository;
    private final EquipoService equipoService;
    private final DeporteService deporteService;
    private final ReglaDeporteService reglaDeporteService;
    private final ParticipanteRepository participanteRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final PlantillaEquipoService plantillaEquipoService;
    private final EventoReglaService eventoReglaService;
    private final InstitucionAccessService accessService;

    public List<InscripcionResponse> findAll() {
        return filtrarAlcance(inscripcionRepository.findAll()).stream().map(this::toResponse).toList();
    }

    public List<InscripcionResponse> findByDeporte(Long deporteId) {
        return filtrarAlcance(inscripcionRepository.findByDeporteId(deporteId)).stream().map(this::toResponse).toList();
    }

    public List<InscripcionResponse> findAll(Long eventoId, Long deporteId) {
        if (eventoId != null && deporteId != null) {
            return filtrarAlcance(inscripcionRepository.findByEventoIdAndDeporteId(eventoId, deporteId))
                    .stream().map(this::toResponse).toList();
        }
        if (eventoId != null) {
            return filtrarAlcance(inscripcionRepository.findByEventoId(eventoId)).stream().map(this::toResponse).toList();
        }
        return deporteId != null ? findByDeporte(deporteId) : findAll();
    }

    public InscripcionResponse findById(Long id) {
        return toResponse(getEntity(id));
    }

    @Transactional
    public InscripcionResponse create(InscripcionRequest request) {
        inscripcionRepository.findByEquipoIdAndDeporteId(request.equipoId(), request.deporteId())
                .ifPresent(existing -> {
                    throw new BusinessException("El equipo ya está inscrito en este deporte");
                });

        Inscripcion inscripcion = new Inscripcion();
        applyChanges(inscripcion, request);
        Inscripcion guardada = inscripcionRepository.save(inscripcion);
        publicarConfirmacionSiCorresponde(guardada, null);
        return toResponse(guardada);
    }

    @Transactional
    public InscripcionResponse update(Long id, InscripcionRequest request) {
        Inscripcion inscripcion = getEntity(id);
        EstadoInscripcion estadoAnterior = inscripcion.getEstado();
        applyChanges(inscripcion, request);
        Inscripcion guardada = inscripcionRepository.save(inscripcion);
        publicarConfirmacionSiCorresponde(guardada, estadoAnterior);
        return toResponse(guardada);
    }

    @Transactional
    public void delete(Long id) {
        inscripcionRepository.delete(getEntity(id));
    }

    public Inscripcion getEntity(Long id) {
        Inscripcion inscripcion = inscripcionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inscripción no encontrada con id " + id));
        accessService.validar(inscripcion.getEquipo().getInstitucion().getId());
        return inscripcion;
    }

    private void applyChanges(Inscripcion inscripcion, InscripcionRequest request) {
        Equipo equipo = equipoService.getEntity(request.equipoId());
        if (equipo.getCategoriaEvento() != null) {
            eventoReglaService.validarInscripciones(equipo.getCategoriaEvento().getEvento());
        }
        Deporte deporte = deporteService.getEntity(request.deporteId());
        if (equipo.getDeporte() != null && !equipo.getDeporte().getId().equals(deporte.getId())) {
            throw new BusinessException("El equipo fue creado para el deporte " + equipo.getDeporte().getNombre());
        }
        reglaDeporteService.validarInscripcion(deporte, equipo);
        if (request.estado() == EstadoInscripcion.CONFIRMADA) {
            long plantillaCount = plantillaEquipoService.countByEquipo(equipo.getId());
            reglaDeporteService.validarEquipoCompleto(deporte,
                    plantillaCount < 0 ? participanteRepository.countByEquipoId(equipo.getId()) : plantillaCount);
        }

        inscripcion.setEquipo(equipo);
        inscripcion.setDeporte(deporte);
        inscripcion.setEstado(request.estado());
        inscripcion.setFechaInscripcion(request.fechaInscripcion());
        inscripcion.setEvento(equipo.getCategoriaEvento() == null
                ? null
                : equipo.getCategoriaEvento().getEvento());
    }

    private InscripcionResponse toResponse(Inscripcion inscripcion) {
        var categoria = inscripcion.getEquipo().getCategoriaEvento();
        var evento = inscripcion.getEvento();
        return new InscripcionResponse(
                inscripcion.getId(),
                inscripcion.getEquipo().getId(),
                inscripcion.getEquipo().getNombre(),
                inscripcion.getDeporte().getId(),
                inscripcion.getDeporte().getNombre(),
                inscripcion.getEstado(),
                inscripcion.getFechaInscripcion(),
                evento == null ? null : evento.getId(),
                evento == null ? null : evento.getNombre(),
                categoria == null ? null : categoria.getId(),
                categoria == null ? null : categoria.getNombre(),
                categoria == null ? null : categoria.getPais().getNombre(),
                categoria == null ? null : categoria.getPais().getBandera());
    }

    private void publicarConfirmacionSiCorresponde(Inscripcion inscripcion, EstadoInscripcion estadoAnterior) {
        if (inscripcion.getEstado() != EstadoInscripcion.CONFIRMADA
            || estadoAnterior == EstadoInscripcion.CONFIRMADA) {
            return;
        }

        Equipo equipo = inscripcion.getEquipo();
        eventPublisher.publishEvent(new InscripcionConfirmadaEvent(
            equipo.getInstitucion().getEmail(),
            equipo.getInstitucion().getNombre(),
            equipo.getNombre(),
            inscripcion.getDeporte().getNombre()
        ));
    }

    private List<Inscripcion> filtrarAlcance(List<Inscripcion> inscripciones) {
        return inscripciones.stream()
                .filter(item -> accessService.institucionActual()
                        .map(id -> id.equals(item.getEquipo().getInstitucion().getId())).orElse(true))
                .toList();
    }
}
