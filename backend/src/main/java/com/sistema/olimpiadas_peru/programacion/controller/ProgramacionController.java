package com.sistema.olimpiadas_peru.programacion.controller;

import com.sistema.olimpiadas_peru.programacion.dto.PartidoRequest;
import com.sistema.olimpiadas_peru.programacion.dto.PartidoResponse;
import com.sistema.olimpiadas_peru.programacion.service.ProgramacionService;
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
@RequestMapping("/api/programaciones")
@RequiredArgsConstructor
public class ProgramacionController {

    private final ProgramacionService programacionService;

    @GetMapping
    public ResponseEntity<List<PartidoResponse>> findAll(@RequestParam(required = false) Long deporteId) {
        return ResponseEntity.ok(programacionService.findAll(deporteId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PartidoResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(programacionService.findById(id));
    }

    @PostMapping
    public ResponseEntity<PartidoResponse> create(@Valid @RequestBody PartidoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(programacionService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PartidoResponse> update(@PathVariable Long id, @Valid @RequestBody PartidoRequest request) {
        return ResponseEntity.ok(programacionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        programacionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
