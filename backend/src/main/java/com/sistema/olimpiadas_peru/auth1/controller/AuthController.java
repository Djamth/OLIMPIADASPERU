package com.sistema.olimpiadas_peru.auth1.controller;

import com.sistema.olimpiadas_peru.auth1.dto.LoginRequestDTO;
import com.sistema.olimpiadas_peru.auth1.dto.ApiResponseDTO;
import com.sistema.olimpiadas_peru.auth1.dto.LoginResponseDTO;
import com.sistema.olimpiadas_peru.auth1.dto.ForgotPasswordRequestDTO;
import com.sistema.olimpiadas_peru.auth1.dto.ResetPasswordRequestDTO;
import com.sistema.olimpiadas_peru.auth1.dto.RefreshTokenResponseDTO;
import com.sistema.olimpiadas_peru.auth1.security.AuthCookieService;
import com.sistema.olimpiadas_peru.auth1.security.AuthRateLimitService;
import com.sistema.olimpiadas_peru.auth1.security.TokenBlacklistService;
import com.sistema.olimpiadas_peru.auth1.service.PasswordResetService;
import com.sistema.olimpiadas_peru.auth1.service.UsuarioService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioService usuarioService;
    private final TokenBlacklistService tokenBlacklistService;
    private final PasswordResetService passwordResetService;
    private final AuthCookieService authCookieService;
    private final AuthRateLimitService authRateLimitService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(
        @Valid @RequestBody LoginRequestDTO loginRequestDTO,
        HttpServletRequest request,
        HttpServletResponse response,
        @RequestHeader(value = "X-Auth-Mode", required = false) String authMode) {

        String clientId = request.getRemoteAddr();
        authRateLimitService.checkLogin(clientId, loginRequestDTO.getEmail());
        try {
            LoginResponseDTO session = usuarioService.login(loginRequestDTO);
            authRateLimitService.resetLogin(clientId, loginRequestDTO.getEmail());
            authCookieService.writeSession(response, session.getAccessToken(), session.getRefreshToken());
            return ResponseEntity.ok(sanitizeForBrowser(session, authMode));
        } catch (RuntimeException exception) {
            authRateLimitService.registerLoginFailure(clientId, loginRequestDTO.getEmail());
            throw exception;
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<RefreshTokenResponseDTO> refreshToken(
        HttpServletRequest request,
        HttpServletResponse response,
        @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
        @RequestHeader(value = "X-Auth-Mode", required = false) String authMode) {

        String refreshToken = firstNonBlank(
            extractBearerToken(authorizationHeader),
            authCookieService.getRefreshToken(request)
        );
        RefreshTokenResponseDTO session = usuarioService.renovarSesion(refreshToken);
        authCookieService.writeSession(response, session.getAccessToken(), session.getRefreshToken());
        return ResponseEntity.ok(sanitizeForBrowser(session, authMode));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
        HttpServletRequest request,
        HttpServletResponse response,
        @RequestHeader(value = "X-Refresh-Token", required = false) String refreshTokenHeader) {

        tokenBlacklistService.blacklist(firstNonBlank(
            extractBearerToken(request.getHeader("Authorization")),
            authCookieService.getAccessToken(request)
        ));
        tokenBlacklistService.blacklist(firstNonBlank(
            extractBearerToken(refreshTokenHeader),
            authCookieService.getRefreshToken(request)
        ));
        authCookieService.clearSession(response);
        return ResponseEntity.ok(Map.of("mensaje", "Sesión cerrada correctamente"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        return ResponseEntity.ok(usuarioService.obtenerSesionActual(authentication.getName()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponseDTO> forgotPassword(
        @Valid @RequestBody ForgotPasswordRequestDTO requestDTO,
        HttpServletRequest request) {

        authRateLimitService.consumePasswordRequest("forgot", request.getRemoteAddr(), requestDTO.getEmail());
        passwordResetService.solicitarRecuperacion(requestDTO.getEmail());
        return ResponseEntity.ok(ApiResponseDTO.builder()
            .mensaje("Si el correo está registrado y activo, recibirá un código de recuperación")
            .build());
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponseDTO> resetPassword(
        @Valid @RequestBody ResetPasswordRequestDTO requestDTO,
        HttpServletRequest request) {

        authRateLimitService.consumePasswordRequest("reset", request.getRemoteAddr(), requestDTO.getEmail());
        passwordResetService.resetearPassword(
            requestDTO.getEmail(),
            requestDTO.getCodigo(),
            requestDTO.getNuevaPassword()
        );
        return ResponseEntity.ok(ApiResponseDTO.builder()
            .mensaje("Contraseña actualizada correctamente")
            .build());
    }

    private String extractBearerToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return null;
        }
        return authorizationHeader.substring(7);
    }

    private LoginResponseDTO sanitizeForBrowser(LoginResponseDTO session, String authMode) {
        if (isBearerMode(authMode)) {
            return session;
        }
        session.setAccessToken(null);
        session.setRefreshToken(null);
        session.setTokenType("Cookie");
        return session;
    }

    private RefreshTokenResponseDTO sanitizeForBrowser(RefreshTokenResponseDTO session, String authMode) {
        if (isBearerMode(authMode)) {
            return session;
        }
        session.setAccessToken(null);
        session.setRefreshToken(null);
        session.setTokenType("Cookie");
        return session;
    }

    private boolean isBearerMode(String authMode) {
        return "bearer".equalsIgnoreCase(authMode);
    }

    private String firstNonBlank(String first, String second) {
        return first != null && !first.isBlank() ? first : second;
    }
}
