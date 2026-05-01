package com.sistema.olimpiadas_peru.auth1.controller;

import com.sistema.olimpiadas_peru.auth1.dto.AsignarModulosRolDTO;
import com.sistema.olimpiadas_peru.auth1.dto.RolDTO;
import com.sistema.olimpiadas_peru.auth1.dto.RolModulosDTO;
import com.sistema.olimpiadas_peru.auth1.service.RolService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RolController {
    
    private final RolService rolService;
    
    @PostMapping
    @PreAuthorize("@rolSecurityService.esAdministrador(authentication)")
    public ResponseEntity<RolDTO> crearRol(@RequestBody RolDTO rolDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rolService.crearRol(rolDTO));
    }
    
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<RolDTO>> obtenerTodos() {
        return ResponseEntity.ok(rolService.obtenerTodos());
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RolDTO> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(rolService.obtenerPorId(id));
    }

    @GetMapping("/{id}/modulos")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RolModulosDTO> obtenerModulos(@PathVariable Integer id) {
        return ResponseEntity.ok(rolService.obtenerRolModulos(id));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("@rolSecurityService.esAdministrador(authentication)")
    public ResponseEntity<RolDTO> actualizarRol(@PathVariable Integer id, @RequestBody RolDTO rolDTO) {
        return ResponseEntity.ok(rolService.actualizarRol(id, rolDTO));
    }

    @PutMapping("/{id}/modulos")
    @PreAuthorize("@rolSecurityService.esAdministrador(authentication)")
    public ResponseEntity<RolModulosDTO> asignarModulos(@PathVariable Integer id, @RequestBody AsignarModulosRolDTO asignarModulosRolDTO) {
        return ResponseEntity.ok(rolService.asignarModulos(id, asignarModulosRolDTO));
    }

    @PostMapping("/{rolId}/modulos/{moduloId}")
    @PreAuthorize("@rolSecurityService.esAdministrador(authentication)")
    public ResponseEntity<RolModulosDTO> agregarModuloAlRol(@PathVariable Integer rolId, @PathVariable Integer moduloId) {
        return ResponseEntity.ok(rolService.agregarModuloAlRol(rolId, moduloId));
    }

    @DeleteMapping("/{rolId}/modulos/{moduloId}")
    @PreAuthorize("@rolSecurityService.esAdministrador(authentication)")
    public ResponseEntity<RolModulosDTO> removerModuloDelRol(@PathVariable Integer rolId, @PathVariable Integer moduloId) {
        return ResponseEntity.ok(rolService.removerModuloDelRol(rolId, moduloId));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("@rolSecurityService.esAdministrador(authentication)")
    public ResponseEntity<Void> eliminarRol(@PathVariable Integer id) {
        rolService.eliminarRol(id);
        return ResponseEntity.noContent().build();
    }
}
