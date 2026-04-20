package com.sistema.olimpiadas_peru.deporte.repository;

import com.sistema.olimpiadas_peru.deporte.entity.Deporte;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeporteRepository extends JpaRepository<Deporte, Long> {
}
