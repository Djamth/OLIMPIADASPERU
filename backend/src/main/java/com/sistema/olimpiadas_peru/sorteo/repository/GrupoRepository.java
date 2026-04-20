package com.sistema.olimpiadas_peru.sorteo.repository;

import com.sistema.olimpiadas_peru.sorteo.entity.Grupo;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GrupoRepository extends JpaRepository<Grupo, Long> {

    List<Grupo> findByDeporteIdOrderByNombreAsc(Long deporteId);

    void deleteByDeporteId(Long deporteId);
}
