package com.sistema.olimpiadas_peru.auth1.controller;

import com.sistema.olimpiadas_peru.auth1.dto.ApiResponseDTO;
import com.sistema.olimpiadas_peru.auth1.dto.CambiarPasswordDTO;
import com.sistema.olimpiadas_peru.auth1.dto.LoginResponseDTO;
import com.sistema.olimpiadas_peru.auth1.dto.PerfilUpdateDTO;
import com.sistema.olimpiadas_peru.auth1.security.AuthenticatedUser;
import com.sistema.olimpiadas_peru.auth1.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/perfil")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class PerfilController {

    private final UsuarioService usuarioService;

    @PutMapping
    public ResponseEntity<LoginResponseDTO> actualizarPerfil(
        @Valid @RequestBody PerfilUpdateDTO request,
        Authentication authentication
    ) {
        return ResponseEntity.ok(usuarioService.actualizarPerfil(getCurrentUserId(authentication), request));
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponseDTO> cambiarPassword(
        @Valid @RequestBody CambiarPasswordDTO request,
        Authentication authentication
    ) {
        usuarioService.cambiarPassword(
            getCurrentUserId(authentication),
            request.getPasswordActual(),
            request.getNuevaPassword()
        );
        return ResponseEntity.ok(ApiResponseDTO.builder()
            .mensaje("Contraseña actualizada correctamente")
            .build());
    }

    private Integer getCurrentUserId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser user)) {
            throw new IllegalStateException("No autenticado");
        }
        return user.id();
    }
}
