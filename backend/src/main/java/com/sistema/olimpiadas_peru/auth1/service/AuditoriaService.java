package com.sistema.olimpiadas_peru.auth1.service;

import com.sistema.olimpiadas_peru.auth1.model.Usuario;
import com.sistema.olimpiadas_peru.auth1.repository.AuditoriaRepository;
import com.sistema.olimpiadas_peru.auth1.repository.UsuarioRepository;
import com.sistema.olimpiadas_peru.auth1.model.Auditoria;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditoriaService {

    private final AuditoriaRepository auditoriaRepository;
    private final UsuarioRepository usuarioRepository;

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
}
