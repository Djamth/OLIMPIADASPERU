package com.sistema.olimpiadas_peru.inscripcion.repository;

import com.sistema.olimpiadas_peru.inscripcion.entity.Inscripcion;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.sistema.olimpiadas_peru.common.enums.EstadoInscripcion;

public interface InscripcionRepository extends JpaRepository<Inscripcion, Long> {

    List<Inscripcion> findByDeporteId(Long deporteId);

    List<Inscripcion> findByDeporteIdAndEstado(Long deporteId, EstadoInscripcion estado);

    Optional<Inscripcion> findByEquipoIdAndDeporteId(Long equipoId, Long deporteId);

    Optional<Inscripcion> findByEquipoIdAndDeporteIdAndEstado(Long equipoId, Long deporteId, EstadoInscripcion estado);
}
