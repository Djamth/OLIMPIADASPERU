package com.sistema.olimpiadas_peru.equipo.controller;

import com.sistema.olimpiadas_peru.equipo.dto.EquipoRequest;
import com.sistema.olimpiadas_peru.equipo.dto.EquipoResponse;
import com.sistema.olimpiadas_peru.equipo.service.EquipoService;
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
@RequestMapping("/api/equipos")
@RequiredArgsConstructor
public class EquipoController {

    private final EquipoService equipoService;

    @GetMapping
    public ResponseEntity<List<EquipoResponse>> findAll() {
        return ResponseEntity.ok(equipoService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipoResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(equipoService.findById(id));
    }

    @PostMapping
    public ResponseEntity<EquipoResponse> create(@Valid @RequestBody EquipoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(equipoService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EquipoResponse> update(@PathVariable Long id, @Valid @RequestBody EquipoRequest request) {
        return ResponseEntity.ok(equipoService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        equipoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
