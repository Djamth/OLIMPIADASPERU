package com.sistema.olimpiadas_peru.resultado.controller;

import com.sistema.olimpiadas_peru.resultado.dto.ResultadoRequest;
import com.sistema.olimpiadas_peru.resultado.dto.ResultadoResponse;
import com.sistema.olimpiadas_peru.resultado.service.ResultadoService;
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
@RequestMapping("/api/resultados")
@RequiredArgsConstructor
public class ResultadoController {

    private final ResultadoService resultadoService;

    @GetMapping
    public ResponseEntity<List<ResultadoResponse>> findAll(@RequestParam(required = false) Long deporteId) {
        return ResponseEntity.ok(resultadoService.findAll(deporteId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResultadoResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(resultadoService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ResultadoResponse> create(@Valid @RequestBody ResultadoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resultadoService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResultadoResponse> update(@PathVariable Long id, @Valid @RequestBody ResultadoRequest request) {
        return ResponseEntity.ok(resultadoService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        resultadoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
