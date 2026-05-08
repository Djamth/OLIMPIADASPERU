package com.sistema.olimpiadas_peru.inscripcion;

import com.sistema.olimpiadas_peru.common.enums.CategoriaEquipo;
import com.sistema.olimpiadas_peru.common.enums.EstadoInscripcion;
import com.sistema.olimpiadas_peru.common.enums.Genero;
import com.sistema.olimpiadas_peru.common.exception.BusinessException;
import com.sistema.olimpiadas_peru.deporte.entity.Deporte;
import com.sistema.olimpiadas_peru.deporte.repository.DeporteRepository;
import com.sistema.olimpiadas_peru.equipo.entity.Equipo;
import com.sistema.olimpiadas_peru.equipo.repository.EquipoRepository;
import com.sistema.olimpiadas_peru.inscripcion.dto.InscripcionRequest;
import com.sistema.olimpiadas_peru.inscripcion.dto.InscripcionResponse;
import com.sistema.olimpiadas_peru.inscripcion.service.InscripcionService;
import com.sistema.olimpiadas_peru.institucion.entity.Institucion;
import com.sistema.olimpiadas_peru.institucion.repository.InstitucionRepository;
import com.sistema.olimpiadas_peru.participante.entity.Participante;
import com.sistema.olimpiadas_peru.participante.repository.ParticipanteRepository;
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
class InscripcionServiceTests {

    @Autowired
    private InscripcionService inscripcionService;
    @Autowired
    private InstitucionRepository institucionRepository;
    @Autowired
    private EquipoRepository equipoRepository;
    @Autowired
    private DeporteRepository deporteRepository;
    @Autowired
    private ParticipanteRepository participanteRepository;

    private Equipo equipoMasculino;
    private Equipo equipoFemenino;
    private Deporte futbol;
    private Deporte voley;

    @BeforeEach
    void setUp() {
        Institucion institucion = new Institucion();
        institucion.setNombre("Colegio Regla Inscripcion");
        institucion.setCodigoModular("COL-RI-001");
        institucion.setRegion("Lima");
        institucion.setCiudad("Lima");
        institucion = institucionRepository.save(institucion);

        equipoMasculino = crearEquipo("Equipo Futbol", Genero.MASCULINO, institucion);
        equipoFemenino = crearEquipo("Equipo Voley", Genero.FEMENINO, institucion);

        futbol = crearDeporte("FUTBOL", 11);
        voley = crearDeporte("VOLEY", 6);

        crearParticipantes(equipoMasculino, 11, Genero.MASCULINO, "7001");
        crearParticipantes(equipoFemenino, 6, Genero.FEMENINO, "8001");
    }

    @Test
    void createShouldAllowInscripcionCompatibleConRegla() {
        InscripcionResponse response = inscripcionService.create(new InscripcionRequest(
                equipoMasculino.getId(),
                futbol.getId(),
                EstadoInscripcion.CONFIRMADA,
                LocalDate.now()));

        assertThat(response.deporteNombre()).isEqualTo("FUTBOL");
        assertThat(response.equipoNombre()).isEqualTo("Equipo Futbol");
    }

    @Test
    void createShouldRejectInscripcionIncompatibleConRegla() {
        assertThatThrownBy(() -> inscripcionService.create(new InscripcionRequest(
                equipoFemenino.getId(),
                futbol.getId(),
                EstadoInscripcion.CONFIRMADA,
                LocalDate.now())))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("solo permite equipos");
    }

    @Test
    void createShouldRejectInscripcionConfirmadaSinParticipantesSuficientes() {
        Equipo equipoIncompleto = crearEquipo("Equipo Incompleto", Genero.MASCULINO, equipoMasculino.getInstitucion());
        crearParticipantes(equipoIncompleto, 8, Genero.MASCULINO, "9001");

        assertThatThrownBy(() -> inscripcionService.create(new InscripcionRequest(
                equipoIncompleto.getId(),
                futbol.getId(),
                EstadoInscripcion.CONFIRMADA,
                LocalDate.now())))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("minimo de participantes");
    }

    private Equipo crearEquipo(String nombre, Genero genero, Institucion institucion) {
        Equipo equipo = new Equipo();
        equipo.setNombre(nombre);
        equipo.setCategoria(CategoriaEquipo.SUB_17);
        equipo.setGenero(genero);
        equipo.setEntrenador("Entrenador " + nombre);
        equipo.setInstitucion(institucion);
        return equipoRepository.save(equipo);
    }

    private Deporte crearDeporte(String nombre, Integer numeroJugadores) {
        Deporte deporte = new Deporte();
        deporte.setNombre(nombre);
        deporte.setDescripcion("Deporte " + nombre);
        deporte.setMaximoEquiposPorGrupo(4);
        deporte.setNumeroJugadores(numeroJugadores);
        return deporteRepository.save(deporte);
    }

    private void crearParticipantes(Equipo equipo, int cantidad, Genero genero, String prefijoDocumento) {
        for (int i = 0; i < cantidad; i++) {
            Participante participante = new Participante();
            participante.setNombres("Nombre" + i);
            participante.setApellidos("Apellido" + i);
            participante.setNumeroDocumento(prefijoDocumento + String.format("%04d", i));
            participante.setGenero(genero);
            participante.setFechaNacimiento(LocalDate.of(2009, 1, 1));
            participante.setCodigoEstudiante("COD-" + prefijoDocumento + i);
            participante.setEquipo(equipo);
            participanteRepository.save(participante);
        }
    }
}
