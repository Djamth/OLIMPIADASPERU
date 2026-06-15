package com.sistema.olimpiadas_peru.reporte;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.sistema.olimpiadas_peru.deporte.entity.Deporte;
import com.sistema.olimpiadas_peru.deporte.service.DeporteService;
import com.sistema.olimpiadas_peru.estadistica.dto.GoleadorResponse;
import com.sistema.olimpiadas_peru.estadistica.dto.RankingEquipoResponse;
import com.sistema.olimpiadas_peru.estadistica.service.EstadisticaService;
import com.sistema.olimpiadas_peru.reporte.dto.ReporteArchivo;
import com.sistema.olimpiadas_peru.reporte.service.ReporteEstadisticaService;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ReporteEstadisticaServiceTests {

    @Mock
    private DeporteService deporteService;

    @Mock
    private EstadisticaService estadisticaService;

    private ReporteEstadisticaService reporteService;

    @BeforeEach
    void setUp() {
        reporteService = new ReporteEstadisticaService(deporteService, estadisticaService);
        Deporte deporte = new Deporte();
        deporte.setNombre("Futbol Varones");
        when(deporteService.getEntity(1L)).thenReturn(deporte);
        when(estadisticaService.obtenerRanking(1L)).thenReturn(List.of(
            new RankingEquipoResponse("Brasil 1A", 2, 2, 0, 0, 6, 5, 1)
        ));
        when(estadisticaService.obtenerGoleadores(1L)).thenReturn(List.of(
            new GoleadorResponse(1L, "Juan Perez", 1L, "Brasil 1A", "Futbol Varones", "Goles", 3)
        ));
    }

    @Test
    void generaPdfValido() {
        ReporteArchivo reporte = reporteService.generarPdf(1L);

        assertThat(reporte.contentType()).isEqualTo("application/pdf");
        assertThat(reporte.nombreArchivo()).isEqualTo("estadisticas-futbol-varones.pdf");
        assertThat(new String(reporte.contenido(), 0, 4, StandardCharsets.US_ASCII)).isEqualTo("%PDF");
    }

    @Test
    void generaExcelValido() {
        ReporteArchivo reporte = reporteService.generarExcel(1L);

        assertThat(reporte.contentType()).contains("spreadsheetml");
        assertThat(reporte.nombreArchivo()).isEqualTo("estadisticas-futbol-varones.xlsx");
        assertThat(reporte.contenido()[0]).isEqualTo((byte) 'P');
        assertThat(reporte.contenido()[1]).isEqualTo((byte) 'K');
    }
}
