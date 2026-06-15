package com.sistema.olimpiadas_peru.participante.service;

import com.sistema.olimpiadas_peru.common.enums.Genero;
import com.sistema.olimpiadas_peru.common.enums.RolParticipante;
import com.sistema.olimpiadas_peru.common.exception.BusinessException;
import com.sistema.olimpiadas_peru.common.exception.ResourceNotFoundException;
import com.sistema.olimpiadas_peru.equipo.entity.Equipo;
import com.sistema.olimpiadas_peru.equipo.service.EquipoService;
import com.sistema.olimpiadas_peru.evento.service.EventoReglaService;
import com.sistema.olimpiadas_peru.auth1.security.InstitucionAccessService;
import com.sistema.olimpiadas_peru.participante.dto.ParticipanteRequest;
import com.sistema.olimpiadas_peru.participante.dto.ParticipanteResponse;
import com.sistema.olimpiadas_peru.participante.entity.Participante;
import com.sistema.olimpiadas_peru.participante.repository.ParticipanteRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ParticipanteService {

    private final ParticipanteRepository participanteRepository;
    private final EquipoService equipoService;
    private final PlantillaEquipoService plantillaEquipoService;
    private final com.sistema.olimpiadas_peru.participante.repository.PlantillaEquipoRepository plantillaRepository;
    private final EventoReglaService eventoReglaService;
    private final InstitucionAccessService accessService;

    public List<ParticipanteResponse> findAll(Long equipoId) {
        if (equipoId != null) {
            var plantillas = plantillaRepository
                    .findByEquipoIdOrderByParticipanteApellidosAscParticipanteNombresAsc(equipoId);
            if (!plantillas.isEmpty()) {
                return plantillas.stream()
                        .map(plantilla -> toResponse(plantilla.getParticipante(), plantilla.getEquipo(),
                                plantilla.getRol(), plantilla.getNumeroCamiseta()))
                        .toList();
            }
            return participanteRepository.findByEquipoIdOrderByApellidosAscNombresAsc(equipoId)
                    .stream().map(this::toResponse).toList();
        }
        return participanteRepository.findAll().stream()
                .filter(item -> accessService.institucionActual()
                        .map(id -> id.equals(item.getEquipo().getInstitucion().getId())).orElse(true))
                .map(this::toResponse).toList();
    }

    public ParticipanteResponse findById(Long id) {
        return toResponse(getEntity(id));
    }

    @Transactional
    public ParticipanteResponse create(ParticipanteRequest request) {
        participanteRepository.findByNumeroDocumento(request.numeroDocumento())
                .ifPresent(existing -> {
                    throw new BusinessException("Ya existe un participante con ese numero de documento");
                });

        Participante participante = new Participante();
        applyChanges(participante, request);
        Participante guardado = participanteRepository.save(participante);
        plantillaEquipoService.create(new com.sistema.olimpiadas_peru.participante.dto.PlantillaEquipoRequest(
                guardado.getId(), request.equipoId(), request.rolEquipo(), request.numeroCamiseta()), guardado);
        return toResponse(guardado);
    }

    @Transactional
    public ParticipanteResponse update(Long id, ParticipanteRequest request) {
        Participante participante = getEntity(id);
        participanteRepository.findByNumeroDocumento(request.numeroDocumento())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new BusinessException("Ya existe un participante con ese numero de documento");
                });

        applyChanges(participante, request);
        return toResponse(participanteRepository.save(participante));
    }

    @Transactional
    public void delete(Long id) {
        Participante participante = getEntity(id);
        plantillaRepository.deleteByParticipanteId(id);
        participanteRepository.delete(participante);
    }

    public Participante getEntity(Long id) {
        Participante participante = participanteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Participante no encontrado con id " + id));
        accessService.validar(participante.getEquipo().getInstitucion().getId());
        return participante;
    }

    private void applyChanges(Participante participante, ParticipanteRequest request) {
        Equipo equipo = equipoService.getEntity(request.equipoId());
        if (equipo.getCategoriaEvento() != null) {
            eventoReglaService.validarInscripciones(equipo.getCategoriaEvento().getEvento());
        }
        validarGeneroCompatible(request.genero(), equipo);

        participante.setNombres(request.nombres());
        participante.setApellidos(request.apellidos());
        participante.setNumeroDocumento(request.numeroDocumento());
        participante.setGenero(request.genero());
        participante.setFechaNacimiento(request.fechaNacimiento());
        participante.setCodigoEstudiante(request.codigoEstudiante());
        participante.setRolEquipo(request.rolEquipo() == null ? RolParticipante.JUGADOR : request.rolEquipo());
        participante.setNumeroCamiseta(request.numeroCamiseta());
        participante.setFotografiaUrl(request.fotografiaUrl());
        participante.setEquipo(equipo);
    }

    private void validarGeneroCompatible(Genero generoParticipante, Equipo equipo) {
        if (equipo.getGenero() != Genero.MIXTO && equipo.getGenero() != generoParticipante) {
            throw new BusinessException("El genero del participante no coincide con el genero del equipo");
        }
    }

    private ParticipanteResponse toResponse(Participante participante) {
        return toResponse(participante, participante.getEquipo(), participante.getRolEquipo(),
                participante.getNumeroCamiseta());
    }

    private ParticipanteResponse toResponse(Participante participante, Equipo equipo,
                                            RolParticipante rol, Integer numeroCamiseta) {
        var categoria = equipo.getCategoriaEvento();
        var deporte = equipo.getDeporte();
        return new ParticipanteResponse(
                participante.getId(),
                participante.getNombres(),
                participante.getApellidos(),
                participante.getNumeroDocumento(),
                participante.getGenero(),
                participante.getFechaNacimiento(),
                participante.getCodigoEstudiante(),
                equipo.getId(),
                equipo.getNombre(),
                equipo.getInstitucion().getId(),
                equipo.getInstitucion().getNombre(),
                rol,
                numeroCamiseta,
                participante.getFotografiaUrl(),
                categoria == null ? null : categoria.getId(),
                categoria == null ? null : categoria.getNombre(),
                categoria == null ? null : categoria.getPais().getNombre(),
                categoria == null ? null : categoria.getPais().getBandera(),
                deporte == null ? null : deporte.getId(),
                deporte == null ? null : deporte.getNombre());
    }
}
