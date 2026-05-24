package com.sistema.olimpiadas_peru.auth1.service;

import com.sistema.olimpiadas_peru.auth1.dto.AuditoriaDTO;
import com.sistema.olimpiadas_peru.auth1.model.Usuario;
import com.sistema.olimpiadas_peru.auth1.repository.AuditoriaRepository;
import com.sistema.olimpiadas_peru.auth1.repository.UsuarioRepository;
import com.sistema.olimpiadas_peru.auth1.model.Auditoria;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditoriaService {

    private final AuditoriaRepository auditoriaRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<AuditoriaDTO> listarRecientes() {
        return auditoriaRepository.findTop20ByOrderByFechaDesc()
            .stream()
            .map(this::mapearADTO)
            .toList();
    }

    public void registrar(Integer usuarioId, String accion, String descripcion) {
        Usuario usuario = null;
        if (usuarioId != null) {
            usuario = usuarioRepository.findById(usuarioId).orElse(null);
        }

        auditoriaRepository.save(Auditoria.builder()
            .usuario(usuario)
            .accion(accion)
            .descripcion(descripcion)
            .build());
    }

    private AuditoriaDTO mapearADTO(Auditoria auditoria) {
        Usuario usuario = auditoria.getUsuario();
        return new AuditoriaDTO(
            auditoria.getId(),
            usuario != null ? usuario.getId() : null,
            usuario != null ? usuario.getNombre() : "Sistema",
            usuario != null ? usuario.getEmail() : null,
            auditoria.getAccion(),
            auditoria.getDescripcion(),
            auditoria.getFecha()
        );
    }
}
