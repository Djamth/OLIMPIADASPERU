package com.sistema.olimpiadas_peru.auth1.controller;

import com.sistema.olimpiadas_peru.auth1.dto.UsuarioCreateDTO;
import com.sistema.olimpiadas_peru.auth1.dto.UsuarioDTO;
import com.sistema.olimpiadas_peru.auth1.security.AuthenticatedUser;
import com.sistema.olimpiadas_peru.auth1.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UsuarioController {
    
    private final UsuarioService usuarioService;
    
    @PostMapping
    @PreAuthorize("@rolSecurityService.esAdministrador(authentication) and @rolSecurityService.tieneModulo(authentication, 'usuarios')")
    public ResponseEntity<UsuarioDTO> crearUsuario(@RequestBody UsuarioCreateDTO usuarioCreateDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.crearUsuario(usuarioCreateDTO));
    }
    
    @GetMapping
    @PreAuthorize("@rolSecurityService.tieneModulo(authentication, 'usuarios')")
    public ResponseEntity<List<UsuarioDTO>> obtenerTodos() {
        return ResponseEntity.ok(usuarioService.obtenerTodos());
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("@usuarioSecurityService.esOwnerOAdmin(authentication, #id)")
    public ResponseEntity<UsuarioDTO> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(usuarioService.obtenerPorId(id));
    }
    
    @GetMapping("/email/{email}")
    @PreAuthorize("@usuarioSecurityService.esOwnerOAdminEmail(authentication, #email)")
    public ResponseEntity<UsuarioDTO> obtenerPorEmail(@PathVariable String email) {
        return ResponseEntity.ok(usuarioService.obtenerPorEmail(email));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("@rolSecurityService.esAdministrador(authentication) and @rolSecurityService.tieneModulo(authentication, 'usuarios')")
    public ResponseEntity<UsuarioDTO> actualizarUsuario(@PathVariable Integer id, @RequestBody UsuarioDTO usuarioDTO) {
        return ResponseEntity.ok(usuarioService.actualizarUsuario(id, usuarioDTO));
    }
    
    @PutMapping("/{id}/desactivar")
    @PreAuthorize("@rolSecurityService.esAdministrador(authentication) and @rolSecurityService.tieneModulo(authentication, 'usuarios')")
    public ResponseEntity<Void> desactivarUsuario(@PathVariable Integer id, Authentication authentication) {
        usuarioService.desactivarUsuario(id, getCurrentUserId(authentication));
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("@rolSecurityService.esAdministrador(authentication) and @rolSecurityService.tieneModulo(authentication, 'usuarios')")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Integer id, Authentication authentication) {
        usuarioService.eliminiarUsuario(id, getCurrentUserId(authentication));
        return ResponseEntity.noContent().build();
    }

    private Integer getCurrentUserId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser user)) {
            return null;
        }
        return user.id();
    }
}
