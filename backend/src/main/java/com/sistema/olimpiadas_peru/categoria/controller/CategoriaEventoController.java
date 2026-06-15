package com.sistema.olimpiadas_peru.categoria.controller;

import com.sistema.olimpiadas_peru.categoria.dto.CategoriaEventoRequest;
import com.sistema.olimpiadas_peru.categoria.dto.CategoriaEventoResponse;
import com.sistema.olimpiadas_peru.categoria.service.CategoriaEventoService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/categorias-evento")
@RequiredArgsConstructor
@PreAuthorize("@rolSecurityService.tieneModulo(authentication, 'instituciones')")
public class CategoriaEventoController {

    private final CategoriaEventoService service;

    @GetMapping
    public List<CategoriaEventoResponse> findAll(@RequestParam(required = false) Long eventoId) {
        return service.findAll(eventoId);
    }

    @PostMapping
    public ResponseEntity<CategoriaEventoResponse> create(@Valid @RequestBody CategoriaEventoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    public CategoriaEventoResponse update(@PathVariable Long id,
                                           @Valid @RequestBody CategoriaEventoRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
