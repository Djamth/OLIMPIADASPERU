package com.sistema.olimpiadas_peru.sorteo.service;

import com.sistema.olimpiadas_peru.common.exception.BusinessException;
import com.sistema.olimpiadas_peru.deporte.entity.Deporte;
import com.sistema.olimpiadas_peru.deporte.service.DeporteService;
import com.sistema.olimpiadas_peru.inscripcion.entity.Inscripcion;
import com.sistema.olimpiadas_peru.inscripcion.repository.InscripcionRepository;
import com.sistema.olimpiadas_peru.sorteo.dto.GrupoEquipoResponse;
import com.sistema.olimpiadas_peru.sorteo.dto.GrupoResponse;
import com.sistema.olimpiadas_peru.sorteo.entity.Grupo;
import com.sistema.olimpiadas_peru.sorteo.entity.GrupoEquipo;
import com.sistema.olimpiadas_peru.sorteo.repository.GrupoEquipoRepository;
import com.sistema.olimpiadas_peru.sorteo.repository.GrupoRepository;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SorteoService {

    private final GrupoRepository grupoRepository;
    private final GrupoEquipoRepository grupoEquipoRepository;
    private final InscripcionRepository inscripcionRepository;
    private final DeporteService deporteService;

    @Transactional
    public List<GrupoResponse> generarGrupos(Long deporteId) {
        Deporte deporte = deporteService.getEntity(deporteId);
        List<Inscripcion> inscripciones = inscripcionRepository.findByDeporteId(deporteId);

        if (inscripciones.size() < 2) {
            throw new BusinessException("Se requieren al menos dos equipos inscritos para realizar el sorteo");
        }

        grupoEquipoRepository.deleteByGrupoDeporteId(deporteId);
        grupoRepository.deleteByDeporteId(deporteId);

        List<Inscripcion> mezcladas = new ArrayList<>(inscripciones);
        Collections.shuffle(mezcladas);

        int equiposPorGrupo = deporte.getMaximoEquiposPorGrupo();
        int totalGrupos = (int) Math.ceil((double) mezcladas.size() / equiposPorGrupo);

        List<Grupo> grupos = new ArrayList<>();
        for (int i = 0; i < totalGrupos; i++) {
            Grupo grupo = new Grupo();
            grupo.setNombre("Grupo " + (char) ('A' + i));
            grupo.setDeporte(deporte);
            grupos.add(grupoRepository.save(grupo));
        }

        for (int i = 0; i < mezcladas.size(); i++) {
            Grupo grupo = grupos.get(i % totalGrupos);
            GrupoEquipo grupoEquipo = new GrupoEquipo();
            grupoEquipo.setGrupo(grupo);
            grupoEquipo.setEquipo(mezcladas.get(i).getEquipo());
            grupoEquipo.setPosicion((i / totalGrupos) + 1);
            grupoEquipoRepository.save(grupoEquipo);
        }

        return listarPorDeporte(deporteId);
    }

    public List<GrupoResponse> listarPorDeporte(Long deporteId) {
        return grupoRepository.findByDeporteIdOrderByNombreAsc(deporteId).stream()
                .map(this::toResponse)
                .toList();
    }

    private GrupoResponse toResponse(Grupo grupo) {
        List<GrupoEquipoResponse> equipos = grupoEquipoRepository.findByGrupoId(grupo.getId()).stream()
                .map(ge -> new GrupoEquipoResponse(ge.getEquipo().getId(), ge.getEquipo().getNombre(), ge.getPosicion()))
                .toList();

        return new GrupoResponse(
                grupo.getId(),
                grupo.getNombre(),
                grupo.getDeporte().getId(),
                grupo.getDeporte().getNombre(),
                equipos);
    }
}
