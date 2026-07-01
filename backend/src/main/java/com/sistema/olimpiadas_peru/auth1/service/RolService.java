package com.sistema.olimpiadas_peru.auth1.service;

import com.sistema.olimpiadas_peru.auth1.dto.AsignarModulosRolDTO;
import com.sistema.olimpiadas_peru.auth1.dto.ModuloDTO;
import com.sistema.olimpiadas_peru.auth1.dto.ModuloPermisoDTO;
import com.sistema.olimpiadas_peru.auth1.dto.RolDTO;
import com.sistema.olimpiadas_peru.auth1.dto.RolModulosDTO;
import com.sistema.olimpiadas_peru.auth1.model.Modulo;
import com.sistema.olimpiadas_peru.auth1.model.Rol;
import com.sistema.olimpiadas_peru.auth1.repository.ModuloRepository;
import com.sistema.olimpiadas_peru.auth1.repository.RolRepository;
import com.sistema.olimpiadas_peru.auth1.repository.UsuarioRepository;
import com.sistema.olimpiadas_peru.auth1.security.SecurityUtils;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RolService {

    private final RolRepository rolRepository;
    private final ModuloRepository moduloRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuditoriaService auditoriaService;
    private final JdbcTemplate jdbcTemplate;

    @Transactional
    public RolDTO crearRol(RolDTO rolDTO) {
        Rol rol = Rol.builder()
            .nombre(rolDTO.getNombre())
            .estado(Rol.Estado.valueOf(rolDTO.getEstado() != null ? rolDTO.getEstado() : "ACTIVO"))
            .build();

        return mapearADTO(rolRepository.save(rol));
    }

    public List<RolDTO> obtenerTodos() {
        return rolRepository.findAll()
            .stream()
            .map(this::mapearADTO)
            .collect(Collectors.toList());
    }

    public RolDTO obtenerPorId(Integer id) {
        Rol rol = rolRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
        return mapearADTO(rol);
    }

    @Transactional
    public RolDTO actualizarRol(Integer id, RolDTO rolDTO) {
        Rol rol = rolRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        rol.setNombre(rolDTO.getNombre());
        rol.setEstado(Rol.Estado.valueOf(rolDTO.getEstado()));

        return mapearADTO(rolRepository.save(rol));
    }

    @Transactional
    public void eliminarRol(Integer id) {
        Rol rol = rolRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        long usuariosAsociados = usuarioRepository.countVisibleByRolId(id);
        if (usuariosAsociados > 0) {
            throw new RuntimeException(
                String.format("No se puede eliminar el rol '%s' porque tiene %d usuario(s) asignado(s)", rol.getNombre(), usuariosAsociados)
            );
        }

        rolRepository.delete(rol);

        auditoriaService.registrar(
            SecurityUtils.getCurrentUserId(),
            "ELIMINAR_ROL",
            String.format("Se eliminó el rol '%s'", rol.getNombre())
        );
    }

    public Rol obtenerRolPorId(Integer id) {
        return rolRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
    }

    public RolModulosDTO obtenerRolModulos(Integer rolId) {
        Rol rol = rolRepository.findWithModulosById(rolId)
            .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        return mapearARolModulosDTO(rol);
    }

    @Transactional
    public RolModulosDTO asignarModulos(Integer rolId, AsignarModulosRolDTO asignarModulosRolDTO) {
        Rol rol = rolRepository.findWithModulosById(rolId)
            .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        List<ModuloPermisoDTO> permisos = normalizarPermisos(asignarModulosRolDTO);
        List<Integer> moduloIds = permisos.stream()
            .map(ModuloPermisoDTO::getModuloId)
            .distinct()
            .toList();

        List<Modulo> modulos = moduloIds.stream()
            .map(id -> moduloRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Módulo no encontrado con id: " + id)))
            .collect(Collectors.toList());

        rol.setModulos(new LinkedHashSet<>(modulos));
        Rol rolGuardado = rolRepository.save(rol);
        rolRepository.flush();
        guardarPermisos(rolId, permisos);

        auditoriaService.registrar(
            SecurityUtils.getCurrentUserId(),
            "ASIGNAR_MODULOS_ROL",
            String.format("Se actualizaron los módulos y permisos del rol '%s'", rol.getNombre())
        );

        return mapearARolModulosDTO(rolGuardado);
    }

    @Transactional
    public RolModulosDTO agregarModuloAlRol(Integer rolId, Integer moduloId) {
        Rol rol = rolRepository.findWithModulosById(rolId)
            .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        Modulo modulo = moduloRepository.findById(moduloId)
            .orElseThrow(() -> new RuntimeException("Módulo no encontrado"));

        boolean yaAsignado = rol.getModulos().stream().anyMatch(item -> item.getId().equals(moduloId));
        if (yaAsignado) {
            throw new RuntimeException("El módulo ya está asignado a este rol");
        }

        rol.getModulos().add(modulo);
        Rol rolGuardado = rolRepository.save(rol);
        rolRepository.flush();
        guardarPermisos(rolId, List.of(permisoCompleto(moduloId)));

        auditoriaService.registrar(
            SecurityUtils.getCurrentUserId(),
            "AGREGAR_MODULO_ROL",
            String.format("Se agregó el módulo '%s' al rol '%s'", modulo.getNombre(), rol.getNombre())
        );

        return mapearARolModulosDTO(rolGuardado);
    }

    @Transactional
    public RolModulosDTO removerModuloDelRol(Integer rolId, Integer moduloId) {
        Rol rol = rolRepository.findWithModulosById(rolId)
            .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        Modulo modulo = moduloRepository.findById(moduloId)
            .orElseThrow(() -> new RuntimeException("Módulo no encontrado"));

        boolean removido = rol.getModulos().removeIf(item -> item.getId().equals(moduloId));
        if (!removido) {
            throw new RuntimeException("El módulo no está asignado a este rol");
        }

        Rol rolGuardado = rolRepository.save(rol);

        auditoriaService.registrar(
            SecurityUtils.getCurrentUserId(),
            "REMOVER_MODULO_ROL",
            String.format("Se removió el módulo '%s' del rol '%s'", modulo.getNombre(), rol.getNombre())
        );

        return mapearARolModulosDTO(rolGuardado);
    }

    private RolDTO mapearADTO(Rol rol) {
        return RolDTO.builder()
            .id(rol.getId())
            .nombre(rol.getNombre())
            .estado(rol.getEstado().toString())
            .build();
    }

    private RolModulosDTO mapearARolModulosDTO(Rol rol) {
        Map<Integer, ModuloPermisoDTO> permisos = obtenerPermisos(rol.getId());
        return RolModulosDTO.builder()
            .rolId(rol.getId())
            .rolNombre(rol.getNombre())
            .modulos((rol.getModulos() == null ? List.<Modulo>of() : rol.getModulos()).stream()
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(Modulo::getId, Comparator.nullsLast(Integer::compareTo)))
                .map(modulo -> mapearModuloADTO(modulo, permisos.getOrDefault(modulo.getId(), permisoCompleto(modulo.getId()))))
                .collect(Collectors.toList()))
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
            .puedeVer(valor(permiso.getPuedeVer()))
            .puedeCrear(valor(permiso.getPuedeCrear()))
            .puedeEditar(valor(permiso.getPuedeEditar()))
            .puedeEliminar(valor(permiso.getPuedeEliminar()))
            .puedeExportar(valor(permiso.getPuedeExportar()))
            .build();
    }

    private List<ModuloPermisoDTO> normalizarPermisos(AsignarModulosRolDTO request) {
        if (request.getPermisos() != null && !request.getPermisos().isEmpty()) {
            return request.getPermisos().stream()
                .filter(item -> item.getModuloId() != null)
                .map(item -> ModuloPermisoDTO.builder()
                    .moduloId(item.getModuloId())
                    .puedeVer(valor(item.getPuedeVer()))
                    .puedeCrear(valor(item.getPuedeCrear()))
                    .puedeEditar(valor(item.getPuedeEditar()))
                    .puedeEliminar(valor(item.getPuedeEliminar()))
                    .puedeExportar(valor(item.getPuedeExportar()))
                    .build())
                .toList();
        }

        return (request.getModuloIds() == null ? List.<Integer>of() : request.getModuloIds()).stream()
            .distinct()
            .map(this::permisoCompleto)
            .toList();
    }

    private void guardarPermisos(Integer rolId, List<ModuloPermisoDTO> permisos) {
        try {
            permisos.forEach(permiso -> jdbcTemplate.update("""
                update rol_modulos
                set puede_ver = ?,
                    puede_crear = ?,
                    puede_editar = ?,
                    puede_eliminar = ?,
                    puede_exportar = ?
                where rol_id = ? and modulo_id = ?
                """,
                valor(permiso.getPuedeVer()),
                valor(permiso.getPuedeCrear()),
                valor(permiso.getPuedeEditar()),
                valor(permiso.getPuedeEliminar()),
                valor(permiso.getPuedeExportar()),
                rolId,
                permiso.getModuloId()
            ));
        } catch (BadSqlGrammarException ignored) {
            // Compatibilidad con esquemas de prueba o instalaciones antes de ejecutar Flyway V3.
        }
    }

    private Map<Integer, ModuloPermisoDTO> obtenerPermisos(Integer rolId) {
        try {
            return jdbcTemplate.query("""
                select modulo_id, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar
                from rol_modulos
                where rol_id = ?
                """, (rs, rowNum) -> ModuloPermisoDTO.builder()
                    .moduloId(rs.getInt("modulo_id"))
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
}
