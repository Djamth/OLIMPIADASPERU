package com.sistema.olimpiadas_peru.equipo.service;

import com.sistema.olimpiadas_peru.common.exception.ResourceNotFoundException;
import com.sistema.olimpiadas_peru.equipo.dto.EquipoRequest;
import com.sistema.olimpiadas_peru.equipo.dto.EquipoResponse;
import com.sistema.olimpiadas_peru.equipo.entity.Equipo;
import com.sistema.olimpiadas_peru.equipo.repository.EquipoRepository;
import com.sistema.olimpiadas_peru.institucion.service.InstitucionService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EquipoService {

    private final EquipoRepository equipoRepository;
    private final InstitucionService institucionService;

    public List<EquipoResponse> findAll() {
        return equipoRepository.findAll().stream().map(this::toResponse).toList();
    }

    public EquipoResponse findById(Long id) {
        return toResponse(getEntity(id));
    }

    @Transactional
    public EquipoResponse create(EquipoRequest request) {
        Equipo equipo = new Equipo();
        applyChanges(equipo, request);
        return toResponse(equipoRepository.save(equipo));
    }

    @Transactional
    public EquipoResponse update(Long id, EquipoRequest request) {
        Equipo equipo = getEntity(id);
        applyChanges(equipo, request);
        return toResponse(equipoRepository.save(equipo));
    }

    @Transactional
    public void delete(Long id) {
        equipoRepository.delete(getEntity(id));
    }

    public Equipo getEntity(Long id) {
        return equipoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado con id " + id));
    }

    private void applyChanges(Equipo equipo, EquipoRequest request) {
        equipo.setNombre(request.nombre());
        equipo.setCategoria(request.categoria());
        equipo.setGenero(request.genero());
        equipo.setEntrenador(request.entrenador());
        equipo.setInstitucion(institucionService.getEntity(request.institucionId()));
    }

    private EquipoResponse toResponse(Equipo equipo) {
        return new EquipoResponse(
                equipo.getId(),
                equipo.getNombre(),
                equipo.getCategoria(),
                equipo.getGenero(),
                equipo.getEntrenador(),
                equipo.getInstitucion().getId(),
                equipo.getInstitucion().getNombre());
    }
}
