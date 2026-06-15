package com.sistema.olimpiadas_peru.categoria.repository;

import com.sistema.olimpiadas_peru.categoria.entity.CategoriaEvento;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaEventoRepository extends JpaRepository<CategoriaEvento, Long> {
    List<CategoriaEvento> findByEventoIdOrderByNombreAsc(Long eventoId);
    boolean existsByEventoIdAndPaisId(Long eventoId, Long paisId);
    boolean existsByEventoIdAndPaisIdAndIdNot(Long eventoId, Long paisId, Long id);
    boolean existsByPaisId(Long paisId);
}
