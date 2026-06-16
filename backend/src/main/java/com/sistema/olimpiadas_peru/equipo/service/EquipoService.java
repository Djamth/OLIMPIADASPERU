package com.sistema.olimpiadas_peru.equipo.service;

import com.sistema.olimpiadas_peru.categoria.entity.CategoriaEvento;
import com.sistema.olimpiadas_peru.categoria.service.CategoriaEventoService;
import com.sistema.olimpiadas_peru.common.exception.BusinessException;
import com.sistema.olimpiadas_peru.common.exception.ResourceNotFoundException;
import com.sistema.olimpiadas_peru.deporte.entity.Deporte;
import com.sistema.olimpiadas_peru.deporte.service.DeporteService;
import com.sistema.olimpiadas_peru.deporte.service.ReglaDeporteService;
import com.sistema.olimpiadas_peru.equipo.dto.EquipoRequest;
import com.sistema.olimpiadas_peru.equipo.dto.EquipoResponse;
import com.sistema.olimpiadas_peru.equipo.entity.Equipo;
import com.sistema.olimpiadas_peru.equipo.repository.EquipoRepository;
import com.sistema.olimpiadas_peru.institucion.service.InstitucionService;
import com.sistema.olimpiadas_peru.evento.service.EventoReglaService;
import com.sistema.olimpiadas_peru.auth1.security.InstitucionAccessService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EquipoService {

    private final EquipoRepository equipoRepository;
    private final InstitucionService institucionService;
    private final CategoriaEventoService categoriaEventoService;
    private final DeporteService deporteService;
    private final ReglaDeporteService reglaDeporteService;
    private final EventoReglaService eventoReglaService;
    private final InstitucionAccessService accessService;

    public List<EquipoResponse> findAll() {
        List<Equipo> equipos = accessService.institucionActual()
                .map(equipoRepository::findByInstitucionId)
                .orElseGet(equipoRepository::findAll);
        return equipos.stream().map(this::toResponse).toList();
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
        Equipo equipo = equipoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado con id " + id));
        accessService.validar(equipo.getInstitucion().getId());
        return equipo;
    }

    private void applyChanges(Equipo equipo, EquipoRequest request) {
        equipo.setNombre(request.nombre());
        equipo.setCategoria(request.categoria());
        equipo.setGenero(request.genero());
        equipo.setEntrenador(request.entrenador());
        if (request.categoriaEventoId() == null || request.deporteId() == null) {
            equipo.setInstitucion(institucionService.getEntity(request.institucionId()));
            return;
        }

        CategoriaEvento categoriaEvento = categoriaEventoService.getEntity(request.categoriaEventoId());
        eventoReglaService.validarInscripciones(categoriaEvento.getEvento());
        Deporte deporte = deporteService.getEntity(request.deporteId());
        if (!categoriaEvento.getEvento().getInstitucion().getId().equals(request.institucionId())) {
            throw new BusinessException("La categoría no pertenece a la institución seleccionada");
        }
        reglaDeporteService.validarInscripcion(deporte, equipo);
        boolean duplicado = equipo.getId() == null
                ? equipoRepository.existsByCategoriaEventoIdAndDeporteId(categoriaEvento.getId(), deporte.getId())
                : equipoRepository.existsByCategoriaEventoIdAndDeporteIdAndIdNot(
                        categoriaEvento.getId(), deporte.getId(), equipo.getId());
        if (duplicado) {
            throw new BusinessException("La categoría ya tiene un equipo inscrito para este deporte");
        }
        equipo.setInstitucion(categoriaEvento.getEvento().getInstitucion());
        equipo.setCategoriaEvento(categoriaEvento);
        equipo.setDeporte(deporte);
    }

    private EquipoResponse toResponse(Equipo equipo) {
        CategoriaEvento categoriaEvento = equipo.getCategoriaEvento();
        Deporte deporte = equipo.getDeporte();
        return new EquipoResponse(
                equipo.getId(),
                equipo.getNombre(),
                equipo.getCategoria(),
                equipo.getGenero(),
                equipo.getEntrenador(),
                equipo.getInstitucion().getId(),
                equipo.getInstitucion().getNombre(),
                categoriaEvento == null ? null : categoriaEvento.getId(),
                categoriaEvento == null ? null : categoriaEvento.getNombre(),
                categoriaEvento == null ? null : categoriaEvento.getEvento().getId(),
                categoriaEvento == null ? null : categoriaEvento.getEvento().getNombre(),
                categoriaEvento == null ? null : categoriaEvento.getPais().getId(),
                categoriaEvento == null ? null : categoriaEvento.getPais().getNombre(),
                categoriaEvento == null ? null : categoriaEvento.getPais().getBandera(),
                categoriaEvento == null ? null : categoriaEvento.getPais().getColorPrimario(),
                categoriaEvento == null ? null : categoriaEvento.getPais().getColorSecundario(),
                deporte == null ? null : deporte.getId(),
                deporte == null ? null : deporte.getNombre());
    }
}
