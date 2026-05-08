package com.sistema.olimpiadas_peru.participante;

import com.sistema.olimpiadas_peru.common.enums.CategoriaEquipo;
import com.sistema.olimpiadas_peru.common.enums.Genero;
import com.sistema.olimpiadas_peru.common.exception.BusinessException;
import com.sistema.olimpiadas_peru.equipo.entity.Equipo;
import com.sistema.olimpiadas_peru.equipo.repository.EquipoRepository;
import com.sistema.olimpiadas_peru.institucion.entity.Institucion;
import com.sistema.olimpiadas_peru.institucion.repository.InstitucionRepository;
import com.sistema.olimpiadas_peru.participante.dto.ParticipanteRequest;
import com.sistema.olimpiadas_peru.participante.dto.ParticipanteResponse;
import com.sistema.olimpiadas_peru.participante.service.ParticipanteService;
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
class ParticipanteServiceTests {

    @Autowired
    private ParticipanteService participanteService;

    @Autowired
    private EquipoRepository equipoRepository;

    @Autowired
    private InstitucionRepository institucionRepository;

    private Equipo equipoMasculino;

    @BeforeEach
    void setUp() {
        Institucion institucion = new Institucion();
        institucion.setNombre("Colegio Test Participantes");
        institucion.setCodigoModular("COL-PT-001");
        institucion.setRegion("Lima");
        institucion.setCiudad("Lima");
        institucion = institucionRepository.save(institucion);

        Equipo equipo = new Equipo();
        equipo.setNombre("Equipo Test");
        equipo.setCategoria(CategoriaEquipo.SUB_17);
        equipo.setGenero(Genero.MASCULINO);
        equipo.setEntrenador("Entrenador Test");
        equipo.setInstitucion(institucion);
        equipoMasculino = equipoRepository.save(equipo);
    }

    @Test
    void createParticipanteShouldPersistAndReturnResponse() {
        ParticipanteRequest request = new ParticipanteRequest(
                "Luis",
                "Quispe",
                "77889911",
                Genero.MASCULINO,
                LocalDate.of(2009, 5, 10),
                "EST-001",
                equipoMasculino.getId());

        ParticipanteResponse response = participanteService.create(request);

        assertThat(response.id()).isNotNull();
        assertThat(response.nombres()).isEqualTo("Luis");
        assertThat(response.equipoId()).isEqualTo(equipoMasculino.getId());
        assertThat(response.institucionNombre()).isEqualTo("Colegio Test Participantes");
    }

    @Test
    void createParticipanteShouldRejectGeneroMismatch() {
        ParticipanteRequest request = new ParticipanteRequest(
                "Maria",
                "Rojas",
                "99887766",
                Genero.FEMENINO,
                LocalDate.of(2008, 8, 15),
                "EST-002",
                equipoMasculino.getId());

        assertThatThrownBy(() -> participanteService.create(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("genero del participante");
    }
}
