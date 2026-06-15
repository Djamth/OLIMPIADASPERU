package com.sistema.olimpiadas_peru.evento.controller;

import com.sistema.olimpiadas_peru.evento.dto.EventoRequest;
import com.sistema.olimpiadas_peru.evento.dto.EventoResponse;
import com.sistema.olimpiadas_peru.evento.dto.ReplicarEventoRequest;
import com.sistema.olimpiadas_peru.evento.service.EventoService;
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
@RequestMapping("/api/eventos")
@RequiredArgsConstructor
@PreAuthorize("@rolSecurityService.tieneModulo(authentication, 'instituciones')")
public class EventoController {

    private final EventoService service;

    @GetMapping
    public List<EventoResponse> findAll(@RequestParam(required = false) Long institucionId) {
        return service.findAll(institucionId);
    }

    @PostMapping
    public ResponseEntity<EventoResponse> create(@Valid @RequestBody EventoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    public EventoResponse update(@PathVariable Long id, @Valid @RequestBody EventoRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/siguiente-edicion")
    public ResponseEntity<EventoResponse> replicar(
            @PathVariable Long id,
            @RequestBody ReplicarEventoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.replicarSiguienteEdicion(id, request));
    }
}
