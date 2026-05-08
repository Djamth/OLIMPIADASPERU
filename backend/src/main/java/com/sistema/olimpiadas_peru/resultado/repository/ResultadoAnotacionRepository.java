package com.sistema.olimpiadas_peru.resultado.repository;

import com.sistema.olimpiadas_peru.resultado.entity.ResultadoAnotacion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResultadoAnotacionRepository extends JpaRepository<ResultadoAnotacion, Long> {

    List<ResultadoAnotacion> findByResultadoId(Long resultadoId);

    void deleteByResultadoId(Long resultadoId);
}
