package com.sistema.olimpiadas_peru.programacion.repository;

import com.sistema.olimpiadas_peru.programacion.entity.Partido;
import com.sistema.olimpiadas_peru.common.enums.EstadoPartido;
import java.util.List;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PartidoRepository extends JpaRepository<Partido, Long> {

    List<Partido> findByDeporteIdOrderByFechaHoraAsc(Long deporteId);

    long countByEstado(EstadoPartido estado);

    List<Partido> findTop5ByEstadoNotOrderByFechaHoraAsc(EstadoPartido estado);

    boolean existsByFechaHoraAndSedeIgnoreCase(LocalDateTime fechaHora, String sede);

    boolean existsByFechaHoraAndSedeIgnoreCaseAndIdNot(LocalDateTime fechaHora, String sede, Long id);

    @Query("""
            select count(p) > 0 from Partido p
            where p.fechaHora = :fechaHora
              and (:partidoId is null or p.id <> :partidoId)
              and (p.equipoLocal.id in :equipoIds or p.equipoVisitante.id in :equipoIds)
            """)
    boolean existeEquipoEnHorario(@Param("fechaHora") LocalDateTime fechaHora,
                                  @Param("equipoIds") List<Long> equipoIds,
                                  @Param("partidoId") Long partidoId);
}
