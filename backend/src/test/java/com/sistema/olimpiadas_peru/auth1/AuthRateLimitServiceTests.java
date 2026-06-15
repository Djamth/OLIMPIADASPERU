package com.sistema.olimpiadas_peru.auth1;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.sistema.olimpiadas_peru.auth1.security.AuthRateLimitService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

class AuthRateLimitServiceTests {

    private AuthRateLimitService rateLimitService;

    @BeforeEach
    void setUp() {
        rateLimitService = new AuthRateLimitService();
        ReflectionTestUtils.setField(rateLimitService, "loginMaxAttempts", 2);
        ReflectionTestUtils.setField(rateLimitService, "loginWindowMinutes", 15L);
        ReflectionTestUtils.setField(rateLimitService, "passwordMaxAttempts", 2);
        ReflectionTestUtils.setField(rateLimitService, "passwordWindowMinutes", 30L);
    }

    @Test
    void bloqueaLoginDespuesDelMaximoDeFallos() {
        rateLimitService.registerLoginFailure("127.0.0.1", "usuario@correo.pe");
        rateLimitService.registerLoginFailure("127.0.0.1", "usuario@correo.pe");

        assertThatThrownBy(() -> rateLimitService.checkLogin("127.0.0.1", "usuario@correo.pe"))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("429 TOO_MANY_REQUESTS");
    }

    @Test
    void loginCorrectoLimpiaElContador() {
        rateLimitService.registerLoginFailure("127.0.0.1", "usuario@correo.pe");
        rateLimitService.registerLoginFailure("127.0.0.1", "usuario@correo.pe");
        rateLimitService.resetLogin("127.0.0.1", "usuario@correo.pe");

        rateLimitService.checkLogin("127.0.0.1", "usuario@correo.pe");
    }
}
