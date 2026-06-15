package com.sistema.olimpiadas_peru.evento.repository;

import com.sistema.olimpiadas_peru.evento.entity.Evento;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventoRepository extends JpaRepository<Evento, Long> {
    List<Evento> findByInstitucionIdOrderByAnioDesc(Long institucionId);
}
