package com.sistema.olimpiadas_peru.categoria;

import com.sistema.olimpiadas_peru.categoria.dto.CategoriaEventoRequest;
import com.sistema.olimpiadas_peru.categoria.dto.CategoriaEventoResponse;
import com.sistema.olimpiadas_peru.categoria.service.CategoriaEventoService;
import com.sistema.olimpiadas_peru.common.enums.EstadoEvento;
import com.sistema.olimpiadas_peru.common.exception.BusinessException;
import com.sistema.olimpiadas_peru.evento.entity.Evento;
import com.sistema.olimpiadas_peru.evento.repository.EventoRepository;
import com.sistema.olimpiadas_peru.institucion.entity.Institucion;
import com.sistema.olimpiadas_peru.institucion.repository.InstitucionRepository;
import com.sistema.olimpiadas_peru.pais.entity.Pais;
import com.sistema.olimpiadas_peru.pais.repository.PaisRepository;
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
class CategoriaEventoServiceTests {

    @Autowired
    private CategoriaEventoService service;
    @Autowired
    private InstitucionRepository institucionRepository;
    @Autowired
    private EventoRepository eventoRepository;
    @Autowired
    private PaisRepository paisRepository;

    private Evento evento;
    private Pais brasil;

    @BeforeEach
    void setUp() {
        Institucion institucion = new Institucion();
        institucion.setNombre("Institucion Categorias");
        institucion.setCodigoModular("CAT-001");
        institucion.setRegion("Lima");
        institucion.setCiudad("Lima");
        institucion = institucionRepository.save(institucion);

        evento = new Evento();
        evento.setNombre("Olimpiadas 2026");
        evento.setAnio(2026);
        evento.setFechaInicio(LocalDate.of(2026, 7, 1));
        evento.setFechaFin(LocalDate.of(2026, 7, 30));
        evento.setEstado(EstadoEvento.INSCRIPCIONES);
        evento.setInstitucion(institucion);
        evento = eventoRepository.save(evento);

        brasil = crearPais("Brasil", "BRA", "BR");
        crearPais("Francia", "FRA", "FR");
    }

    @Test
    void createShouldAssignAvailableCountryAutomatically() {
        CategoriaEventoResponse response = service.create(
                new CategoriaEventoRequest("Primer ano", "Secundaria", null, evento.getId(), null));

        assertThat(response.paisId()).isNotNull();
        assertThat(response.eventoId()).isEqualTo(evento.getId());
    }

    @Test
    void createShouldRejectRepeatedCountryInSameEvent() {
        service.create(new CategoriaEventoRequest(
                "Primer ano", "Secundaria", null, evento.getId(), brasil.getId()));

        assertThatThrownBy(() -> service.create(new CategoriaEventoRequest(
                "Segundo ano", "Secundaria", null, evento.getId(), brasil.getId())))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("ya esta asignado");
    }

    private Pais crearPais(String nombre, String codigo, String bandera) {
        Pais pais = new Pais();
        pais.setNombre(nombre);
        pais.setCodigo(codigo);
        pais.setBandera(bandera);
        pais.setColorPrimario("#000000");
        pais.setColorSecundario("#FFFFFF");
        pais.setActivo(true);
        return paisRepository.save(pais);
    }
}
