package com.sistema.olimpiadas_peru.institucion.service;

import com.sistema.olimpiadas_peru.common.exception.ResourceNotFoundException;
import com.sistema.olimpiadas_peru.institucion.dto.InstitucionRequest;
import com.sistema.olimpiadas_peru.institucion.dto.InstitucionResponse;
import com.sistema.olimpiadas_peru.institucion.entity.Institucion;
import com.sistema.olimpiadas_peru.institucion.repository.InstitucionRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InstitucionService {

    private final InstitucionRepository institucionRepository;

    public List<InstitucionResponse> findAll() {
        return institucionRepository.findAll().stream().map(this::toResponse).toList();
    }

    public InstitucionResponse findById(Long id) {
        return toResponse(getEntity(id));
    }

    @Transactional
    public InstitucionResponse create(InstitucionRequest request) {
        Institucion institucion = new Institucion();
        applyChanges(institucion, request);
        return toResponse(institucionRepository.save(institucion));
    }

    @Transactional
    public InstitucionResponse update(Long id, InstitucionRequest request) {
        Institucion institucion = getEntity(id);
        applyChanges(institucion, request);
        return toResponse(institucionRepository.save(institucion));
    }

    @Transactional
    public void delete(Long id) {
        institucionRepository.delete(getEntity(id));
    }

    public Institucion getEntity(Long id) {
        return institucionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Institucion no encontrada con id " + id));
    }

    private void applyChanges(Institucion institucion, InstitucionRequest request) {
        institucion.setNombre(request.nombre());
        institucion.setCodigoModular(request.codigoModular());
        institucion.setRegion(request.region());
        institucion.setCiudad(request.ciudad());
        institucion.setDireccion(request.direccion());
        institucion.setTelefono(request.telefono());
        institucion.setEmail(request.email());
    }

    private InstitucionResponse toResponse(Institucion institucion) {
        return new InstitucionResponse(
                institucion.getId(),
                institucion.getNombre(),
                institucion.getCodigoModular(),
                institucion.getRegion(),
                institucion.getCiudad(),
                institucion.getDireccion(),
                institucion.getTelefono(),
                institucion.getEmail());
    }
}
