package com.sistema.olimpiadas_peru.auth1.security;

import com.sistema.olimpiadas_peru.auth1.model.Modulo;
import com.sistema.olimpiadas_peru.auth1.model.Rol;
import com.sistema.olimpiadas_peru.auth1.model.Usuario;
import com.sistema.olimpiadas_peru.auth1.repository.UsuarioRepository;
import jakarta.servlet.http.HttpServletRequest;
import java.text.Normalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service("rolSecurityService")
@RequiredArgsConstructor
public class RolSecurityService {

    private final UsuarioRepository usuarioRepository;
    private final JdbcTemplate jdbcTemplate;

    public boolean esAdministrador(Authentication authentication) {
        Usuario usuario = getUsuario(authentication);
        return usuario != null
            && usuario.getEstado() == Usuario.Estado.ACTIVO
            && usuario.getRol() != null
            && usuario.getRol().getEstado() == Rol.Estado.ACTIVO
            && "administrador".equalsIgnoreCase(usuario.getRol().getNombre());
    }

    public boolean tieneModulo(Authentication authentication, String moduloBuscado) {
        return tienePermiso(authentication, moduloBuscado, accionDesdeRequest());
    }

    public boolean tienePermiso(Authentication authentication, String moduloBuscado, String accion) {
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
        return usuario.getRol().getModulos().stream()
            .filter(modulo -> coincideModulo(modulo, buscado))
            .anyMatch(modulo -> tienePermisoModulo(usuario.getRol().getId(), modulo.getId(), accion));
    }

    private boolean tienePermisoModulo(Integer rolId, Integer moduloId, String accion) {
        String columna = switch (normalizarAccion(accion)) {
            case "CREAR" -> "puede_crear";
            case "EDITAR" -> "puede_editar";
            case "ELIMINAR" -> "puede_eliminar";
            case "EXPORTAR" -> "puede_exportar";
            default -> "puede_ver";
        };

        try {
            Boolean permitido = jdbcTemplate.queryForObject(
                "select " + columna + " from rol_modulos where rol_id = ? and modulo_id = ?",
                Boolean.class,
                rolId,
                moduloId
            );
            return Boolean.TRUE.equals(permitido);
        } catch (EmptyResultDataAccessException exception) {
            return false;
        } catch (BadSqlGrammarException exception) {
            return true;
        }
    }

    private String accionDesdeRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return "VER";
        }

        HttpServletRequest request = attributes.getRequest();
        String uri = request.getRequestURI() == null ? "" : request.getRequestURI().toLowerCase();
        if (uri.contains("/reporte") || uri.contains("/reportes") || uri.contains("/pdf") || uri.contains("/export")) {
            return "EXPORTAR";
        }

        return switch (request.getMethod().toUpperCase()) {
            case "POST" -> "CREAR";
            case "PUT", "PATCH" -> "EDITAR";
            case "DELETE" -> "ELIMINAR";
            default -> "VER";
        };
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

    private String normalizarAccion(String accion) {
        if (accion == null || accion.isBlank()) {
            return "VER";
        }
        return accion.trim().toUpperCase();
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
