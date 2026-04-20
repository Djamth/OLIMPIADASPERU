package com.sistema.olimpiadas_peru.sorteo.controller;

import com.sistema.olimpiadas_peru.sorteo.dto.GrupoResponse;
import com.sistema.olimpiadas_peru.sorteo.service.SorteoService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sorteos")
@RequiredArgsConstructor
public class SorteoController {

    private final SorteoService sorteoService;

    @PostMapping("/deporte/{deporteId}/grupos")
    public ResponseEntity<List<GrupoResponse>> generarGrupos(@PathVariable Long deporteId) {
        return ResponseEntity.ok(sorteoService.generarGrupos(deporteId));
    }

    @GetMapping("/deporte/{deporteId}/grupos")
    public ResponseEntity<List<GrupoResponse>> listarGrupos(@PathVariable Long deporteId) {
        return ResponseEntity.ok(sorteoService.listarPorDeporte(deporteId));
    }
}
