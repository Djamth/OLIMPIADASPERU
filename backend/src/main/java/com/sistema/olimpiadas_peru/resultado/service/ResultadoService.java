package com.sistema.olimpiadas_peru.resultado.service;

import com.sistema.olimpiadas_peru.common.enums.EstadoPartido;
import com.sistema.olimpiadas_peru.common.exception.BusinessException;
import com.sistema.olimpiadas_peru.common.exception.ResourceNotFoundException;
import com.sistema.olimpiadas_peru.participante.entity.Participante;
import com.sistema.olimpiadas_peru.participante.service.ParticipanteService;
import com.sistema.olimpiadas_peru.deporte.service.ReglaDeporteService;
import com.sistema.olimpiadas_peru.participante.service.PlantillaEquipoService;
import com.sistema.olimpiadas_peru.equipo.entity.Equipo;
import com.sistema.olimpiadas_peru.programacion.entity.Partido;
import com.sistema.olimpiadas_peru.programacion.service.ProgramacionService;
import com.sistema.olimpiadas_peru.evento.service.EventoReglaService;
import com.sistema.olimpiadas_peru.auth1.security.InstitucionAccessService;
import com.sistema.olimpiadas_peru.resultado.dto.ResultadoAnotacionRequest;
import com.sistema.olimpiadas_peru.resultado.dto.ResultadoAnotacionResponse;
import com.sistema.olimpiadas_peru.resultado.dto.ResultadoRequest;
import com.sistema.olimpiadas_peru.resultado.dto.ResultadoResponse;
import com.sistema.olimpiadas_peru.resultado.entity.Resultado;
import com.sistema.olimpiadas_peru.resultado.entity.ResultadoAnotacion;
import com.sistema.olimpiadas_peru.resultado.repository.ResultadoAnotacionRepository;
import com.sistema.olimpiadas_peru.resultado.repository.ResultadoRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResultadoService {

    private final ResultadoRepository resultadoRepository;
    private final ResultadoAnotacionRepository resultadoAnotacionRepository;
    private final ProgramacionService programacionService;
    private final ParticipanteService participanteService;
    private final ReglaDeporteService reglaDeporteService;
    private final PlantillaEquipoService plantillaEquipoService;
    private final EventoReglaService eventoReglaService;
    private final InstitucionAccessService accessService;

    public List<ResultadoResponse> findAll(Long deporteId) {
        List<Resultado> resultados = deporteId == null
                ? resultadoRepository.findAll()
                : resultadoRepository.findByPartidoDeporteId(deporteId);
        return resultados.stream().filter(this::estaEnAlcance).map(this::toResponse).toList();
    }

    public List<ResultadoResponse> findAll(Long eventoId, Long deporteId) {
        if (eventoId == null) {
            return findAll(deporteId);
        }
        if (deporteId == null) {
            return resultadoRepository.findAll().stream().filter(this::estaEnAlcance)
                    .filter(resultado -> resultado.getPartido().getEquipoLocal().getCategoriaEvento() != null
                            && eventoId.equals(resultado.getPartido().getEquipoLocal()
                            .getCategoriaEvento().getEvento().getId()))
                    .map(this::toResponse)
                    .toList();
        }
        return resultadoRepository
                .findByPartidoEquipoLocalCategoriaEventoEventoIdAndPartidoDeporteId(eventoId, deporteId)
                .stream().filter(this::estaEnAlcance).map(this::toResponse).toList();
    }

    public ResultadoResponse findById(Long id) {
        return toResponse(getEntity(id));
    }

    @Transactional
    public ResultadoResponse create(ResultadoRequest request) {
        resultadoRepository.findByPartidoId(request.partidoId())
                .ifPresent(existing -> {
                    throw new BusinessException("El partido ya tiene un resultado registrado");
                });

        Resultado resultado = new Resultado();
        applyChanges(resultado, request);
        return toResponse(resultadoRepository.save(resultado));
    }

    @Transactional
    public ResultadoResponse update(Long id, ResultadoRequest request) {
        Resultado resultado = getEntity(id);
        resultadoRepository.findByPartidoId(request.partidoId())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new BusinessException("El partido ya tiene un resultado registrado");
                });
        applyChanges(resultado, request);
        return toResponse(resultadoRepository.save(resultado));
    }

    @Transactional
    public void delete(Long id) {
        Resultado resultado = getEntity(id);
        resultado.getPartido().setEstado(EstadoPartido.PROGRAMADO);
        resultadoRepository.delete(resultado);
    }

    public Resultado getEntity(Long id) {
        Resultado resultado = resultadoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resultado no encontrado con id " + id));
        accessService.validar(resultado.getPartido().getEquipoLocal().getInstitucion().getId());
        return resultado;
    }

    private void applyChanges(Resultado resultado, ResultadoRequest request) {
        Partido partido = programacionService.getEntity(request.partidoId());
        if (partido.getEquipoLocal().getCategoriaEvento() != null) {
            eventoReglaService.validarCompetencia(
                    partido.getEquipoLocal().getCategoriaEvento().getEvento());
        }
        partido.setEstado(EstadoPartido.FINALIZADO);
        resultado.setPartido(partido);
        resultado.setPuntajeLocal(request.puntajeLocal());
        resultado.setPuntajeVisitante(request.puntajeVisitante());
        resultado.setObservaciones(request.observaciones());
        resultado.getAnotaciones().clear();

        List<ResultadoAnotacionRequest> anotaciones = request.anotaciones() == null ? List.of() : request.anotaciones();
        validarParticipantes(partido, anotaciones);
        reglaDeporteService.validarResultado(partido.getDeporte(), partido.getEquipoLocal(),
                partido.getEquipoVisitante(), request.puntajeLocal(), request.puntajeVisitante(),
                anotaciones, participanteService, plantillaEquipoService);
        for (ResultadoAnotacionRequest anotacionRequest : anotaciones) {
            Participante participante = participanteService.getEntity(anotacionRequest.participanteId());
            ResultadoAnotacion anotacion = new ResultadoAnotacion();
            anotacion.setResultado(resultado);
            anotacion.setParticipante(participante);
            anotacion.setCantidad(anotacionRequest.cantidad());
            resultado.getAnotaciones().add(anotacion);
        }
    }

    private ResultadoResponse toResponse(Resultado resultado) {
        List<ResultadoAnotacionResponse> anotaciones = resultadoAnotacionRepository.findByResultadoId(resultado.getId()).stream()
                .map(anotacion -> {
                    Equipo equipo = equipoDelPartido(resultado.getPartido(), anotacion.getParticipante().getId());
                    return new ResultadoAnotacionResponse(
                            anotacion.getParticipante().getId(),
                            anotacion.getParticipante().getNombres() + " " + anotacion.getParticipante().getApellidos(),
                            equipo.getId(),
                            equipo.getNombre(),
                            anotacion.getCantidad());
                })
                .toList();

        return new ResultadoResponse(
                resultado.getId(),
                resultado.getPartido().getId(),
                resultado.getPartido().getDeporte().getNombre(),
                resultado.getPartido().getEquipoLocal().getNombre(),
                resultado.getPartido().getEquipoVisitante().getNombre(),
                resultado.getPuntajeLocal(),
                resultado.getPuntajeVisitante(),
                resultado.getObservaciones(),
                anotaciones);
    }

    private void validarParticipantes(Partido partido, List<ResultadoAnotacionRequest> anotaciones) {
        for (ResultadoAnotacionRequest anotacion : anotaciones) {
            Participante participante = participanteService.getEntity(anotacion.participanteId());
            boolean perteneceAlPartido = plantillaEquipoService.pertenece(
                    participante.getId(), partido.getEquipoLocal().getId())
                    || plantillaEquipoService.pertenece(
                    participante.getId(), partido.getEquipoVisitante().getId());
            if (!perteneceAlPartido) {
                throw new BusinessException("Todos los participantes anotados deben pertenecer a uno de los equipos del partido");
            }
        }
    }

    private Equipo equipoDelPartido(Partido partido, Long participanteId) {
        if (plantillaEquipoService.pertenece(participanteId, partido.getEquipoLocal().getId())) {
            return partido.getEquipoLocal();
        }
        if (plantillaEquipoService.pertenece(participanteId, partido.getEquipoVisitante().getId())) {
            return partido.getEquipoVisitante();
        }
        return participanteService.getEntity(participanteId).getEquipo();
    }

    private boolean estaEnAlcance(Resultado resultado) {
        return accessService.institucionActual()
                .map(id -> id.equals(resultado.getPartido().getEquipoLocal().getInstitucion().getId()))
                .orElse(true);
    }
}
