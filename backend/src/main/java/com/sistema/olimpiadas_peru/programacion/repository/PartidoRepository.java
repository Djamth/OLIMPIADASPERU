package com.sistema.olimpiadas_peru.programacion.repository;

import com.sistema.olimpiadas_peru.programacion.entity.Partido;
import com.sistema.olimpiadas_peru.common.enums.EstadoPartido;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PartidoRepository extends JpaRepository<Partido, Long> {

    List<Partido> findByDeporteIdOrderByFechaHoraAsc(Long deporteId);

    long countByEstado(EstadoPartido estado);

    List<Partido> findTop5ByEstadoNotOrderByFechaHoraAsc(EstadoPartido estado);
}
