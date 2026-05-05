package com.sistema.olimpiadas_peru.resultado.service;

import com.sistema.olimpiadas_peru.common.enums.EstadoPartido;
import com.sistema.olimpiadas_peru.common.exception.BusinessException;
import com.sistema.olimpiadas_peru.common.exception.ResourceNotFoundException;
import com.sistema.olimpiadas_peru.programacion.entity.Partido;
import com.sistema.olimpiadas_peru.programacion.service.ProgramacionService;
import com.sistema.olimpiadas_peru.resultado.dto.ResultadoRequest;
import com.sistema.olimpiadas_peru.resultado.dto.ResultadoResponse;
import com.sistema.olimpiadas_peru.resultado.entity.Resultado;
import com.sistema.olimpiadas_peru.resultado.repository.ResultadoRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ResultadoService {

    private final ResultadoRepository resultadoRepository;
    private final ProgramacionService programacionService;
    public List<ResultadoResponse> findAll(Long deporteId) {
        List<Resultado> resultados = deporteId == null
                ? resultadoRepository.findAll()
                : resultadoRepository.findByPartidoDeporteId(deporteId);
        return resultados.stream().map(this::toResponse).toList();
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
        applyChanges(resultado, request);
        return toResponse(resultadoRepository.save(resultado));
    }

    @Transactional
    public void delete(Long id) {
        resultadoRepository.delete(getEntity(id));
    }

    public Resultado getEntity(Long id) {
        return resultadoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resultado no encontrado con id " + id));
    }

    private void applyChanges(Resultado resultado, ResultadoRequest request) {
        Partido partido = programacionService.getEntity(request.partidoId());
        partido.setEstado(EstadoPartido.FINALIZADO);
        resultado.setPartido(partido);
        resultado.setPuntajeLocal(request.puntajeLocal());
        resultado.setPuntajeVisitante(request.puntajeVisitante());
        resultado.setObservaciones(request.observaciones());
        resultado.setGoleadores(request.goleadores());
    }

    private ResultadoResponse toResponse(Resultado resultado) {
        return new ResultadoResponse(
                resultado.getId(),
                resultado.getPartido().getId(),
                resultado.getPartido().getDeporte().getNombre(),
                resultado.getPartido().getEquipoLocal().getNombre(),
                resultado.getPartido().getEquipoVisitante().getNombre(),
                resultado.getPuntajeLocal(),
                resultado.getPuntajeVisitante(),
                resultado.getObservaciones(),
                resultado.getGoleadores());
    }
}
