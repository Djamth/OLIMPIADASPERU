package com.sistema.olimpiadas_peru.auth1.security;

import com.sistema.olimpiadas_peru.auth1.model.Modulo;
import com.sistema.olimpiadas_peru.auth1.model.Rol;
import com.sistema.olimpiadas_peru.auth1.model.Usuario;
import com.sistema.olimpiadas_peru.auth1.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.text.Normalizer;

@Service("rolSecurityService")
@RequiredArgsConstructor
public class RolSecurityService {

    private final UsuarioRepository usuarioRepository;

    public boolean esAdministrador(Authentication authentication) {
        Usuario usuario = getUsuario(authentication);
        return usuario != null
            && usuario.getEstado() == Usuario.Estado.ACTIVO
            && usuario.getRol() != null
            && usuario.getRol().getEstado() == Rol.Estado.ACTIVO
            && "administrador".equalsIgnoreCase(usuario.getRol().getNombre());
    }

    public boolean tieneModulo(Authentication authentication, String moduloBuscado) {
        Usuario usuario = getUsuario(authentication);
        if (usuario == null
            || usuario.getEstado() != Usuario.Estado.ACTIVO
            || usuario.getRol() == null
            || usuario.getRol().getEstado() != Rol.Estado.ACTIVO) {
            return false;
        }

        if ("administrador".equalsIgnoreCase(usuario.getRol().getNombre())) {
            return true;
        }

        String buscado = normalizar(moduloBuscado);
        return usuario.getRol().getModulos().stream().anyMatch(modulo -> coincideModulo(modulo, buscado));
    }

    private Usuario getUsuario(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        return usuarioRepository.findWithRolAndModulosByEmail(authentication.getName()).orElse(null);
    }

    private boolean coincideModulo(Modulo modulo, String buscado) {
        String nombre = normalizar(modulo.getNombre());
        String ruta = normalizar(modulo.getRuta());
        return nombre.equals(buscado)
            || ruta.equals(buscado)
            || nombre.contains(buscado)
            || buscado.contains(nombre)
            || ruta.contains(buscado)
            || buscado.contains(ruta);
    }

    private String normalizar(String value) {
        if (value == null) {
            return "";
        }
        return Normalizer.normalize(value, Normalizer.Form.NFD)
            .replaceAll("\\p{M}", "")
            .replace("/", "")
            .replaceAll("[^a-zA-Z0-9]", "")
            .toLowerCase();
    }
}
