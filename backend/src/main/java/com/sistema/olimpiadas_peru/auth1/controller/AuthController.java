package com.sistema.olimpiadas_peru.auth1.controller;

import com.sistema.olimpiadas_peru.auth1.dto.LoginRequestDTO;
import com.sistema.olimpiadas_peru.auth1.dto.ApiResponseDTO;
import com.sistema.olimpiadas_peru.auth1.dto.LoginResponseDTO;
import com.sistema.olimpiadas_peru.auth1.dto.ForgotPasswordRequestDTO;
import com.sistema.olimpiadas_peru.auth1.dto.ResetPasswordRequestDTO;
import com.sistema.olimpiadas_peru.auth1.security.JwtTokenProvider;
import com.sistema.olimpiadas_peru.auth1.security.TokenBlacklistService;
import com.sistema.olimpiadas_peru.auth1.service.PasswordResetService;
import com.sistema.olimpiadas_peru.auth1.service.UsuarioService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
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
@CrossOrigin(origins = "*")
public class AuthController {

    private final UsuarioService usuarioService;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenBlacklistService tokenBlacklistService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO loginRequestDTO) {
        return ResponseEntity.ok(usuarioService.login(loginRequestDTO));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<Map<String, Object>> refreshToken(@RequestHeader("Authorization") String authorizationHeader) {
        String refreshToken = extractBearerToken(authorizationHeader);

        if (!jwtTokenProvider.validateToken(refreshToken)
            || tokenBlacklistService.isBlacklisted(refreshToken)
            || !"REFRESH".equalsIgnoreCase(jwtTokenProvider.getTokenType(refreshToken))) {
            throw new RuntimeException("Refresh token invalido");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(
            jwtTokenProvider.getEmailFromToken(refreshToken),
            jwtTokenProvider.getUserIdFromToken(refreshToken)
        );

        return ResponseEntity.ok(Map.of(
            "accessToken", accessToken,
            "expiresIn", jwtTokenProvider.getAccessTokenExpirationMs(),
            "tokenType", "Bearer"
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
        HttpServletRequest request,
        @RequestHeader(value = "X-Refresh-Token", required = false) String refreshTokenHeader) {

        tokenBlacklistService.blacklist(extractBearerToken(request.getHeader("Authorization")));
        tokenBlacklistService.blacklist(extractBearerToken(refreshTokenHeader));
        return ResponseEntity.ok(Map.of("mensaje", "Sesion cerrada correctamente"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        return ResponseEntity.ok(usuarioService.obtenerPorEmail(authentication.getName()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponseDTO> forgotPassword(@RequestBody ForgotPasswordRequestDTO requestDTO) {
        passwordResetService.solicitarRecuperacion(requestDTO.getEmail());
        return ResponseEntity.ok(ApiResponseDTO.builder()
            .mensaje("Te enviamos un codigo de 6 digitos a tu correo")
            .build());
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponseDTO> resetPassword(@RequestBody ResetPasswordRequestDTO requestDTO) {
        passwordResetService.resetearPassword(
            requestDTO.getEmail(),
            requestDTO.getCodigo(),
            requestDTO.getNuevaPassword()
        );
        return ResponseEntity.ok(ApiResponseDTO.builder()
            .mensaje("Contrasena actualizada correctamente")
            .build());
    }

    private String extractBearerToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return null;
        }
        return authorizationHeader.substring(7);
    }
}
