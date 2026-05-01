package com.sistema.olimpiadas_peru.auth1.service;

import com.sistema.olimpiadas_peru.auth1.dto.AsignarModulosRolDTO;
import com.sistema.olimpiadas_peru.auth1.dto.ModuloDTO;
import com.sistema.olimpiadas_peru.auth1.dto.RolModulosDTO;
import com.sistema.olimpiadas_peru.auth1.model.Modulo;
import com.sistema.olimpiadas_peru.auth1.dto.RolDTO;
import com.sistema.olimpiadas_peru.auth1.model.Rol;
import com.sistema.olimpiadas_peru.auth1.repository.ModuloRepository;
import com.sistema.olimpiadas_peru.auth1.repository.RolRepository;
import com.sistema.olimpiadas_peru.auth1.repository.UsuarioRepository;
import com.sistema.olimpiadas_peru.auth1.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RolService {
    
    private final RolRepository rolRepository;
    private final ModuloRepository moduloRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuditoriaService auditoriaService;
    
    public RolDTO crearRol(RolDTO rolDTO) {
        Rol rol = Rol.builder()
            .nombre(rolDTO.getNombre())
            .estado(Rol.Estado.valueOf(rolDTO.getEstado() != null ? rolDTO.getEstado() : "ACTIVO"))
            .build();
        
        Rol rolGuardado = rolRepository.save(rol);
        return mapearADTO(rolGuardado);
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
    
    public RolDTO actualizarRol(Integer id, RolDTO rolDTO) {
        Rol rol = rolRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
        
        rol.setNombre(rolDTO.getNombre());
        rol.setEstado(Rol.Estado.valueOf(rolDTO.getEstado()));
        
        return mapearADTO(rolRepository.save(rol));
    }
    
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
            String.format("Se elimino el rol '%s'", rol.getNombre())
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

    public RolModulosDTO asignarModulos(Integer rolId, AsignarModulosRolDTO asignarModulosRolDTO) {
        Rol rol = rolRepository.findWithModulosById(rolId)
            .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        List<Integer> moduloIds = asignarModulosRolDTO.getModuloIds() != null
            ? asignarModulosRolDTO.getModuloIds()
            : List.of();

        List<Modulo> modulos = moduloIds.stream()
            .distinct()
            .map(id -> moduloRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Módulo no encontrado con id: " + id)))
            .collect(Collectors.toList());

        rol.setModulos(new LinkedHashSet<>(modulos));
        Rol rolGuardado = rolRepository.save(rol);

        auditoriaService.registrar(
            SecurityUtils.getCurrentUserId(),
            "ASIGNAR_MODULOS_ROL",
            String.format("Se actualizaron los modulos del rol '%s'", rol.getNombre())
        );

        return mapearARolModulosDTO(rolGuardado);
    }

    public RolModulosDTO agregarModuloAlRol(Integer rolId, Integer moduloId) {
        Rol rol = rolRepository.findWithModulosById(rolId)
            .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        Modulo modulo = moduloRepository.findById(moduloId)
            .orElseThrow(() -> new RuntimeException("Modulo no encontrado"));

        boolean yaAsignado = rol.getModulos().stream().anyMatch(item -> item.getId().equals(moduloId));
        if (yaAsignado) {
            throw new RuntimeException("El modulo ya esta asignado a este rol");
        }

        rol.getModulos().add(modulo);
        Rol rolGuardado = rolRepository.save(rol);

        auditoriaService.registrar(
            SecurityUtils.getCurrentUserId(),
            "AGREGAR_MODULO_ROL",
            String.format("Se agrego el modulo '%s' al rol '%s'", modulo.getNombre(), rol.getNombre())
        );

        return mapearARolModulosDTO(rolGuardado);
    }

    public RolModulosDTO removerModuloDelRol(Integer rolId, Integer moduloId) {
        Rol rol = rolRepository.findWithModulosById(rolId)
            .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        Modulo modulo = moduloRepository.findById(moduloId)
            .orElseThrow(() -> new RuntimeException("Modulo no encontrado"));

        boolean removido = rol.getModulos().removeIf(item -> item.getId().equals(moduloId));
        if (!removido) {
            throw new RuntimeException("El modulo no esta asignado a este rol");
        }

        Rol rolGuardado = rolRepository.save(rol);

        auditoriaService.registrar(
            SecurityUtils.getCurrentUserId(),
            "REMOVER_MODULO_ROL",
            String.format("Se removio el modulo '%s' del rol '%s'", modulo.getNombre(), rol.getNombre())
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
        return RolModulosDTO.builder()
            .rolId(rol.getId())
            .rolNombre(rol.getNombre())
            .modulos((rol.getModulos() == null ? List.<Modulo>of() : rol.getModulos()).stream()
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(Modulo::getId, Comparator.nullsLast(Integer::compareTo)))
                .map(this::mapearModuloADTO)
                .collect(Collectors.toList()))
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
