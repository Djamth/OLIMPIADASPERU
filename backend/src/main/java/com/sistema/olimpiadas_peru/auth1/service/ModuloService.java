package com.sistema.olimpiadas_peru.auth1.service;

import com.sistema.olimpiadas_peru.auth1.dto.ModuloDTO;
import com.sistema.olimpiadas_peru.auth1.model.Modulo;
import com.sistema.olimpiadas_peru.auth1.repository.ModuloRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ModuloService {

    private final ModuloRepository moduloRepository;

    @Transactional
    public ModuloDTO crearModulo(ModuloDTO moduloDTO) {
        Modulo modulo = Modulo.builder()
            .nombre(moduloDTO.getNombre())
            .ruta(moduloDTO.getRuta())
            .icono(moduloDTO.getIcono())
            .moduloPadre(obtenerModuloPadre(moduloDTO.getModuloPadreId()))
            .build();

        return mapearADTO(moduloRepository.save(modulo));
    }

    public List<ModuloDTO> obtenerTodos() {
        return moduloRepository.findAll()
            .stream()
            .map(this::mapearADTO)
            .collect(Collectors.toList());
    }

    public ModuloDTO obtenerPorId(Integer id) {
        Modulo modulo = moduloRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Módulo no encontrado"));
        return mapearADTO(modulo);
    }

    @Transactional
    public ModuloDTO actualizarModulo(Integer id, ModuloDTO moduloDTO) {
        Modulo modulo = moduloRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Módulo no encontrado"));

        modulo.setNombre(moduloDTO.getNombre());
        modulo.setRuta(moduloDTO.getRuta());
        modulo.setIcono(moduloDTO.getIcono());
        modulo.setModuloPadre(obtenerModuloPadre(moduloDTO.getModuloPadreId()));

        return mapearADTO(moduloRepository.save(modulo));
    }

    @Transactional
    public void eliminarModulo(Integer id) {
        moduloRepository.deleteById(id);
    }

    public Modulo obtenerModuloPorId(Integer id) {
        return moduloRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Módulo no encontrado"));
    }

    private ModuloDTO mapearADTO(Modulo modulo) {
        return ModuloDTO.builder()
            .id(modulo.getId())
            .nombre(modulo.getNombre())
            .ruta(modulo.getRuta())
            .icono(modulo.getIcono())
            .moduloPadreId(modulo.getModuloPadre() != null ? modulo.getModuloPadre().getId() : null)
            .moduloPadreNombre(modulo.getModuloPadre() != null ? modulo.getModuloPadre().getNombre() : null)
            .acciones(List.of())
            .build();
    }

    private Modulo obtenerModuloPadre(Integer moduloPadreId) {
        if (moduloPadreId == null) {
            return null;
        }
        return moduloRepository.findById(moduloPadreId)
            .orElseThrow(() -> new RuntimeException("Módulo padre no encontrado"));
    }
}
