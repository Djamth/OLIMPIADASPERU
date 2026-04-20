package com.sistema.olimpiadas_peru.programacion.service;

import com.sistema.olimpiadas_peru.common.exception.BusinessException;
import com.sistema.olimpiadas_peru.common.exception.ResourceNotFoundException;
import com.sistema.olimpiadas_peru.deporte.service.DeporteService;
import com.sistema.olimpiadas_peru.equipo.service.EquipoService;
import com.sistema.olimpiadas_peru.programacion.dto.PartidoRequest;
import com.sistema.olimpiadas_peru.programacion.dto.PartidoResponse;
import com.sistema.olimpiadas_peru.programacion.entity.Partido;
import com.sistema.olimpiadas_peru.programacion.repository.PartidoRepository;
import com.sistema.olimpiadas_peru.sorteo.entity.Grupo;
import com.sistema.olimpiadas_peru.sorteo.repository.GrupoRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProgramacionService {

    private final PartidoRepository partidoRepository;
    private final GrupoRepository grupoRepository;
    private final DeporteService deporteService;
    private final EquipoService equipoService;

    public List<PartidoResponse> findAll(Long deporteId) {
        List<Partido> partidos = deporteId == null
                ? partidoRepository.findAll()
                : partidoRepository.findByDeporteIdOrderByFechaHoraAsc(deporteId);
        return partidos.stream().map(this::toResponse).toList();
    }

    public PartidoResponse findById(Long id) {
        return toResponse(getEntity(id));
    }

    @Transactional
    public PartidoResponse create(PartidoRequest request) {
        validarEquipos(request);
        Partido partido = new Partido();
        applyChanges(partido, request);
        return toResponse(partidoRepository.save(partido));
    }

    @Transactional
    public PartidoResponse update(Long id, PartidoRequest request) {
        validarEquipos(request);
        Partido partido = getEntity(id);
        applyChanges(partido, request);
        return toResponse(partidoRepository.save(partido));
    }

    @Transactional
    public void delete(Long id) {
        partidoRepository.delete(getEntity(id));
    }

    public Partido getEntity(Long id) {
        return partidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Partido no encontrado con id " + id));
    }

    private void validarEquipos(PartidoRequest request) {
        if (request.equipoLocalId().equals(request.equipoVisitanteId())) {
            throw new BusinessException("Un equipo no puede jugar contra si mismo");
        }
    }

    private void applyChanges(Partido partido, PartidoRequest request) {
        Grupo grupo = request.grupoId() == null ? null : grupoRepository.findById(request.grupoId())
                .orElseThrow(() -> new ResourceNotFoundException("Grupo no encontrado con id " + request.grupoId()));
        partido.setGrupo(grupo);
        partido.setDeporte(deporteService.getEntity(request.deporteId()));
        partido.setEquipoLocal(equipoService.getEntity(request.equipoLocalId()));
        partido.setEquipoVisitante(equipoService.getEntity(request.equipoVisitanteId()));
        partido.setFechaHora(request.fechaHora());
        partido.setSede(request.sede());
        partido.setEstado(request.estado());
    }

    private PartidoResponse toResponse(Partido partido) {
        return new PartidoResponse(
                partido.getId(),
                partido.getGrupo() != null ? partido.getGrupo().getId() : null,
                partido.getGrupo() != null ? partido.getGrupo().getNombre() : null,
                partido.getDeporte().getId(),
                partido.getDeporte().getNombre(),
                partido.getEquipoLocal().getId(),
                partido.getEquipoLocal().getNombre(),
                partido.getEquipoVisitante().getId(),
                partido.getEquipoVisitante().getNombre(),
                partido.getFechaHora(),
                partido.getSede(),
                partido.getEstado());
    }
}
