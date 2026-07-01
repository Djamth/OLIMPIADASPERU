package com.sistema.olimpiadas_peru.notificacion.controller;

import com.sistema.olimpiadas_peru.notificacion.dto.NotificacionResumenResponse;
import com.sistema.olimpiadas_peru.notificacion.service.NotificacionService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class NotificacionController {

    private final NotificacionService notificacionService;

    @GetMapping
    public ResponseEntity<NotificacionResumenResponse> resumen(Authentication authentication) {
        return ResponseEntity.ok(notificacionService.resumen(authentication.getName()));
    }

    @PatchMapping("/{id}/leida")
    public ResponseEntity<Map<String, String>> marcarComoLeida(@PathVariable Long id, Authentication authentication) {
        notificacionService.marcarComoLeida(id, authentication.getName());
        return ResponseEntity.ok(Map.of("mensaje", "Notificación marcada como leída"));
    }

    @PatchMapping("/leidas")
    public ResponseEntity<Map<String, String>> marcarTodasComoLeidas(Authentication authentication) {
        notificacionService.marcarTodasComoLeidas(authentication.getName());
        return ResponseEntity.ok(Map.of("mensaje", "Notificaciones marcadas como leídas"));
    }
}
