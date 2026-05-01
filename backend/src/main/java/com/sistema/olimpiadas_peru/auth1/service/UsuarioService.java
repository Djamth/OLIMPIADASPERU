package com.sistema.olimpiadas_peru.auth1.service;

import com.sistema.olimpiadas_peru.auth1.dto.LoginRequestDTO;
import com.sistema.olimpiadas_peru.auth1.dto.LoginResponseDTO;
import com.sistema.olimpiadas_peru.auth1.dto.ModuloDTO;
import com.sistema.olimpiadas_peru.auth1.dto.UsuarioCreateDTO;
import com.sistema.olimpiadas_peru.auth1.dto.UsuarioDTO;
import com.sistema.olimpiadas_peru.auth1.model.Modulo;
import com.sistema.olimpiadas_peru.auth1.model.Rol;
import com.sistema.olimpiadas_peru.auth1.model.Usuario;
import com.sistema.olimpiadas_peru.auth1.repository.PasswordResetTokenRepository;
import com.sistema.olimpiadas_peru.auth1.repository.UsuarioRepository;
import com.sistema.olimpiadas_peru.auth1.security.JwtTokenProvider;
import com.sistema.olimpiadas_peru.auth1.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RolService rolService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuditoriaService auditoriaService;

    public UsuarioDTO crearUsuario(UsuarioCreateDTO usuarioCreateDTO) {
        Usuario usuarioExistente = usuarioRepository.findByEmail(usuarioCreateDTO.getEmail()).orElse(null);
        if (usuarioExistente != null) {
            throw new RuntimeException("El email ya esta registrado");
        }

        Rol rol = rolService.obtenerRolPorId(usuarioCreateDTO.getRolId());

        Usuario usuario = Usuario.builder()
            .nombre(usuarioCreateDTO.getNombre())
            .email(usuarioCreateDTO.getEmail())
            .password(passwordEncoder.encode(usuarioCreateDTO.getPassword()))
            .rol(rol)
            .estado(Usuario.Estado.ACTIVO)
            .eliminado(false)
            .build();

        return mapearADTO(usuarioRepository.save(usuario));
    }

    public List<UsuarioDTO> obtenerTodos() {
        return usuarioRepository.findAllVisible()
            .stream()
            .map(this::mapearADTO)
            .collect(Collectors.toList());
    }

    public UsuarioDTO obtenerPorId(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return mapearADTO(usuario);
    }

    public UsuarioDTO obtenerPorEmail(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return mapearADTO(usuario);
    }

    public LoginResponseDTO login(LoginRequestDTO loginRequestDTO) {
        Usuario usuario = usuarioRepository.findWithRolAndModulosByEmail(loginRequestDTO.getEmail())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales invalidas"));

        if (!passwordEncoder.matches(loginRequestDTO.getPassword(), usuario.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales invalidas");
        }

        if (usuario.getEstado() != Usuario.Estado.ACTIVO) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "El usuario esta inactivo");
        }

        return LoginResponseDTO.builder()
            .id(usuario.getId())
            .nombre(usuario.getNombre())
            .email(usuario.getEmail())
            .rolId(usuario.getRol() != null ? usuario.getRol().getId() : null)
            .rolNombre(usuario.getRol() != null ? usuario.getRol().getNombre() : null)
            .estado(usuario.getEstado().toString())
            .modulos(usuario.getRol() != null
                ? usuario.getRol().getModulos().stream()
                    .filter(Objects::nonNull)
                    .sorted(Comparator.comparing(Modulo::getId, Comparator.nullsLast(Integer::compareTo)))
                    .map(this::mapearModuloADTO)
                    .collect(Collectors.toList())
                : List.of())
            .accessToken(jwtTokenProvider.generateAccessToken(usuario.getEmail(), usuario.getId()))
            .refreshToken(jwtTokenProvider.generateRefreshToken(usuario.getEmail(), usuario.getId()))
            .expiresIn(jwtTokenProvider.getAccessTokenExpirationMs())
            .tokenType("Bearer")
            .build();
    }

    public UsuarioDTO actualizarUsuario(Integer id, UsuarioDTO usuarioDTO) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setNombre(usuarioDTO.getNombre());
        if (SecurityUtils.isAdmin() && usuarioDTO.getRolId() != null) {
            Rol rol = rolService.obtenerRolPorId(usuarioDTO.getRolId());
            usuario.setRol(rol);
        }
        if (SecurityUtils.isAdmin() && usuarioDTO.getEstado() != null) {
            usuario.setEstado(Usuario.Estado.valueOf(usuarioDTO.getEstado()));
        }

        return mapearADTO(usuarioRepository.save(usuario));
    }

    public void desactivarUsuario(Integer id, Integer usuarioActualId) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (id.equals(usuarioActualId)) {
            throw new RuntimeException("No puedes desactivarte a ti mismo");
        }

        validarUltimoAdministrador(usuario);
        usuario.setEstado(Usuario.Estado.INACTIVO);
        usuarioRepository.save(usuario);

        auditoriaService.registrar(
            usuarioActualId,
            "DESACTIVAR_USUARIO",
            String.format("Usuario '%s' (%s) desactivado", usuario.getNombre(), usuario.getEmail())
        );
    }

    @Transactional
    public void eliminiarUsuario(Integer id, Integer usuarioActualId) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (id.equals(usuarioActualId)) {
            throw new RuntimeException("No puedes eliminarte a ti mismo");
        }

        validarUltimoAdministrador(usuario);
        if (Boolean.TRUE.equals(usuario.getEliminado())) {
            throw new RuntimeException("El usuario ya fue eliminado");
        }

        passwordResetTokenRepository.deleteByUsuario_Id(usuario.getId());
        usuario.setEstado(Usuario.Estado.INACTIVO);
        usuario.setEliminado(true);
        usuarioRepository.save(usuario);

        auditoriaService.registrar(
            usuarioActualId,
            "ELIMINAR_USUARIO",
            String.format("Usuario '%s' (%s) marcado como eliminado", usuario.getNombre(), usuario.getEmail())
        );
    }

    public Usuario obtenerUsuarioPorId(Integer id) {
        return usuarioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public Usuario obtenerUsuarioPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    private void validarUltimoAdministrador(Usuario usuario) {
        if (usuario.getRol() == null || !"administrador".equalsIgnoreCase(usuario.getRol().getNombre())) {
            return;
        }

        long administradoresActivos = usuarioRepository.countByRol_NombreIgnoreCaseAndEstado(
            "administrador",
            Usuario.Estado.ACTIVO
        );

        if (administradoresActivos <= 1 && usuario.getEstado() == Usuario.Estado.ACTIVO) {
            throw new RuntimeException("No se puede modificar el ultimo administrador activo");
        }
    }

    private UsuarioDTO mapearADTO(Usuario usuario) {
        return UsuarioDTO.builder()
            .id(usuario.getId())
            .nombre(usuario.getNombre())
            .email(usuario.getEmail())
            .rolId(usuario.getRol() != null ? usuario.getRol().getId() : null)
            .estado(usuario.getEstado().toString())
            .build();
    }

    private ModuloDTO mapearModuloADTO(Modulo modulo) {
        return ModuloDTO.builder()
            .id(modulo.getId())
            .nombre(modulo.getNombre())
            .ruta(modulo.getRuta())
            .icono(modulo.getIcono())
            .build();
    }
}
