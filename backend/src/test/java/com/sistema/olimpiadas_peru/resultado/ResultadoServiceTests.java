package com.sistema.olimpiadas_peru.resultado;

import com.sistema.olimpiadas_peru.common.enums.CategoriaEquipo;
import com.sistema.olimpiadas_peru.common.enums.EstadoPartido;
import com.sistema.olimpiadas_peru.common.enums.Genero;
import com.sistema.olimpiadas_peru.common.exception.BusinessException;
import com.sistema.olimpiadas_peru.deporte.entity.Deporte;
import com.sistema.olimpiadas_peru.deporte.repository.DeporteRepository;
import com.sistema.olimpiadas_peru.equipo.entity.Equipo;
import com.sistema.olimpiadas_peru.equipo.repository.EquipoRepository;
import com.sistema.olimpiadas_peru.institucion.entity.Institucion;
import com.sistema.olimpiadas_peru.institucion.repository.InstitucionRepository;
import com.sistema.olimpiadas_peru.participante.entity.Participante;
import com.sistema.olimpiadas_peru.participante.repository.ParticipanteRepository;
import com.sistema.olimpiadas_peru.programacion.entity.Partido;
import com.sistema.olimpiadas_peru.programacion.repository.PartidoRepository;
import com.sistema.olimpiadas_peru.resultado.dto.ResultadoAnotacionRequest;
import com.sistema.olimpiadas_peru.resultado.dto.ResultadoResponse;
import com.sistema.olimpiadas_peru.resultado.service.ResultadoService;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class ResultadoServiceTests {

    @Autowired
    private ResultadoService resultadoService;
    @Autowired
    private InstitucionRepository institucionRepository;
    @Autowired
    private EquipoRepository equipoRepository;
    @Autowired
    private DeporteRepository deporteRepository;
    @Autowired
    private PartidoRepository partidoRepository;
    @Autowired
    private ParticipanteRepository participanteRepository;

    private Partido partido;
    private Participante participanteLocal;
    private Participante participanteExterno;

    @BeforeEach
    void setUp() {
        Institucion institucionA = new Institucion();
        institucionA.setNombre("Colegio A Resultado");
        institucionA.setCodigoModular("COL-RA-001");
        institucionA.setRegion("Lima");
        institucionA.setCiudad("Lima");
        institucionA = institucionRepository.save(institucionA);

        Institucion institucionB = new Institucion();
        institucionB.setNombre("Colegio B Resultado");
        institucionB.setCodigoModular("COL-RB-001");
        institucionB.setRegion("Lima");
        institucionB.setCiudad("Lima");
        institucionB = institucionRepository.save(institucionB);

        Institucion institucionC = new Institucion();
        institucionC.setNombre("Colegio C Resultado");
        institucionC.setCodigoModular("COL-RC-001");
        institucionC.setRegion("Lima");
        institucionC.setCiudad("Lima");
        institucionC = institucionRepository.save(institucionC);

        Equipo local = crearEquipo("Equipo Local", institucionA);
        Equipo visitante = crearEquipo("Equipo Visitante", institucionB);
        Equipo externo = crearEquipo("Equipo Externo", institucionC);

        Deporte deporte = new Deporte();
        deporte.setNombre("FUTBOL_TEST");
        deporte.setDescripcion("Futbol test");
        deporte.setMaximoEquiposPorGrupo(4);
        deporte.setNumeroJugadores(11);
        deporte = deporteRepository.save(deporte);

        Partido nuevoPartido = new Partido();
        nuevoPartido.setDeporte(deporte);
        nuevoPartido.setEquipoLocal(local);
        nuevoPartido.setEquipoVisitante(visitante);
        nuevoPartido.setFechaHora(LocalDateTime.now().plusDays(1));
        nuevoPartido.setSede("Cancha Principal");
        nuevoPartido.setEstado(EstadoPartido.PROGRAMADO);
        partido = partidoRepository.save(nuevoPartido);

        participanteLocal = crearParticipante("Luis", "Quispe", "70000001", local);
        participanteExterno = crearParticipante("Pedro", "Soto", "70000002", externo);
    }

    @Test
    void createResultadoShouldPersistAnotacionesDeParticipantes() {
        ResultadoResponse response = resultadoService.create(new com.sistema.olimpiadas_peru.resultado.dto.ResultadoRequest(
                partido.getId(),
                3,
                1,
                "Partido intenso",
                List.of(new ResultadoAnotacionRequest(participanteLocal.getId(), 2))));

        assertThat(response.anotaciones()).hasSize(1);
        assertThat(response.anotaciones().getFirst().participanteId()).isEqualTo(participanteLocal.getId());
        assertThat(response.anotaciones().getFirst().cantidad()).isEqualTo(2);
    }

    @Test
    void createResultadoShouldRejectParticipanteFueraDelPartido() {
        assertThatThrownBy(() -> resultadoService.create(new com.sistema.olimpiadas_peru.resultado.dto.ResultadoRequest(
                partido.getId(),
                1,
                0,
                null,
                List.of(new ResultadoAnotacionRequest(participanteExterno.getId(), 1)))))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("deben pertenecer");
    }

    private Equipo crearEquipo(String nombre, Institucion institucion) {
        Equipo equipo = new Equipo();
        equipo.setNombre(nombre);
        equipo.setCategoria(CategoriaEquipo.SUB_17);
        equipo.setGenero(Genero.MASCULINO);
        equipo.setEntrenador("Entrenador " + nombre);
        equipo.setInstitucion(institucion);
        return equipoRepository.save(equipo);
    }

    private Participante crearParticipante(String nombres, String apellidos, String documento, Equipo equipo) {
        Participante participante = new Participante();
        participante.setNombres(nombres);
        participante.setApellidos(apellidos);
        participante.setNumeroDocumento(documento);
        participante.setGenero(Genero.MASCULINO);
        participante.setFechaNacimiento(LocalDate.of(2009, 1, 1));
        participante.setCodigoEstudiante("COD-" + documento);
        participante.setEquipo(equipo);
        return participanteRepository.save(participante);
    }
}
