package com.sistema.olimpiadas_peru.participante.controller;

import com.sistema.olimpiadas_peru.participante.dto.ParticipanteRequest;
import com.sistema.olimpiadas_peru.participante.dto.ParticipanteResponse;
import com.sistema.olimpiadas_peru.participante.service.ParticipanteService;
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
@RequestMapping("/api/participantes")
@RequiredArgsConstructor
@PreAuthorize("@rolSecurityService.tieneModulo(authentication, 'participantes')")
public class ParticipanteController {

    private final ParticipanteService participanteService;

    @GetMapping
    public ResponseEntity<List<ParticipanteResponse>> findAll(@RequestParam(required = false) Long equipoId) {
        return ResponseEntity.ok(participanteService.findAll(equipoId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ParticipanteResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(participanteService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ParticipanteResponse> create(@Valid @RequestBody ParticipanteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(participanteService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ParticipanteResponse> update(@PathVariable Long id, @Valid @RequestBody ParticipanteRequest request) {
        return ResponseEntity.ok(participanteService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        participanteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
