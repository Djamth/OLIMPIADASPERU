package com.sistema.olimpiadas_peru.auth1.repository;

import com.sistema.olimpiadas_peru.auth1.model.Auditoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditoriaRepository extends JpaRepository<Auditoria, Integer> {
    List<Auditoria> findByUsuarioId(Integer usuarioId);
}
