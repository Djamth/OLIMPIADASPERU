package com.sistema.olimpiadas_peru.resultado.repository;

import com.sistema.olimpiadas_peru.resultado.entity.Resultado;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResultadoRepository extends JpaRepository<Resultado, Long> {

    Optional<Resultado> findByPartidoId(Long partidoId);

    List<Resultado> findByPartidoDeporteId(Long deporteId);
}
