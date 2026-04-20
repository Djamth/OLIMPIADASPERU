package com.sistema.olimpiadas_peru.deporte.controller;

import com.sistema.olimpiadas_peru.deporte.dto.DeporteRequest;
import com.sistema.olimpiadas_peru.deporte.dto.DeporteResponse;
import com.sistema.olimpiadas_peru.deporte.service.DeporteService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/deportes")
@RequiredArgsConstructor
public class DeporteController {

    private final DeporteService deporteService;

    @GetMapping
    public ResponseEntity<List<DeporteResponse>> findAll() {
        return ResponseEntity.ok(deporteService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeporteResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(deporteService.findById(id));
    }

    @PostMapping
    public ResponseEntity<DeporteResponse> create(@Valid @RequestBody DeporteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(deporteService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DeporteResponse> update(@PathVariable Long id, @Valid @RequestBody DeporteRequest request) {
        return ResponseEntity.ok(deporteService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        deporteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
