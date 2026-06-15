package com.sistema.olimpiadas_peru.deporte.service;

import com.sistema.olimpiadas_peru.common.enums.Genero;
import com.sistema.olimpiadas_peru.common.exception.BusinessException;
import com.sistema.olimpiadas_peru.deporte.entity.Deporte;
import com.sistema.olimpiadas_peru.equipo.entity.Equipo;
import java.util.Locale;
import java.util.List;
import com.sistema.olimpiadas_peru.resultado.dto.ResultadoAnotacionRequest;
import com.sistema.olimpiadas_peru.participante.service.ParticipanteService;
import com.sistema.olimpiadas_peru.participante.service.PlantillaEquipoService;
import org.springframework.stereotype.Service;

@Service
public class ReglaDeporteService {

    public void validarConfiguracionDeporte(String nombreDeporte, Integer numeroJugadores) {
        String nombreNormalizado = normalizar(nombreDeporte);
        Integer numeroEsperado = switch (nombreNormalizado) {
            case "FUTBOL" -> 11;
            case "BASQUET" -> 5;
            case "VOLEY" -> 6;
            case "PING_PONG" -> 1;
            default -> null;
        };

        if (numeroEsperado != null && !numeroEsperado.equals(numeroJugadores)) {
            throw new BusinessException("El deporte " + nombreNormalizado + " debe registrarse con " + numeroEsperado + " jugadores");
        }
    }

    public void validarInscripcion(Deporte deporte, Equipo equipo) {
        String nombreDeporte = normalizar(deporte.getNombre());
        Genero generoRequerido = switch (nombreDeporte) {
            case "FUTBOL", "BASQUET" -> Genero.MASCULINO;
            case "VOLEY" -> Genero.FEMENINO;
            case "PING_PONG" -> Genero.MIXTO;
            default -> null;
        };

        if (generoRequerido != null && equipo.getGenero() != generoRequerido) {
            throw new BusinessException("El deporte " + nombreDeporte + " solo permite equipos con genero " + generoRequerido);
        }
    }

    public void validarEquipoCompleto(Deporte deporte, long participantesRegistrados) {
        if (participantesRegistrados < deporte.getNumeroJugadores()) {
            throw new BusinessException("El equipo no cumple el minimo de participantes para "
                    + normalizar(deporte.getNombre()) + ": requiere "
                    + deporte.getNumeroJugadores() + " y solo tiene " + participantesRegistrados);
        }
    }

    public void validarResultado(Deporte deporte, Equipo local, Equipo visitante,
                                 int puntajeLocal, int puntajeVisitante,
                                 List<ResultadoAnotacionRequest> anotaciones,
                                 ParticipanteService participanteService,
                                 PlantillaEquipoService plantillaEquipoService) {
        String nombre = normalizar(deporte.getNombre());
        if (("BASQUET".equals(nombre) || "VOLEY".equals(nombre) || "PING_PONG".equals(nombre))
                && puntajeLocal == puntajeVisitante) {
            throw new BusinessException("El deporte " + nombre + " no permite resultados empatados");
        }
        if ("VOLEY".equals(nombre) && Math.max(puntajeLocal, puntajeVisitante) < 2) {
            throw new BusinessException("En voley el ganador debe alcanzar al menos 2 sets");
        }
        if ("PING_PONG".equals(nombre) && Math.max(puntajeLocal, puntajeVisitante) < 2) {
            throw new BusinessException("En ping pong el ganador debe alcanzar al menos 2 sets");
        }
        if (!anotaciones.isEmpty() && ("FUTBOL".equals(nombre) || "BASQUET".equals(nombre))) {
            int anotadoLocal = 0;
            int anotadoVisitante = 0;
            for (ResultadoAnotacionRequest anotacion : anotaciones) {
                participanteService.getEntity(anotacion.participanteId());
                if (plantillaEquipoService.pertenece(anotacion.participanteId(), local.getId())) {
                    anotadoLocal += anotacion.cantidad();
                } else if (plantillaEquipoService.pertenece(anotacion.participanteId(), visitante.getId())) {
                    anotadoVisitante += anotacion.cantidad();
                }
            }
            if (anotadoLocal != puntajeLocal || anotadoVisitante != puntajeVisitante) {
                throw new BusinessException("Las anotaciones individuales deben coincidir con el marcador");
            }
        }
    }

    private String normalizar(String nombreDeporte) {
        return nombreDeporte == null ? "" : nombreDeporte.trim().toUpperCase(Locale.ROOT);
    }
}
