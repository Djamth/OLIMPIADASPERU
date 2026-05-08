package com.sistema.olimpiadas_peru.programacion;

import com.sistema.olimpiadas_peru.common.enums.CategoriaEquipo;
import com.sistema.olimpiadas_peru.common.enums.EstadoInscripcion;
import com.sistema.olimpiadas_peru.common.enums.EstadoPartido;
import com.sistema.olimpiadas_peru.common.enums.Genero;
import com.sistema.olimpiadas_peru.common.exception.BusinessException;
import com.sistema.olimpiadas_peru.deporte.entity.Deporte;
import com.sistema.olimpiadas_peru.deporte.repository.DeporteRepository;
import com.sistema.olimpiadas_peru.equipo.entity.Equipo;
import com.sistema.olimpiadas_peru.equipo.repository.EquipoRepository;
import com.sistema.olimpiadas_peru.inscripcion.entity.Inscripcion;
import com.sistema.olimpiadas_peru.inscripcion.repository.InscripcionRepository;
import com.sistema.olimpiadas_peru.institucion.entity.Institucion;
import com.sistema.olimpiadas_peru.institucion.repository.InstitucionRepository;
import com.sistema.olimpiadas_peru.participante.entity.Participante;
import com.sistema.olimpiadas_peru.participante.repository.ParticipanteRepository;
import com.sistema.olimpiadas_peru.programacion.dto.PartidoRequest;
import com.sistema.olimpiadas_peru.programacion.dto.PartidoResponse;
import com.sistema.olimpiadas_peru.programacion.service.ProgramacionService;
import com.sistema.olimpiadas_peru.sorteo.entity.Grupo;
import com.sistema.olimpiadas_peru.sorteo.entity.GrupoEquipo;
import com.sistema.olimpiadas_peru.sorteo.repository.GrupoEquipoRepository;
import com.sistema.olimpiadas_peru.sorteo.repository.GrupoRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class ProgramacionServiceTests {

    @Autowired
    private ProgramacionService programacionService;
    @Autowired
    private InstitucionRepository institucionRepository;
    @Autowired
    private EquipoRepository equipoRepository;
    @Autowired
    private DeporteRepository deporteRepository;
    @Autowired
    private InscripcionRepository inscripcionRepository;
    @Autowired
    private ParticipanteRepository participanteRepository;
    @Autowired
    private GrupoRepository grupoRepository;
    @Autowired
    private GrupoEquipoRepository grupoEquipoRepository;

    private Deporte futbol;
    private Equipo equipoA;
    private Equipo equipoB;
    private Equipo equipoC;
    private Grupo grupoA;

    @BeforeEach
    void setUp() {
        Institucion institucion = new Institucion();
        institucion.setNombre("Colegio Programacion");
        institucion.setCodigoModular("COL-PROG-001");
        institucion.setRegion("Lima");
        institucion.setCiudad("Lima");
        institucion = institucionRepository.save(institucion);

        equipoA = crearEquipo("Equipo A", institucion);
        equipoB = crearEquipo("Equipo B", institucion);
        equipoC = crearEquipo("Equipo C", institucion);
        crearParticipantes(equipoA, 11, "7201");
        crearParticipantes(equipoB, 11, "7202");
        crearParticipantes(equipoC, 11, "7203");

        futbol = new Deporte();
        futbol.setNombre("FUTBOL");
        futbol.setDescripcion("Futbol");
        futbol.setNumeroJugadores(11);
        futbol.setMaximoEquiposPorGrupo(4);
        futbol = deporteRepository.save(futbol);

        crearInscripcion(equipoA, EstadoInscripcion.CONFIRMADA);
        crearInscripcion(equipoB, EstadoInscripcion.CONFIRMADA);
        crearInscripcion(equipoC, EstadoInscripcion.CONFIRMADA);

        grupoA = new Grupo();
        grupoA.setNombre("Grupo A");
        grupoA.setDeporte(futbol);
        grupoA = grupoRepository.save(grupoA);

        guardarGrupoEquipo(grupoA, equipoA, 1);
        guardarGrupoEquipo(grupoA, equipoB, 2);
    }

    @Test
    void createShouldAllowProgramacionConEquiposConfirmadosDelGrupo() {
        PartidoResponse response = programacionService.create(new PartidoRequest(
                grupoA.getId(),
                futbol.getId(),
                equipoA.getId(),
                equipoB.getId(),
                LocalDateTime.now().plusDays(1),
                "Cancha 1",
                EstadoPartido.PROGRAMADO));

        assertThat(response.grupoNombre()).isEqualTo("Grupo A");
        assertThat(response.equipoLocalNombre()).isEqualTo("Equipo A");
    }

    @Test
    void createShouldRejectProgramacionConEquipoFueraDelGrupo() {
        assertThatThrownBy(() -> programacionService.create(new PartidoRequest(
                grupoA.getId(),
                futbol.getId(),
                equipoA.getId(),
                equipoC.getId(),
                LocalDateTime.now().plusDays(1),
                "Cancha 1",
                EstadoPartido.PROGRAMADO)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("deben pertenecer al grupo");
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

    private void crearInscripcion(Equipo equipo, EstadoInscripcion estado) {
        Inscripcion inscripcion = new Inscripcion();
        inscripcion.setEquipo(equipo);
        inscripcion.setDeporte(futbol);
        inscripcion.setEstado(estado);
        inscripcion.setFechaInscripcion(LocalDate.now());
        inscripcionRepository.save(inscripcion);
    }

    private void crearParticipantes(Equipo equipo, int cantidad, String prefijoDocumento) {
        for (int i = 0; i < cantidad; i++) {
            Participante participante = new Participante();
            participante.setNombres("Nombre" + i);
            participante.setApellidos("Apellido" + i);
            participante.setNumeroDocumento(prefijoDocumento + String.format("%04d", i));
            participante.setGenero(Genero.MASCULINO);
            participante.setFechaNacimiento(LocalDate.of(2009, 1, 1));
            participante.setCodigoEstudiante("COD-" + prefijoDocumento + i);
            participante.setEquipo(equipo);
            participanteRepository.save(participante);
        }
    }

    private void guardarGrupoEquipo(Grupo grupo, Equipo equipo, int posicion) {
        GrupoEquipo grupoEquipo = new GrupoEquipo();
        grupoEquipo.setGrupo(grupo);
        grupoEquipo.setEquipo(equipo);
        grupoEquipo.setPosicion(posicion);
        grupoEquipoRepository.save(grupoEquipo);
    }
}
