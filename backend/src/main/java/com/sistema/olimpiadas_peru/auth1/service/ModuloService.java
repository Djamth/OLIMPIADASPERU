package com.sistema.olimpiadas_peru.auth1.service;

import com.sistema.olimpiadas_peru.auth1.dto.ModuloDTO;
import com.sistema.olimpiadas_peru.auth1.model.Modulo;
import com.sistema.olimpiadas_peru.auth1.repository.ModuloRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ModuloService {

    private final ModuloRepository moduloRepository;

    public ModuloDTO crearModulo(ModuloDTO moduloDTO) {
        Modulo modulo = Modulo.builder()
            .nombre(moduloDTO.getNombre())
            .ruta(moduloDTO.getRuta())
            .icono(moduloDTO.getIcono())
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
            .orElseThrow(() -> new RuntimeException("Modulo no encontrado"));
        return mapearADTO(modulo);
    }

    public ModuloDTO actualizarModulo(Integer id, ModuloDTO moduloDTO) {
        Modulo modulo = moduloRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Modulo no encontrado"));

        modulo.setNombre(moduloDTO.getNombre());
        modulo.setRuta(moduloDTO.getRuta());
        modulo.setIcono(moduloDTO.getIcono());

        return mapearADTO(moduloRepository.save(modulo));
    }

    public void eliminarModulo(Integer id) {
        moduloRepository.deleteById(id);
    }

    public Modulo obtenerModuloPorId(Integer id) {
        return moduloRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Modulo no encontrado"));
    }

    private ModuloDTO mapearADTO(Modulo modulo) {
        return ModuloDTO.builder()
            .id(modulo.getId())
            .nombre(modulo.getNombre())
            .ruta(modulo.getRuta())
            .icono(modulo.getIcono())
            .build();
    }
}
