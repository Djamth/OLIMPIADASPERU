package com.sistema.olimpiadas_peru.auth1.service;

import com.sistema.olimpiadas_peru.auth1.dto.AccionDTO;
import com.sistema.olimpiadas_peru.auth1.model.Accion;
import com.sistema.olimpiadas_peru.auth1.repository.AccionRepository;
import com.sistema.olimpiadas_peru.auth1.repository.RolModuloAccionRepository;
import com.sistema.olimpiadas_peru.auth1.security.SecurityUtils;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccionService {

    private final AccionRepository accionRepository;
    private final RolModuloAccionRepository rolModuloAccionRepository;
    private final AuditoriaService auditoriaService;

    public List<AccionDTO> obtenerTodas() {
        return accionRepository.findAllByOrderByCodigoAsc()
            .stream()
            .map(this::mapearADTO)
            .toList();
    }

    public AccionDTO obtenerPorId(Integer id) {
        return mapearADTO(buscarAccion(id));
    }

    @Transactional
    public AccionDTO crearAccion(AccionDTO request) {
        String codigo = normalizarCodigo(request.getCodigo());
        validarNombre(request.getNombre());
        if (accionRepository.existsByCodigoIgnoreCase(codigo)) {
            throw new RuntimeException("Ya existe una acción con el código " + codigo);
        }

        Accion accion = accionRepository.save(Accion.builder()
            .codigo(codigo)
            .nombre(request.getNombre().trim())
            .build());

        auditoriaService.registrar(
            SecurityUtils.getCurrentUserId(),
            "CREAR_ACCION",
            String.format("Se creó la acción '%s' (%s)", accion.getNombre(), accion.getCodigo())
        );

        return mapearADTO(accion);
    }

    @Transactional
    public AccionDTO actualizarAccion(Integer id, AccionDTO request) {
        Accion accion = buscarAccion(id);
        String codigoAnterior = accion.getCodigo();
        String nombreAnterior = accion.getNombre();
        String codigo = normalizarCodigo(request.getCodigo());
        validarNombre(request.getNombre());

        accionRepository.findByCodigoIgnoreCase(codigo)
            .filter(existing -> !existing.getId().equals(id))
            .ifPresent(existing -> {
                throw new RuntimeException("Ya existe una acción con el código " + codigo);
            });

        long permisosAsignados = rolModuloAccionRepository.countByAccion_Id(id);
        if (permisosAsignados > 0 && !codigoAnterior.equals(codigo)) {
            throw new RuntimeException(
                String.format("No se puede cambiar el código de la acción '%s' porque está asignada a %d permiso(s)", codigoAnterior, permisosAsignados)
            );
        }

        accion.setCodigo(codigo);
        accion.setNombre(request.getNombre().trim());
        Accion guardada = accionRepository.save(accion);

        auditoriaService.registrar(
            SecurityUtils.getCurrentUserId(),
            "ACTUALIZAR_ACCION",
            String.format(
                "Se actualizó la acción '%s' (%s) a '%s' (%s)",
                nombreAnterior,
                codigoAnterior,
                guardada.getNombre(),
                guardada.getCodigo()
            )
        );

        return mapearADTO(guardada);
    }

    @Transactional
    public void eliminarAccion(Integer id) {
        Accion accion = buscarAccion(id);
        long permisosAsignados = rolModuloAccionRepository.countByAccion_Id(id);
        if (permisosAsignados > 0) {
            throw new RuntimeException(
                String.format("No se puede eliminar la acción '%s' porque está asignada a %d permiso(s)", accion.getCodigo(), permisosAsignados)
            );
        }

        accionRepository.delete(accion);
        auditoriaService.registrar(
            SecurityUtils.getCurrentUserId(),
            "ELIMINAR_ACCION",
            String.format("Se eliminó la acción '%s' (%s)", accion.getNombre(), accion.getCodigo())
        );
    }

    private Accion buscarAccion(Integer id) {
        return accionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Acción no encontrada"));
    }

    private AccionDTO mapearADTO(Accion accion) {
        return AccionDTO.builder()
            .id(accion.getId())
            .codigo(accion.getCodigo())
            .nombre(accion.getNombre())
            .permisosAsignados(rolModuloAccionRepository.countByAccion_Id(accion.getId()))
            .build();
    }

    private String normalizarCodigo(String codigo) {
        if (codigo == null || codigo.isBlank()) {
            throw new RuntimeException("El código de la acción es obligatorio");
        }
        return codigo.trim().toUpperCase().replaceAll("[^A-Z0-9_]", "_");
    }

    private void validarNombre(String nombre) {
        if (nombre == null || nombre.isBlank()) {
            throw new RuntimeException("El nombre de la acción es obligatorio");
        }
    }
}
