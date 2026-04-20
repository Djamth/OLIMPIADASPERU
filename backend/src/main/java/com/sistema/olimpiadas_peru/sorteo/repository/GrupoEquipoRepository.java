package com.sistema.olimpiadas_peru.sorteo.repository;

import com.sistema.olimpiadas_peru.sorteo.entity.GrupoEquipo;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GrupoEquipoRepository extends JpaRepository<GrupoEquipo, Long> {

    List<GrupoEquipo> findByGrupoId(Long grupoId);

    void deleteByGrupoDeporteId(Long deporteId);
}
