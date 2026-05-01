package com.sistema.olimpiadas_peru.auth1.controller;

import com.sistema.olimpiadas_peru.auth1.dto.ModuloDTO;
import com.sistema.olimpiadas_peru.auth1.service.ModuloService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/modulos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ModuloController {
    
    private final ModuloService moduloService;
    
    @PostMapping
    @PreAuthorize("@rolSecurityService.esAdministrador(authentication)")
    public ResponseEntity<ModuloDTO> crearModulo(@RequestBody ModuloDTO moduloDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(moduloService.crearModulo(moduloDTO));
    }
    
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ModuloDTO>> obtenerTodos() {
        return ResponseEntity.ok(moduloService.obtenerTodos());
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ModuloDTO> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(moduloService.obtenerPorId(id));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("@rolSecurityService.esAdministrador(authentication)")
    public ResponseEntity<ModuloDTO> actualizarModulo(@PathVariable Integer id, @RequestBody ModuloDTO moduloDTO) {
        return ResponseEntity.ok(moduloService.actualizarModulo(id, moduloDTO));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("@rolSecurityService.esAdministrador(authentication)")
    public ResponseEntity<Void> eliminarModulo(@PathVariable Integer id) {
        moduloService.eliminarModulo(id);
        return ResponseEntity.noContent().build();
    }
}
