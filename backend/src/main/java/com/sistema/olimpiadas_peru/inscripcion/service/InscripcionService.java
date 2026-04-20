package com.sistema.olimpiadas_peru.inscripcion.service;

import com.sistema.olimpiadas_peru.common.exception.BusinessException;
import com.sistema.olimpiadas_peru.common.exception.ResourceNotFoundException;
import com.sistema.olimpiadas_peru.deporte.service.DeporteService;
import com.sistema.olimpiadas_peru.equipo.service.EquipoService;
import com.sistema.olimpiadas_peru.inscripcion.dto.InscripcionRequest;
import com.sistema.olimpiadas_peru.inscripcion.dto.InscripcionResponse;
import com.sistema.olimpiadas_peru.inscripcion.entity.Inscripcion;
import com.sistema.olimpiadas_peru.inscripcion.repository.InscripcionRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InscripcionService {

    private final InscripcionRepository inscripcionRepository;
    private final EquipoService equipoService;
    private final DeporteService deporteService;

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
        return toResponse(inscripcionRepository.save(inscripcion));
    }

    @Transactional
    public InscripcionResponse update(Long id, InscripcionRequest request) {
        Inscripcion inscripcion = getEntity(id);
        applyChanges(inscripcion, request);
        return toResponse(inscripcionRepository.save(inscripcion));
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
        inscripcion.setEquipo(equipoService.getEntity(request.equipoId()));
        inscripcion.setDeporte(deporteService.getEntity(request.deporteId()));
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
}
