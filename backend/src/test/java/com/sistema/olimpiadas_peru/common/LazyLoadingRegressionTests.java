package com.sistema.olimpiadas_peru.common;

import com.sistema.olimpiadas_peru.common.enums.CategoriaEquipo;
import com.sistema.olimpiadas_peru.common.enums.EstadoInscripcion;
import com.sistema.olimpiadas_peru.common.enums.Genero;
import com.sistema.olimpiadas_peru.deporte.dto.DeporteRequest;
import com.sistema.olimpiadas_peru.deporte.dto.DeporteResponse;
import com.sistema.olimpiadas_peru.deporte.service.DeporteService;
import com.sistema.olimpiadas_peru.equipo.dto.EquipoRequest;
import com.sistema.olimpiadas_peru.equipo.dto.EquipoResponse;
import com.sistema.olimpiadas_peru.equipo.service.EquipoService;
import com.sistema.olimpiadas_peru.inscripcion.dto.InscripcionRequest;
import com.sistema.olimpiadas_peru.inscripcion.service.InscripcionService;
import com.sistema.olimpiadas_peru.institucion.dto.InstitucionRequest;
import com.sistema.olimpiadas_peru.institucion.dto.InstitucionResponse;
import com.sistema.olimpiadas_peru.institucion.service.InstitucionService;
import com.sistema.olimpiadas_peru.participante.dto.ParticipanteRequest;
import com.sistema.olimpiadas_peru.participante.service.ParticipanteService;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

@SpringBootTest
class LazyLoadingRegressionTests {

    @Autowired
    private InstitucionService institucionService;

    @Autowired
    private EquipoService equipoService;

    @Autowired
    private ParticipanteService participanteService;

    @Autowired
    private DeporteService deporteService;

    @Autowired
    private InscripcionService inscripcionService;

    @Test
    void listadosShouldMapLazyRelationsWithOpenInViewDisabled() {
        InstitucionResponse institucion = institucionService.create(new InstitucionRequest(
            "Colegio Lazy Test",
            "LAZY-001",
            "Lima",
            "Lima",
            "Av. Prueba 123",
            "999999999",
            "lazy@test.pe"
        ));

        EquipoResponse equipo = equipoService.create(new EquipoRequest(
            "Equipo Lazy Test",
            CategoriaEquipo.SUB_17,
            Genero.MASCULINO,
            "Entrenador Test",
            institucion.id()
        ));

        participanteService.create(new ParticipanteRequest(
            "Carlos",
            "Mendoza",
            "79999999",
            Genero.MASCULINO,
            LocalDate.of(2009, 6, 10),
            "LAZY-EST-01",
            equipo.id()
        ));

        DeporteResponse deporte = deporteService.create(new DeporteRequest(
            "DEPORTE_LAZY_TEST",
            "Prueba de relaciones lazy",
            4,
            1
        ));

        inscripcionService.create(new InscripcionRequest(
            equipo.id(),
            deporte.id(),
            EstadoInscripcion.PENDIENTE,
            LocalDate.now()
        ));

        assertThatCode(() -> equipoService.findAll()).doesNotThrowAnyException();
        assertThatCode(() -> participanteService.findAll(null)).doesNotThrowAnyException();
        assertThatCode(() -> inscripcionService.findAll()).doesNotThrowAnyException();

        assertThat(equipoService.findById(equipo.id()).institucionNombre()).isEqualTo("Colegio Lazy Test");
        assertThat(participanteService.findAll(equipo.id()).getFirst().institucionNombre()).isEqualTo("Colegio Lazy Test");
        assertThat(inscripcionService.findByDeporte(deporte.id()).getFirst().equipoNombre()).isEqualTo("Equipo Lazy Test");
    }
}
