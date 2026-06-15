package com.sistema.olimpiadas_peru.participante.service;

import com.sistema.olimpiadas_peru.common.enums.RolParticipante;
import com.sistema.olimpiadas_peru.common.exception.BusinessException;
import com.sistema.olimpiadas_peru.common.exception.ResourceNotFoundException;
import com.sistema.olimpiadas_peru.equipo.entity.Equipo;
import com.sistema.olimpiadas_peru.equipo.service.EquipoService;
import com.sistema.olimpiadas_peru.evento.service.EventoReglaService;
import com.sistema.olimpiadas_peru.participante.dto.PlantillaEquipoRequest;
import com.sistema.olimpiadas_peru.participante.dto.PlantillaEquipoResponse;
import com.sistema.olimpiadas_peru.participante.entity.Participante;
import com.sistema.olimpiadas_peru.participante.entity.PlantillaEquipo;
import com.sistema.olimpiadas_peru.participante.repository.PlantillaEquipoRepository;
import com.sistema.olimpiadas_peru.participante.repository.ParticipanteRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlantillaEquipoService {

    private final PlantillaEquipoRepository repository;
    private final EquipoService equipoService;
    private final ParticipanteRepository participanteRepository;
    private final EventoReglaService eventoReglaService;

    public List<PlantillaEquipoResponse> findAll(Long equipoId, Long participanteId) {
        List<PlantillaEquipo> plantillas;
        if (equipoId != null) {
            plantillas = repository.findByEquipoIdOrderByParticipanteApellidosAscParticipanteNombresAsc(equipoId);
        } else if (participanteId != null) {
            plantillas = repository.findByParticipanteId(participanteId);
        } else {
            plantillas = repository.findAll();
        }
        return plantillas.stream().map(this::toResponse).toList();
    }

    @Transactional
    public PlantillaEquipoResponse create(PlantillaEquipoRequest request, Participante participante) {
        Equipo equipo = equipoService.getEntity(request.equipoId());
        if (equipo.getCategoriaEvento() != null) {
            eventoReglaService.validarInscripciones(equipo.getCategoriaEvento().getEvento());
        }
        validar(participante, equipo, null);
        PlantillaEquipo plantilla = new PlantillaEquipo();
        plantilla.setParticipante(participante);
        plantilla.setEquipo(equipo);
        plantilla.setRol(request.rol() == null ? RolParticipante.JUGADOR : request.rol());
        plantilla.setNumeroCamiseta(request.numeroCamiseta());
        return toResponse(repository.save(plantilla));
    }

    @Transactional
    public PlantillaEquipoResponse create(PlantillaEquipoRequest request, ParticipanteService participanteService) {
        return create(request, participanteService.getEntity(request.participanteId()));
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registro de plantilla no encontrado")));
    }

    public long countByEquipo(Long equipoId) {
        long count = repository.countByEquipoId(equipoId);
        return count == 0 ? -1 : count;
    }

    public boolean pertenece(Long participanteId, Long equipoId) {
        if (repository.existsByParticipanteIdAndEquipoId(participanteId, equipoId)) {
            return true;
        }
        return participanteRepository.findById(participanteId)
                .map(participante -> participante.getEquipo() != null
                        && participante.getEquipo().getId().equals(equipoId))
                .orElse(false);
    }

    private void validar(Participante participante, Equipo equipo, Long plantillaId) {
        if (repository.existsByParticipanteIdAndEquipoId(participante.getId(), equipo.getId())) {
            throw new BusinessException("El participante ya pertenece a este equipo");
        }
        if (equipo.getCategoriaEvento() != null && equipo.getDeporte() != null
                && repository.existsByParticipanteIdAndEquipoCategoriaEventoIdAndEquipoDeporteId(
                participante.getId(), equipo.getCategoriaEvento().getId(), equipo.getDeporte().getId())) {
            throw new BusinessException("El participante ya integra otro equipo del mismo deporte y categoría");
        }
        if (participante.getEquipo() != null
                && !participante.getEquipo().getInstitucion().getId().equals(equipo.getInstitucion().getId())) {
            throw new BusinessException("El participante no puede integrar equipos de otra institución");
        }
    }

    private PlantillaEquipoResponse toResponse(PlantillaEquipo plantilla) {
        Equipo equipo = plantilla.getEquipo();
        var categoria = equipo.getCategoriaEvento();
        return new PlantillaEquipoResponse(plantilla.getId(), plantilla.getParticipante().getId(),
                plantilla.getParticipante().getNombres() + " " + plantilla.getParticipante().getApellidos(),
                equipo.getId(), equipo.getNombre(),
                equipo.getDeporte() == null ? null : equipo.getDeporte().getId(),
                equipo.getDeporte() == null ? null : equipo.getDeporte().getNombre(),
                categoria == null ? null : categoria.getId(),
                categoria == null ? null : categoria.getNombre(),
                categoria == null ? null : categoria.getPais().getNombre(),
                plantilla.getRol(), plantilla.getNumeroCamiseta());
    }
}
