package com.sistema.olimpiadas_peru.estadistica.controller;

import com.sistema.olimpiadas_peru.estadistica.dto.GoleadorResponse;
import com.sistema.olimpiadas_peru.estadistica.dto.RankingEquipoResponse;
import com.sistema.olimpiadas_peru.estadistica.service.EstadisticaService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/estadisticas")
@RequiredArgsConstructor
public class EstadisticaController {

    private final EstadisticaService estadisticaService;

    @GetMapping("/deporte/{deporteId}/goleadores")
    public ResponseEntity<List<GoleadorResponse>> obtenerGoleadores(@PathVariable Long deporteId) {
        return ResponseEntity.ok(estadisticaService.obtenerGoleadores(deporteId));
    }

    @GetMapping("/deporte/{deporteId}/ranking")
    public ResponseEntity<List<RankingEquipoResponse>> obtenerRanking(@PathVariable Long deporteId) {
        return ResponseEntity.ok(estadisticaService.obtenerRanking(deporteId));
    }
}
