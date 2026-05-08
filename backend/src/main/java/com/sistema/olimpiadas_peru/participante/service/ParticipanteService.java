package com.sistema.olimpiadas_peru.participante.service;

import com.sistema.olimpiadas_peru.common.enums.Genero;
import com.sistema.olimpiadas_peru.common.exception.BusinessException;
import com.sistema.olimpiadas_peru.common.exception.ResourceNotFoundException;
import com.sistema.olimpiadas_peru.equipo.entity.Equipo;
import com.sistema.olimpiadas_peru.equipo.service.EquipoService;
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
public class ParticipanteService {

    private final ParticipanteRepository participanteRepository;
    private final EquipoService equipoService;

    public List<ParticipanteResponse> findAll(Long equipoId) {
        List<Participante> participantes = equipoId == null
                ? participanteRepository.findAll()
                : participanteRepository.findByEquipoIdOrderByApellidosAscNombresAsc(equipoId);
        return participantes.stream().map(this::toResponse).toList();
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
        return toResponse(participanteRepository.save(participante));
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
        participanteRepository.delete(getEntity(id));
    }

    public Participante getEntity(Long id) {
        return participanteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Participante no encontrado con id " + id));
    }

    private void applyChanges(Participante participante, ParticipanteRequest request) {
        Equipo equipo = equipoService.getEntity(request.equipoId());
        validarGeneroCompatible(request.genero(), equipo);

        participante.setNombres(request.nombres());
        participante.setApellidos(request.apellidos());
        participante.setNumeroDocumento(request.numeroDocumento());
        participante.setGenero(request.genero());
        participante.setFechaNacimiento(request.fechaNacimiento());
        participante.setCodigoEstudiante(request.codigoEstudiante());
        participante.setEquipo(equipo);
    }

    private void validarGeneroCompatible(Genero generoParticipante, Equipo equipo) {
        if (equipo.getGenero() != Genero.MIXTO && equipo.getGenero() != generoParticipante) {
            throw new BusinessException("El genero del participante no coincide con el genero del equipo");
        }
    }

    private ParticipanteResponse toResponse(Participante participante) {
        return new ParticipanteResponse(
                participante.getId(),
                participante.getNombres(),
                participante.getApellidos(),
                participante.getNumeroDocumento(),
                participante.getGenero(),
                participante.getFechaNacimiento(),
                participante.getCodigoEstudiante(),
                participante.getEquipo().getId(),
                participante.getEquipo().getNombre(),
                participante.getEquipo().getInstitucion().getId(),
                participante.getEquipo().getInstitucion().getNombre());
    }
}
