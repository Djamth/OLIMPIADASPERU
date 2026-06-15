package com.sistema.olimpiadas_peru.evento.service;

import com.sistema.olimpiadas_peru.common.exception.BusinessException;
import com.sistema.olimpiadas_peru.common.exception.ResourceNotFoundException;
import com.sistema.olimpiadas_peru.evento.dto.EventoRequest;
import com.sistema.olimpiadas_peru.evento.dto.EventoResponse;
import com.sistema.olimpiadas_peru.evento.dto.ReplicarEventoRequest;
import com.sistema.olimpiadas_peru.evento.entity.Evento;
import com.sistema.olimpiadas_peru.evento.repository.EventoRepository;
import com.sistema.olimpiadas_peru.institucion.service.InstitucionService;
import com.sistema.olimpiadas_peru.categoria.entity.CategoriaEvento;
import com.sistema.olimpiadas_peru.categoria.repository.CategoriaEventoRepository;
import com.sistema.olimpiadas_peru.pais.entity.Pais;
import com.sistema.olimpiadas_peru.pais.repository.PaisRepository;
import com.sistema.olimpiadas_peru.common.enums.EstadoEvento;
import com.sistema.olimpiadas_peru.auth1.security.InstitucionAccessService;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventoService {

    private final EventoRepository repository;
    private final InstitucionService institucionService;
    private final EventoReglaService eventoReglaService;
    private final CategoriaEventoRepository categoriaRepository;
    private final PaisRepository paisRepository;
    private final InstitucionAccessService accessService;

    public List<EventoResponse> findAll(Long institucionId) {
        Long alcance = accessService.institucionActual().orElse(institucionId);
        List<Evento> eventos = institucionId == null
                ? (alcance == null ? repository.findAll() : repository.findByInstitucionIdOrderByAnioDesc(alcance))
                : repository.findByInstitucionIdOrderByAnioDesc(alcance);
        return eventos.stream().map(this::toResponse).toList();
    }

    @Transactional
    public EventoResponse create(EventoRequest request) {
        Evento evento = new Evento();
        apply(evento, request);
        return toResponse(repository.save(evento));
    }

    @Transactional
    public EventoResponse update(Long id, EventoRequest request) {
        Evento evento = getEntity(id);
        eventoReglaService.validarTransicion(evento, request.estado());
        apply(evento, request);
        return toResponse(repository.save(evento));
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(getEntity(id));
    }

    @Transactional
    public EventoResponse replicarSiguienteEdicion(Long id, ReplicarEventoRequest request) {
        Evento origen = getEntity(id);
        List<CategoriaEvento> categoriasOrigen =
                categoriaRepository.findByEventoIdOrderByNombreAsc(origen.getId());
        if (categoriasOrigen.isEmpty()) {
            throw new BusinessException("El evento no tiene categorías para replicar");
        }

        Evento nuevo = new Evento();
        int siguienteAnio = origen.getAnio() + 1;
        String nombre = origen.getNombre().contains(origen.getAnio().toString())
                ? origen.getNombre().replace(origen.getAnio().toString(), String.valueOf(siguienteAnio))
                : origen.getNombre() + " " + siguienteAnio;
        nuevo.setNombre(nombre);
        nuevo.setAnio(siguienteAnio);
        nuevo.setFechaInicio(origen.getFechaInicio().plusYears(1));
        nuevo.setFechaFin(origen.getFechaFin().plusYears(1));
        nuevo.setEstado(EstadoEvento.BORRADOR);
        nuevo.setInstitucion(origen.getInstitucion());
        nuevo = repository.save(nuevo);

        List<Pais> paises = request.conservarPaises()
                ? categoriasOrigen.stream().map(CategoriaEvento::getPais).toList()
                : paisesAleatorios(categoriasOrigen.size());
        for (int i = 0; i < categoriasOrigen.size(); i++) {
            CategoriaEvento origenCategoria = categoriasOrigen.get(i);
            CategoriaEvento nuevaCategoria = new CategoriaEvento();
            nuevaCategoria.setNombre(origenCategoria.getNombre());
            nuevaCategoria.setNivel(origenCategoria.getNivel());
            nuevaCategoria.setDescripcion(origenCategoria.getDescripcion());
            nuevaCategoria.setEvento(nuevo);
            nuevaCategoria.setPais(paises.get(i));
            categoriaRepository.save(nuevaCategoria);
        }
        return toResponse(nuevo);
    }

    public Evento getEntity(Long id) {
        Evento evento = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evento no encontrado con id " + id));
        accessService.validar(evento.getInstitucion().getId());
        return evento;
    }

    private void apply(Evento evento, EventoRequest request) {
        if (request.fechaFin().isBefore(request.fechaInicio())) {
            throw new BusinessException("La fecha final no puede ser anterior a la fecha inicial");
        }
        evento.setNombre(request.nombre().trim());
        evento.setAnio(request.anio());
        evento.setFechaInicio(request.fechaInicio());
        evento.setFechaFin(request.fechaFin());
        evento.setEstado(request.estado());
        evento.setInstitucion(institucionService.getEntity(request.institucionId()));
    }

    public EventoResponse toResponse(Evento evento) {
        return new EventoResponse(evento.getId(), evento.getNombre(), evento.getAnio(),
                evento.getFechaInicio(), evento.getFechaFin(), evento.getEstado(),
                evento.getInstitucion().getId(), evento.getInstitucion().getNombre());
    }

    private List<Pais> paisesAleatorios(int cantidad) {
        List<Pais> disponibles = new ArrayList<>(paisRepository.findByActivoTrueOrderByNombreAsc());
        if (disponibles.size() < cantidad) {
            throw new BusinessException("No hay suficientes países activos para reasignar todas las categorías");
        }
        Collections.shuffle(disponibles, new SecureRandom());
        return disponibles.subList(0, cantidad);
    }
}
