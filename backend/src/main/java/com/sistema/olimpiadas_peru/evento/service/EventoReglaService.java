package com.sistema.olimpiadas_peru.evento.service;

import com.sistema.olimpiadas_peru.categoria.entity.CategoriaEvento;
import com.sistema.olimpiadas_peru.categoria.repository.CategoriaEventoRepository;
import com.sistema.olimpiadas_peru.common.enums.EstadoEvento;
import com.sistema.olimpiadas_peru.common.enums.EstadoInscripcion;
import com.sistema.olimpiadas_peru.common.exception.BusinessException;
import com.sistema.olimpiadas_peru.deporte.entity.Deporte;
import com.sistema.olimpiadas_peru.deporte.repository.DeporteRepository;
import com.sistema.olimpiadas_peru.equipo.entity.Equipo;
import com.sistema.olimpiadas_peru.equipo.repository.EquipoRepository;
import com.sistema.olimpiadas_peru.evento.entity.Evento;
import com.sistema.olimpiadas_peru.inscripcion.repository.InscripcionRepository;
import com.sistema.olimpiadas_peru.participante.repository.ParticipanteRepository;
import com.sistema.olimpiadas_peru.participante.repository.PlantillaEquipoRepository;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EventoReglaService {

    private static final Set<String> DEPORTES_OBLIGATORIOS =
            Set.of("FUTBOL", "BASQUET", "VOLEY", "PING_PONG");

    private final CategoriaEventoRepository categoriaRepository;
    private final DeporteRepository deporteRepository;
    private final EquipoRepository equipoRepository;
    private final InscripcionRepository inscripcionRepository;
    private final PlantillaEquipoRepository plantillaRepository;
    private final ParticipanteRepository participanteRepository;

    public void validarTransicion(Evento evento, EstadoEvento nuevoEstado) {
        EstadoEvento actual = evento.getEstado();
        if (actual == null || actual == nuevoEstado) {
            if (nuevoEstado == EstadoEvento.EN_CURSO) {
                validarEventoListo(evento);
            }
            return;
        }

        boolean permitida = switch (actual) {
            case BORRADOR -> nuevoEstado == EstadoEvento.INSCRIPCIONES;
            case INSCRIPCIONES -> nuevoEstado == EstadoEvento.EN_CURSO;
            case EN_CURSO -> nuevoEstado == EstadoEvento.FINALIZADO;
            case FINALIZADO -> false;
        };
        if (!permitida) {
            throw new BusinessException("Transición de evento no permitida: " + actual + " -> " + nuevoEstado);
        }
        if (nuevoEstado == EstadoEvento.EN_CURSO) {
            validarEventoListo(evento);
        }
    }

    public void validarConfiguracion(Evento evento) {
        validarEstado(evento, Set.of(EstadoEvento.BORRADOR, EstadoEvento.INSCRIPCIONES),
                "La configuración del evento ya está cerrada");
    }

    public void validarInscripciones(Evento evento) {
        validarEstado(evento, Set.of(EstadoEvento.INSCRIPCIONES),
                "El evento no se encuentra en etapa de inscripciones");
    }

    public void validarCompetencia(Evento evento) {
        validarEstado(evento, Set.of(EstadoEvento.EN_CURSO),
                "El evento debe estar EN_CURSO para realizar esta operación");
    }

    public void validarSorteo(Evento evento) {
        validarEstado(evento, Set.of(EstadoEvento.INSCRIPCIONES, EstadoEvento.EN_CURSO),
                "El sorteo solo puede realizarse durante inscripciones o con el evento en curso");
    }

    private void validarEventoListo(Evento evento) {
        List<CategoriaEvento> categorias = categoriaRepository.findByEventoIdOrderByNombreAsc(evento.getId());
        if (categorias.isEmpty()) {
            throw new BusinessException("El evento necesita al menos una categoría antes de iniciar");
        }

        List<Deporte> obligatorios = deporteRepository.findAll().stream()
                .filter(deporte -> DEPORTES_OBLIGATORIOS.contains(normalizar(deporte.getNombre())))
                .toList();
        Set<String> encontrados = obligatorios.stream().map(deporte -> normalizar(deporte.getNombre()))
                .collect(java.util.stream.Collectors.toSet());
        if (!encontrados.containsAll(DEPORTES_OBLIGATORIOS)) {
            throw new BusinessException("El catálogo debe contener Fútbol, Básquet, Vóley y Ping Pong");
        }

        for (CategoriaEvento categoria : categorias) {
            List<Equipo> equipos = equipoRepository.findByCategoriaEventoIdOrderByDeporteNombreAsc(categoria.getId());
            for (Deporte deporte : obligatorios) {
                Equipo equipo = equipos.stream()
                        .filter(item -> item.getDeporte() != null
                                && item.getDeporte().getId().equals(deporte.getId()))
                        .findFirst()
                        .orElseThrow(() -> new BusinessException("La categoría " + categoria.getNombre()
                                + " no tiene equipo para " + deporte.getNombre()));

                inscripcionRepository.findByEquipoIdAndDeporteIdAndEstado(
                                equipo.getId(), deporte.getId(), EstadoInscripcion.CONFIRMADA)
                        .orElseThrow(() -> new BusinessException("Falta confirmar la inscripción de "
                                + equipo.getNombre() + " en " + deporte.getNombre()));

                long integrantes = plantillaRepository.countByEquipoId(equipo.getId());
                if (integrantes == 0) {
                    integrantes = participanteRepository.countByEquipoId(equipo.getId());
                }
                if (integrantes < deporte.getNumeroJugadores()) {
                    throw new BusinessException("El equipo " + equipo.getNombre() + " requiere "
                            + deporte.getNumeroJugadores() + " participantes y tiene " + integrantes);
                }
            }
        }
    }

    private void validarEstado(Evento evento, Set<EstadoEvento> permitidos, String mensaje) {
        if (evento != null && !permitidos.contains(evento.getEstado())) {
            throw new BusinessException(mensaje + ". Estado actual: " + evento.getEstado());
        }
    }

    private String normalizar(String nombre) {
        return nombre == null ? "" : nombre.trim().toUpperCase(Locale.ROOT)
                .replace(' ', '_').replace('-', '_');
    }
}
