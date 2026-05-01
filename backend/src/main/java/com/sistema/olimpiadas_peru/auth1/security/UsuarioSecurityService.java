package com.sistema.olimpiadas_peru.auth1.security;

import com.sistema.olimpiadas_peru.auth1.model.Usuario;
import com.sistema.olimpiadas_peru.auth1.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service("usuarioSecurityService")
@RequiredArgsConstructor
public class UsuarioSecurityService {

    private final UsuarioRepository usuarioRepository;
    private final RolSecurityService rolSecurityService;

    public boolean esOwnerOAdmin(Authentication authentication, Integer usuarioId) {
        if (rolSecurityService.esAdministrador(authentication)) {
            return true;
        }

        Usuario usuarioActual = getUsuario(authentication);
        return usuarioActual != null && usuarioActual.getId().equals(usuarioId);
    }

    public boolean esOwnerOAdminEmail(Authentication authentication, String email) {
        if (rolSecurityService.esAdministrador(authentication)) {
            return true;
        }

        Usuario usuarioActual = getUsuario(authentication);
        return usuarioActual != null && usuarioActual.getEmail().equalsIgnoreCase(email);
    }

    private Usuario getUsuario(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        return usuarioRepository.findByEmail(authentication.getName()).orElse(null);
    }
}
