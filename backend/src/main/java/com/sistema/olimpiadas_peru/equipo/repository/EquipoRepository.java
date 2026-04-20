package com.sistema.olimpiadas_peru.equipo.repository;

import com.sistema.olimpiadas_peru.equipo.entity.Equipo;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EquipoRepository extends JpaRepository<Equipo, Long> {

    List<Equipo> findByInstitucionId(Long institucionId);
}
