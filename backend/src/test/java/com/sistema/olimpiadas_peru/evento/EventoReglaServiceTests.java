package com.sistema.olimpiadas_peru.evento;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import com.sistema.olimpiadas_peru.categoria.repository.CategoriaEventoRepository;
import com.sistema.olimpiadas_peru.common.enums.EstadoEvento;
import com.sistema.olimpiadas_peru.common.exception.BusinessException;
import com.sistema.olimpiadas_peru.deporte.repository.DeporteRepository;
import com.sistema.olimpiadas_peru.equipo.repository.EquipoRepository;
import com.sistema.olimpiadas_peru.evento.entity.Evento;
import com.sistema.olimpiadas_peru.evento.service.EventoReglaService;
import com.sistema.olimpiadas_peru.inscripcion.repository.InscripcionRepository;
import com.sistema.olimpiadas_peru.participante.repository.ParticipanteRepository;
import com.sistema.olimpiadas_peru.participante.repository.PlantillaEquipoRepository;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class EventoReglaServiceTests {

    @Mock private CategoriaEventoRepository categoriaRepository;
    @Mock private DeporteRepository deporteRepository;
    @Mock private EquipoRepository equipoRepository;
    @Mock private InscripcionRepository inscripcionRepository;
    @Mock private PlantillaEquipoRepository plantillaRepository;
    @Mock private ParticipanteRepository participanteRepository;

    private EventoReglaService service;

    @BeforeEach
    void setUp() {
        service = new EventoReglaService(categoriaRepository, deporteRepository, equipoRepository,
                inscripcionRepository, plantillaRepository, participanteRepository);
    }

    @Test
    void noPermiteSaltarDeBorradorAEnCurso() {
        Evento evento = evento(1L, EstadoEvento.BORRADOR);

        assertThrows(BusinessException.class,
                () -> service.validarTransicion(evento, EstadoEvento.EN_CURSO));
    }

    @Test
    void noIniciaEventoSinCategorias() {
        Evento evento = evento(7L, EstadoEvento.INSCRIPCIONES);
        when(categoriaRepository.findByEventoIdOrderByNombreAsc(7L)).thenReturn(List.of());

        assertThrows(BusinessException.class,
                () -> service.validarTransicion(evento, EstadoEvento.EN_CURSO));
    }

    private Evento evento(Long id, EstadoEvento estado) {
        Evento evento = new Evento();
        evento.setId(id);
        evento.setEstado(estado);
        return evento;
    }
}
