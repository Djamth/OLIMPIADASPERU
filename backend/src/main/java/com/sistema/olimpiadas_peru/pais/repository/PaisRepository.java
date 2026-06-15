package com.sistema.olimpiadas_peru.pais.repository;

import com.sistema.olimpiadas_peru.pais.entity.Pais;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaisRepository extends JpaRepository<Pais, Long> {
    List<Pais> findByActivoTrueOrderByNombreAsc();
    Optional<Pais> findByNombreIgnoreCase(String nombre);
    Optional<Pais> findByCodigoIgnoreCase(String codigo);
}
