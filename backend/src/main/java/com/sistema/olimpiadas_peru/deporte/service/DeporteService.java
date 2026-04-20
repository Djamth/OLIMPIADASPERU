package com.sistema.olimpiadas_peru.deporte.service;

import com.sistema.olimpiadas_peru.common.exception.ResourceNotFoundException;
import com.sistema.olimpiadas_peru.deporte.dto.DeporteRequest;
import com.sistema.olimpiadas_peru.deporte.dto.DeporteResponse;
import com.sistema.olimpiadas_peru.deporte.entity.Deporte;
import com.sistema.olimpiadas_peru.deporte.repository.DeporteRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DeporteService {

    private final DeporteRepository deporteRepository;

    public List<DeporteResponse> findAll() {
        return deporteRepository.findAll().stream().map(this::toResponse).toList();
    }

    public DeporteResponse findById(Long id) {
        return toResponse(getEntity(id));
    }

    @Transactional
    public DeporteResponse create(DeporteRequest request) {
        Deporte deporte = new Deporte();
        applyChanges(deporte, request);
        return toResponse(deporteRepository.save(deporte));
    }

    @Transactional
    public DeporteResponse update(Long id, DeporteRequest request) {
        Deporte deporte = getEntity(id);
        applyChanges(deporte, request);
        return toResponse(deporteRepository.save(deporte));
    }

    @Transactional
    public void delete(Long id) {
        deporteRepository.delete(getEntity(id));
    }

    public Deporte getEntity(Long id) {
        return deporteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deporte no encontrado con id " + id));
    }

    private void applyChanges(Deporte deporte, DeporteRequest request) {
        deporte.setNombre(request.nombre());
        deporte.setDescripcion(request.descripcion());
        deporte.setMaximoEquiposPorGrupo(request.maximoEquiposPorGrupo());
        deporte.setNumeroJugadores(request.numeroJugadores());
    }

    private DeporteResponse toResponse(Deporte deporte) {
        return new DeporteResponse(
                deporte.getId(),
                deporte.getNombre(),
                deporte.getDescripcion(),
                deporte.getMaximoEquiposPorGrupo(),
                deporte.getNumeroJugadores());
    }
}
