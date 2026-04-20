package com.sistema.olimpiadas_peru.inscripcion.controller;

import com.sistema.olimpiadas_peru.inscripcion.dto.InscripcionRequest;
import com.sistema.olimpiadas_peru.inscripcion.dto.InscripcionResponse;
import com.sistema.olimpiadas_peru.inscripcion.service.InscripcionService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inscripciones")
@RequiredArgsConstructor
public class InscripcionController {

    private final InscripcionService inscripcionService;

    @GetMapping
    public ResponseEntity<List<InscripcionResponse>> findAll(@RequestParam(required = false) Long deporteId) {
        if (deporteId != null) {
            return ResponseEntity.ok(inscripcionService.findByDeporte(deporteId));
        }
        return ResponseEntity.ok(inscripcionService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InscripcionResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(inscripcionService.findById(id));
    }

    @PostMapping
    public ResponseEntity<InscripcionResponse> create(@Valid @RequestBody InscripcionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inscripcionService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InscripcionResponse> update(@PathVariable Long id, @Valid @RequestBody InscripcionRequest request) {
        return ResponseEntity.ok(inscripcionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        inscripcionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
