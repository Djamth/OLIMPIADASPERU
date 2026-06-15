package com.sistema.olimpiadas_peru.equipo.repository;

import com.sistema.olimpiadas_peru.equipo.entity.Equipo;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EquipoRepository extends JpaRepository<Equipo, Long> {

    List<Equipo> findByInstitucionId(Long institucionId);

    List<Equipo> findByCategoriaEventoIdOrderByDeporteNombreAsc(Long categoriaEventoId);

    boolean existsByCategoriaEventoIdAndDeporteId(Long categoriaEventoId, Long deporteId);

    boolean existsByCategoriaEventoIdAndDeporteIdAndIdNot(Long categoriaEventoId, Long deporteId, Long id);
}
