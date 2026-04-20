package com.sistema.olimpiadas_peru.institucion.controller;

import com.sistema.olimpiadas_peru.institucion.dto.InstitucionRequest;
import com.sistema.olimpiadas_peru.institucion.dto.InstitucionResponse;
import com.sistema.olimpiadas_peru.institucion.service.InstitucionService;
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
@RequestMapping("/api/instituciones")
@RequiredArgsConstructor
public class InstitucionController {

    private final InstitucionService institucionService;

    @GetMapping
    public ResponseEntity<List<InstitucionResponse>> findAll() {
        return ResponseEntity.ok(institucionService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InstitucionResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(institucionService.findById(id));
    }

    @PostMapping
    public ResponseEntity<InstitucionResponse> create(@Valid @RequestBody InstitucionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(institucionService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InstitucionResponse> update(@PathVariable Long id, @Valid @RequestBody InstitucionRequest request) {
        return ResponseEntity.ok(institucionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        institucionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
