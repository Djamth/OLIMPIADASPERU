package com.sistema.olimpiadas_peru.inscripcion.repository;

import com.sistema.olimpiadas_peru.inscripcion.entity.Inscripcion;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InscripcionRepository extends JpaRepository<Inscripcion, Long> {

    List<Inscripcion> findByDeporteId(Long deporteId);

    Optional<Inscripcion> findByEquipoIdAndDeporteId(Long equipoId, Long deporteId);
}
