package com.sistema.olimpiadas_peru.auth1.controller;

import com.sistema.olimpiadas_peru.auth1.dto.AuditoriaDTO;
import com.sistema.olimpiadas_peru.auth1.service.AuditoriaService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auditoria")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("@rolSecurityService.esAdministrador(authentication) and @rolSecurityService.tieneModulo(authentication, 'auditoria')")
public class AuditoriaController {

    private final AuditoriaService auditoriaService;

    @GetMapping
    public ResponseEntity<List<AuditoriaDTO>> listarRecientes() {
        return ResponseEntity.ok(auditoriaService.listarRecientes());
    }
}
