package com.sistema.olimpiadas_peru.pais.controller;

import com.sistema.olimpiadas_peru.pais.dto.PaisRequest;
import com.sistema.olimpiadas_peru.pais.dto.PaisResponse;
import com.sistema.olimpiadas_peru.pais.service.PaisService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/paises")
@RequiredArgsConstructor
@PreAuthorize("@rolSecurityService.tieneModulo(authentication, 'instituciones')")
public class PaisController {

    private final PaisService service;

    @GetMapping
    public List<PaisResponse> findAll() {
        return service.findAll();
    }

    @PostMapping
    @PreAuthorize("@rolSecurityService.esAdministrador(authentication)")
    public ResponseEntity<PaisResponse> create(@Valid @RequestBody PaisRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@rolSecurityService.esAdministrador(authentication)")
    public PaisResponse update(@PathVariable Long id, @Valid @RequestBody PaisRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@rolSecurityService.esAdministrador(authentication)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
