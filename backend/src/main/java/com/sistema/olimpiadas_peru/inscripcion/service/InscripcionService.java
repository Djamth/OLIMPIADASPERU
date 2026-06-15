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

    public List<InscripcionResponse> findAll() {
        return inscripcionRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<InscripcionResponse> findByDeporte(Long deporteId) {
        return inscripcionRepository.findByDeporteId(deporteId).stream().map(this::toResponse).toList();
    }

    public InscripcionResponse findById(Long id) {
        return toResponse(getEntity(id));
    }

    @Transactional
    public InscripcionResponse create(InscripcionRequest request) {
        inscripcionRepository.findByEquipoIdAndDeporteId(request.equipoId(), request.deporteId())
                .ifPresent(existing -> {
                    throw new BusinessException("El equipo ya esta inscrito en este deporte");
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
        return inscripcionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inscripcion no encontrada con id " + id));
    }

    private void applyChanges(Inscripcion inscripcion, InscripcionRequest request) {
        Equipo equipo = equipoService.getEntity(request.equipoId());
        Deporte deporte = deporteService.getEntity(request.deporteId());
        reglaDeporteService.validarInscripcion(deporte, equipo);
        if (request.estado() == EstadoInscripcion.CONFIRMADA) {
            reglaDeporteService.validarEquipoCompleto(deporte, participanteRepository.countByEquipoId(equipo.getId()));
        }

        inscripcion.setEquipo(equipo);
        inscripcion.setDeporte(deporte);
        inscripcion.setEstado(request.estado());
        inscripcion.setFechaInscripcion(request.fechaInscripcion());
    }

    private InscripcionResponse toResponse(Inscripcion inscripcion) {
        return new InscripcionResponse(
                inscripcion.getId(),
                inscripcion.getEquipo().getId(),
                inscripcion.getEquipo().getNombre(),
                inscripcion.getDeporte().getId(),
                inscripcion.getDeporte().getNombre(),
                inscripcion.getEstado(),
                inscripcion.getFechaInscripcion());
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
}
