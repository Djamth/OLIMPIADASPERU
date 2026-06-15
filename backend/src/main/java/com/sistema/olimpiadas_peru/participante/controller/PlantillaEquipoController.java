package com.sistema.olimpiadas_peru.participante.controller;

import com.sistema.olimpiadas_peru.participante.dto.PlantillaEquipoRequest;
import com.sistema.olimpiadas_peru.participante.dto.PlantillaEquipoResponse;
import com.sistema.olimpiadas_peru.participante.service.ParticipanteService;
import com.sistema.olimpiadas_peru.participante.service.PlantillaEquipoService;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/plantillas")
@RequiredArgsConstructor
@PreAuthorize("@rolSecurityService.tieneModulo(authentication, 'participantes')")
public class PlantillaEquipoController {

    private final PlantillaEquipoService service;
    private final ParticipanteService participanteService;

    @GetMapping
    public List<PlantillaEquipoResponse> findAll(@RequestParam(required = false) Long equipoId,
                                                 @RequestParam(required = false) Long participanteId) {
        return service.findAll(equipoId, participanteId);
    }

    @PostMapping
    public ResponseEntity<PlantillaEquipoResponse> create(@Valid @RequestBody PlantillaEquipoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request, participanteService));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
