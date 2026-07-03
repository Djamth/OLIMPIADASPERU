package com.sistema.olimpiadas_peru.auth1.service;

import com.sistema.olimpiadas_peru.auth1.dto.LoginRequestDTO;
import com.sistema.olimpiadas_peru.auth1.dto.LoginResponseDTO;
import com.sistema.olimpiadas_peru.auth1.dto.ModuloDTO;
import com.sistema.olimpiadas_peru.auth1.dto.ModuloPermisoDTO;
import com.sistema.olimpiadas_peru.auth1.dto.PerfilUpdateDTO;
import com.sistema.olimpiadas_peru.auth1.dto.RefreshTokenResponseDTO;
import com.sistema.olimpiadas_peru.auth1.dto.UsuarioCreateDTO;
import com.sistema.olimpiadas_peru.auth1.dto.UsuarioDTO;
import com.sistema.olimpiadas_peru.auth1.model.Modulo;
import com.sistema.olimpiadas_peru.auth1.model.Rol;
import com.sistema.olimpiadas_peru.auth1.model.Usuario;
import com.sistema.olimpiadas_peru.auth1.repository.PasswordResetTokenRepository;
import com.sistema.olimpiadas_peru.auth1.repository.UsuarioRepository;
import com.sistema.olimpiadas_peru.auth1.security.JwtTokenProvider;
import com.sistema.olimpiadas_peru.auth1.security.SecurityUtils;
import com.sistema.olimpiadas_peru.auth1.security.TokenBlacklistService;
import com.sistema.olimpiadas_peru.institucion.service.InstitucionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.Map;
import java.util.List;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RolService rolService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenBlacklistService tokenBlacklistService;
    private final AuditoriaService auditoriaService;
    private final InstitucionService institucionService;
    private final JdbcTemplate jdbcTemplate;

    @Transactional
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
            .institucion(usuarioCreateDTO.getInstitucionId() == null
                ? null : institucionService.getEntity(usuarioCreateDTO.getInstitucionId()))
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

    @Transactional
    public LoginResponseDTO actualizarPerfil(Integer usuarioId, PerfilUpdateDTO perfilUpdateDTO) {
        Usuario usuario = usuarioRepository.findWithRolAndModulosById(usuarioId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        String nuevoEmail = perfilUpdateDTO.getEmail().trim();
        if (!nuevoEmail.equalsIgnoreCase(usuario.getEmail())) {
            usuarioRepository.findByEmail(nuevoEmail).ifPresent(existente -> {
                if (!existente.getId().equals(usuario.getId())) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un usuario con ese correo");
                }
            });
            usuario.setEmail(nuevoEmail);
        }

        usuario.setNombre(perfilUpdateDTO.getNombre().trim());
        Usuario actualizado = usuarioRepository.save(usuario);
        auditoriaService.registrar(
            usuarioId,
            "ACTUALIZAR_PERFIL",
            String.format("El usuario '%s' actualizó su perfil", actualizado.getEmail())
        );

        return mapearSesion(actualizado, null, null, "Cookie");
    }

    @Transactional
    public void cambiarPassword(Integer usuarioId, String passwordActual, String nuevaPassword) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if (!passwordEncoder.matches(passwordActual, usuario.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña actual no es correcta");
        }

        if (passwordEncoder.matches(nuevaPassword, usuario.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La nueva contraseña debe ser diferente a la actual");
        }

        usuario.setPassword(passwordEncoder.encode(nuevaPassword));
        usuarioRepository.save(usuario);

        auditoriaService.registrar(
            usuarioId,
            "CAMBIAR_PASSWORD",
            String.format("El usuario '%s' cambió su contraseña", usuario.getEmail())
        );
    }

    public LoginResponseDTO obtenerSesionActual(String email) {
        Usuario usuario = usuarioRepository.findWithRolAndModulosByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return mapearSesion(usuario, null, null, "Cookie");
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

        return mapearSesion(
            usuario,
            jwtTokenProvider.generateAccessToken(usuario.getEmail(), usuario.getId()),
            jwtTokenProvider.generateRefreshToken(usuario.getEmail(), usuario.getId()),
            "Bearer"
        );
    }

    public RefreshTokenResponseDTO renovarSesion(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)
            || tokenBlacklistService.isBlacklisted(refreshToken)
            || !"REFRESH".equalsIgnoreCase(jwtTokenProvider.getTokenType(refreshToken))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token invalido o expirado");
        }

        Integer userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        Usuario usuario = usuarioRepository.findWithRolAndModulosById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no disponible"));

        boolean sesionHabilitada = usuario.getEstado() == Usuario.Estado.ACTIVO
            && !Boolean.TRUE.equals(usuario.getEliminado())
            && usuario.getRol() != null
            && usuario.getRol().getEstado() == Rol.Estado.ACTIVO;

        if (!sesionHabilitada) {
            tokenBlacklistService.blacklist(refreshToken);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "La sesion ya no esta habilitada");
        }

        tokenBlacklistService.blacklist(refreshToken);
        String nuevoAccessToken = jwtTokenProvider.generateAccessToken(usuario.getEmail(), usuario.getId());
        String nuevoRefreshToken = jwtTokenProvider.generateRefreshToken(usuario.getEmail(), usuario.getId());

        return RefreshTokenResponseDTO.builder()
            .accessToken(nuevoAccessToken)
            .refreshToken(nuevoRefreshToken)
            .expiresIn(jwtTokenProvider.getAccessTokenExpirationMs())
            .tokenType("Bearer")
            .build();
    }

    @Transactional
    public UsuarioDTO actualizarUsuario(Integer id, UsuarioDTO usuarioDTO) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuarioDTO.getEmail() != null && !usuarioDTO.getEmail().equalsIgnoreCase(usuario.getEmail())) {
            usuarioRepository.findByEmail(usuarioDTO.getEmail()).ifPresent(existente -> {
                throw new RuntimeException("Ya existe un usuario con ese email");
            });
            usuario.setEmail(usuarioDTO.getEmail());
        }
        usuario.setNombre(usuarioDTO.getNombre());
        if (SecurityUtils.isAdmin() && usuarioDTO.getRolId() != null) {
            Rol rol = rolService.obtenerRolPorId(usuarioDTO.getRolId());
            usuario.setRol(rol);
        }
        if (SecurityUtils.isAdmin() && usuarioDTO.getEstado() != null) {
            Usuario.Estado nuevoEstado = Usuario.Estado.valueOf(usuarioDTO.getEstado());
            if (id.equals(SecurityUtils.getCurrentUserId()) && nuevoEstado == Usuario.Estado.INACTIVO) {
                throw new RuntimeException("No puedes desactivarte a ti mismo");
            }
            if (nuevoEstado == Usuario.Estado.INACTIVO) {
                validarUltimoAdministrador(usuario);
            }
            usuario.setEstado(nuevoEstado);
        }
        if (SecurityUtils.isAdmin()) {
            usuario.setInstitucion(usuarioDTO.getInstitucionId() == null
                ? null : institucionService.getEntity(usuarioDTO.getInstitucionId()));
        }

        return mapearADTO(usuarioRepository.save(usuario));
    }

    @Transactional
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
            .institucionId(usuario.getInstitucion() != null ? usuario.getInstitucion().getId() : null)
            .institucionNombre(usuario.getInstitucion() != null ? usuario.getInstitucion().getNombre() : null)
            .estado(usuario.getEstado().toString())
            .build();
    }

    private LoginResponseDTO mapearSesion(Usuario usuario, String accessToken, String refreshToken, String tokenType) {
        Map<Integer, ModuloPermisoDTO> permisos = usuario.getRol() != null
            ? obtenerPermisos(usuario.getRol().getId())
            : Map.of();
        return LoginResponseDTO.builder()
            .id(usuario.getId())
            .nombre(usuario.getNombre())
            .email(usuario.getEmail())
            .rolId(usuario.getRol() != null ? usuario.getRol().getId() : null)
            .rolNombre(usuario.getRol() != null ? usuario.getRol().getNombre() : null)
            .institucionId(usuario.getInstitucion() != null ? usuario.getInstitucion().getId() : null)
            .institucionNombre(usuario.getInstitucion() != null ? usuario.getInstitucion().getNombre() : null)
            .estado(usuario.getEstado().toString())
            .modulos(usuario.getRol() != null
                ? usuario.getRol().getModulos().stream()
                    .filter(Objects::nonNull)
                    .sorted(Comparator.comparing(Modulo::getId, Comparator.nullsLast(Integer::compareTo)))
                    .map(modulo -> mapearModuloADTO(modulo, permisos.getOrDefault(modulo.getId(), permisoCompleto(modulo.getId()))))
                    .collect(Collectors.toList())
                : List.of())
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .expiresIn(jwtTokenProvider.getAccessTokenExpirationMs())
            .tokenType(tokenType)
            .build();
    }

    private ModuloDTO mapearModuloADTO(Modulo modulo) {
        return mapearModuloADTO(modulo, permisoCompleto(modulo.getId()));
    }

    private ModuloDTO mapearModuloADTO(Modulo modulo, ModuloPermisoDTO permiso) {
        return ModuloDTO.builder()
            .id(modulo.getId())
            .nombre(modulo.getNombre())
            .ruta(modulo.getRuta())
            .icono(modulo.getIcono())
            .moduloPadreId(modulo.getModuloPadre() != null ? modulo.getModuloPadre().getId() : null)
            .moduloPadreNombre(modulo.getModuloPadre() != null ? modulo.getModuloPadre().getNombre() : null)
            .acciones(permiso.getAcciones())
            .puedeVer(valor(permiso.getPuedeVer()))
            .puedeCrear(valor(permiso.getPuedeCrear()))
            .puedeEditar(valor(permiso.getPuedeEditar()))
            .puedeEliminar(valor(permiso.getPuedeEliminar()))
            .puedeExportar(valor(permiso.getPuedeExportar()))
            .build();
    }

    private Map<Integer, ModuloPermisoDTO> obtenerPermisos(Integer rolId) {
        try {
            return jdbcTemplate.query("""
                select rma.modulo_id,
                       bool_or(upper(a.codigo) = 'VER') as puede_ver,
                       bool_or(upper(a.codigo) = 'CREAR') as puede_crear,
                       bool_or(upper(a.codigo) = 'EDITAR') as puede_editar,
                       bool_or(upper(a.codigo) = 'ELIMINAR') as puede_eliminar,
                       bool_or(upper(a.codigo) = 'EXPORTAR') as puede_exportar,
                       string_agg(upper(a.codigo), ',' order by upper(a.codigo)) as acciones
                from rol_modulo_acciones rma
                join acciones a on a.id = rma.accion_id
                where rol_id = ?
                group by rma.modulo_id
                """, (rs, rowNum) -> ModuloPermisoDTO.builder()
                    .moduloId(rs.getInt("modulo_id"))
                    .acciones(listaAcciones(rs.getString("acciones")))
                    .puedeVer(rs.getBoolean("puede_ver"))
                    .puedeCrear(rs.getBoolean("puede_crear"))
                    .puedeEditar(rs.getBoolean("puede_editar"))
                    .puedeEliminar(rs.getBoolean("puede_eliminar"))
                    .puedeExportar(rs.getBoolean("puede_exportar"))
                    .build(), rolId)
                .stream()
                .collect(Collectors.toMap(ModuloPermisoDTO::getModuloId, Function.identity()));
        } catch (BadSqlGrammarException exception) {
            return Map.of();
        }
    }

    private ModuloPermisoDTO permisoCompleto(Integer moduloId) {
        return ModuloPermisoDTO.builder()
            .moduloId(moduloId)
            .acciones(List.of("VER", "CREAR", "EDITAR", "ELIMINAR", "EXPORTAR"))
            .puedeVer(true)
            .puedeCrear(true)
            .puedeEditar(true)
            .puedeEliminar(true)
            .puedeExportar(true)
            .build();
    }

    private boolean valor(Boolean value) {
        return value == null || value;
    }

    private List<String> listaAcciones(String acciones) {
        if (acciones == null || acciones.isBlank()) {
            return List.of();
        }
        return java.util.Arrays.stream(acciones.split(","))
            .map(String::trim)
            .filter(item -> !item.isBlank())
            .distinct()
            .toList();
    }
}
