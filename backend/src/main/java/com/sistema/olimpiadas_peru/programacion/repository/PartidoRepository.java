package com.sistema.olimpiadas_peru.programacion.repository;

import com.sistema.olimpiadas_peru.programacion.entity.Partido;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PartidoRepository extends JpaRepository<Partido, Long> {

    List<Partido> findByDeporteIdOrderByFechaHoraAsc(Long deporteId);
}
