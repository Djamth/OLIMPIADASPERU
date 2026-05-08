package com.sistema.olimpiadas_peru.sorteo;

import com.sistema.olimpiadas_peru.common.enums.CategoriaEquipo;
import com.sistema.olimpiadas_peru.common.enums.EstadoInscripcion;
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
import com.sistema.olimpiadas_peru.sorteo.service.SorteoService;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class SorteoServiceTests {

    @Autowired
    private SorteoService sorteoService;
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

    private Deporte futbol;
    private Equipo equipoA;
    private Equipo equipoB;

    @BeforeEach
    void setUp() {
        Institucion institucion = new Institucion();
        institucion.setNombre("Colegio Sorteo");
        institucion.setCodigoModular("COL-SOR-001");
        institucion.setRegion("Lima");
        institucion.setCiudad("Lima");
        institucion = institucionRepository.save(institucion);

        equipoA = crearEquipo("Equipo A", institucion);
        equipoB = crearEquipo("Equipo B", institucion);
        crearParticipantes(equipoA, 11, "7101");
        crearParticipantes(equipoB, 11, "7102");

        futbol = new Deporte();
        futbol.setNombre("FUTBOL");
        futbol.setDescripcion("Futbol");
        futbol.setNumeroJugadores(11);
        futbol.setMaximoEquiposPorGrupo(4);
        futbol = deporteRepository.save(futbol);
    }

    @Test
    void generarGruposShouldUseSoloInscripcionesConfirmadas() {
        crearInscripcion(equipoA, EstadoInscripcion.CONFIRMADA);
        crearInscripcion(equipoB, EstadoInscripcion.CONFIRMADA);

        var grupos = sorteoService.generarGrupos(futbol.getId());

        assertThat(grupos).hasSize(1);
        assertThat(grupos.getFirst().equipos()).hasSize(2);
    }

    @Test
    void generarGruposShouldRejectWhenNoHayDosConfirmados() {
        crearInscripcion(equipoA, EstadoInscripcion.CONFIRMADA);
        crearInscripcion(equipoB, EstadoInscripcion.PENDIENTE);

        assertThatThrownBy(() -> sorteoService.generarGrupos(futbol.getId()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("inscripcion confirmada");
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
}
