package com.sistema.olimpiadas_peru.participante.repository;

import com.sistema.olimpiadas_peru.participante.entity.Participante;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParticipanteRepository extends JpaRepository<Participante, Long> {

    List<Participante> findByEquipoIdOrderByApellidosAscNombresAsc(Long equipoId);

    Optional<Participante> findByNumeroDocumento(String numeroDocumento);

    long countByEquipoId(Long equipoId);
}
