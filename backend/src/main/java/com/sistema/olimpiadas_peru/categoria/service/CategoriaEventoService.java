package com.sistema.olimpiadas_peru.categoria.service;

import com.sistema.olimpiadas_peru.categoria.dto.CategoriaEventoRequest;
import com.sistema.olimpiadas_peru.categoria.dto.CategoriaEventoResponse;
import com.sistema.olimpiadas_peru.categoria.entity.CategoriaEvento;
import com.sistema.olimpiadas_peru.categoria.repository.CategoriaEventoRepository;
import com.sistema.olimpiadas_peru.common.exception.BusinessException;
import com.sistema.olimpiadas_peru.common.exception.ResourceNotFoundException;
import com.sistema.olimpiadas_peru.evento.entity.Evento;
import com.sistema.olimpiadas_peru.evento.service.EventoService;
import com.sistema.olimpiadas_peru.evento.service.EventoReglaService;
import com.sistema.olimpiadas_peru.auth1.security.InstitucionAccessService;
import com.sistema.olimpiadas_peru.pais.entity.Pais;
import com.sistema.olimpiadas_peru.pais.service.PaisService;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoriaEventoService {

    private final CategoriaEventoRepository repository;
    private final EventoService eventoService;
    private final EventoReglaService eventoReglaService;
    private final InstitucionAccessService accessService;
    private final PaisService paisService;
    private final SecureRandom random = new SecureRandom();

    public List<CategoriaEventoResponse> findAll(Long eventoId) {
        List<CategoriaEvento> categorias = eventoId == null
                ? repository.findAll()
                : repository.findByEventoIdOrderByNombreAsc(eventoId);
        return categorias.stream()
                .filter(item -> accessService.institucionActual()
                        .map(id -> id.equals(item.getEvento().getInstitucion().getId())).orElse(true))
                .map(this::toResponse).toList();
    }

    @Transactional
    public CategoriaEventoResponse create(CategoriaEventoRequest request) {
        CategoriaEvento categoria = new CategoriaEvento();
        Evento evento = eventoService.getEntity(request.eventoId());
        eventoReglaService.validarConfiguracion(evento);
        apply(categoria, evento, request);
        return toResponse(repository.save(categoria));
    }

    @Transactional
    public CategoriaEventoResponse update(Long id, CategoriaEventoRequest request) {
        CategoriaEvento categoria = getEntity(id);
        Evento evento = eventoService.getEntity(request.eventoId());
        eventoReglaService.validarConfiguracion(evento);
        apply(categoria, evento, request);
        return toResponse(repository.save(categoria));
    }

    @Transactional
    public void delete(Long id) {
        CategoriaEvento categoria = getEntity(id);
        eventoReglaService.validarConfiguracion(categoria.getEvento());
        repository.delete(categoria);
    }

    public CategoriaEvento getEntity(Long id) {
        CategoriaEvento categoria = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria no encontrada con id " + id));
        accessService.validar(categoria.getEvento().getInstitucion().getId());
        return categoria;
    }

    private void apply(CategoriaEvento categoria, Evento evento, CategoriaEventoRequest request) {
        Pais pais = request.paisId() == null
                ? seleccionarPaisDisponible(evento.getId())
                : paisService.getEntity(request.paisId());
        boolean usado = categoria.getId() == null
                ? repository.existsByEventoIdAndPaisId(evento.getId(), pais.getId())
                : repository.existsByEventoIdAndPaisIdAndIdNot(evento.getId(), pais.getId(), categoria.getId());
        if (usado) {
            throw new BusinessException("El pais " + pais.getNombre() + " ya esta asignado en este evento");
        }
        if (!pais.isActivo()) {
            throw new BusinessException("El pais seleccionado no esta activo");
        }
        categoria.setNombre(request.nombre().trim());
        categoria.setNivel(request.nivel());
        categoria.setDescripcion(request.descripcion());
        categoria.setEvento(evento);
        categoria.setPais(pais);
    }

    private Pais seleccionarPaisDisponible(Long eventoId) {
        List<Pais> disponibles = new ArrayList<>(paisService.findActivos().stream()
                .filter(pais -> !repository.existsByEventoIdAndPaisId(eventoId, pais.getId()))
                .toList());
        if (disponibles.isEmpty()) {
            throw new BusinessException("No existen paises disponibles para asignar en este evento");
        }
        return disponibles.get(random.nextInt(disponibles.size()));
    }

    public CategoriaEventoResponse toResponse(CategoriaEvento categoria) {
        Pais pais = categoria.getPais();
        Evento evento = categoria.getEvento();
        return new CategoriaEventoResponse(categoria.getId(), categoria.getNombre(), categoria.getNivel(),
                categoria.getDescripcion(), evento.getId(), evento.getNombre(),
                evento.getInstitucion().getId(), evento.getInstitucion().getNombre(),
                pais.getId(), pais.getNombre(), pais.getCodigo(), pais.getBandera(),
                pais.getColorPrimario(), pais.getColorSecundario());
    }
}
