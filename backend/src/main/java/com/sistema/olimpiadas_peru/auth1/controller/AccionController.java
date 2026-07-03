package com.sistema.olimpiadas_peru.auth1.controller;

import com.sistema.olimpiadas_peru.auth1.dto.AccionDTO;
import com.sistema.olimpiadas_peru.auth1.service.AccionService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/acciones")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AccionController {

    private final AccionService accionService;

    @GetMapping
    @PreAuthorize("@rolSecurityService.tienePermiso(authentication, 'acciones', 'VER')")
    public ResponseEntity<List<AccionDTO>> obtenerTodas() {
        return ResponseEntity.ok(accionService.obtenerTodas());
    }

    @GetMapping("/{id}")
    @PreAuthorize("@rolSecurityService.tienePermiso(authentication, 'acciones', 'VER')")
    public ResponseEntity<AccionDTO> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(accionService.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("@rolSecurityService.esAdministrador(authentication) and @rolSecurityService.tienePermiso(authentication, 'acciones', 'CREAR')")
    public ResponseEntity<AccionDTO> crearAccion(@RequestBody AccionDTO accionDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(accionService.crearAccion(accionDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@rolSecurityService.esAdministrador(authentication) and @rolSecurityService.tienePermiso(authentication, 'acciones', 'EDITAR')")
    public ResponseEntity<AccionDTO> actualizarAccion(@PathVariable Integer id, @RequestBody AccionDTO accionDTO) {
        return ResponseEntity.ok(accionService.actualizarAccion(id, accionDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@rolSecurityService.esAdministrador(authentication) and @rolSecurityService.tienePermiso(authentication, 'acciones', 'ELIMINAR')")
    public ResponseEntity<Void> eliminarAccion(@PathVariable Integer id) {
        accionService.eliminarAccion(id);
        return ResponseEntity.noContent().build();
    }
}
