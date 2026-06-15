package com.sistema.olimpiadas_peru.auth1.security;

import com.sistema.olimpiadas_peru.auth1.model.Usuario;
import com.sistema.olimpiadas_peru.auth1.repository.UsuarioRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;

@Service
@RequiredArgsConstructor
public class InstitucionAccessService {

    private final UsuarioRepository usuarioRepository;

    public Optional<Long> institucionActual() {
        String email = SecurityUtils.getCurrentUserEmail();
        if (email == null) {
            return Optional.empty();
        }
        return usuarioRepository.findByEmail(email)
                .filter(usuario -> !esAdministrador(usuario))
                .map(Usuario::getInstitucion)
                .map(institucion -> institucion.getId());
    }

    public void validar(Long institucionId) {
        institucionActual().ifPresent(actual -> {
            if (!actual.equals(institucionId)) {
                throw new AccessDeniedException("No tiene acceso a recursos de otra institución");
            }
        });
    }

    private boolean esAdministrador(Usuario usuario) {
        return usuario.getRol() != null
                && "administrador".equalsIgnoreCase(usuario.getRol().getNombre());
    }
}
