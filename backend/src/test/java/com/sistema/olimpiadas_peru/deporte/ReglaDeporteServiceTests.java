package com.sistema.olimpiadas_peru.deporte;

import com.sistema.olimpiadas_peru.common.exception.BusinessException;
import com.sistema.olimpiadas_peru.deporte.service.ReglaDeporteService;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ReglaDeporteServiceTests {

    private final ReglaDeporteService reglaDeporteService = new ReglaDeporteService();

    @Test
    void validarConfiguracionDeporteShouldAcceptRequiredPlayerCount() {
        assertThatCode(() -> reglaDeporteService.validarConfiguracionDeporte("FUTBOL", 11)).doesNotThrowAnyException();
        assertThatCode(() -> reglaDeporteService.validarConfiguracionDeporte("BASQUET", 5)).doesNotThrowAnyException();
        assertThatCode(() -> reglaDeporteService.validarConfiguracionDeporte("VOLEY", 6)).doesNotThrowAnyException();
        assertThatCode(() -> reglaDeporteService.validarConfiguracionDeporte("PING_PONG", 1)).doesNotThrowAnyException();
    }

    @Test
    void validarConfiguracionDeporteShouldRejectInvalidPlayerCount() {
        assertThatThrownBy(() -> reglaDeporteService.validarConfiguracionDeporte("FUTBOL", 7))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("11 jugadores");
    }
}
