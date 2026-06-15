package com.sistema.olimpiadas_peru.participante.repository;

import com.sistema.olimpiadas_peru.participante.entity.PlantillaEquipo;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlantillaEquipoRepository extends JpaRepository<PlantillaEquipo, Long> {
    List<PlantillaEquipo> findByParticipanteId(Long participanteId);
    List<PlantillaEquipo> findByEquipoIdOrderByParticipanteApellidosAscParticipanteNombresAsc(Long equipoId);
    boolean existsByParticipanteIdAndEquipoId(Long participanteId, Long equipoId);
    boolean existsByParticipanteIdAndEquipoCategoriaEventoIdAndEquipoDeporteId(
            Long participanteId, Long categoriaEventoId, Long deporteId);
    long countByEquipoId(Long equipoId);
    void deleteByParticipanteId(Long participanteId);
}
