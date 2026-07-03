package com.sistema.olimpiadas_peru.auth1.repository;

import com.sistema.olimpiadas_peru.auth1.model.RolModuloAccion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RolModuloAccionRepository extends JpaRepository<RolModuloAccion, Long> {
    void deleteByRol_Id(Integer rolId);

    void deleteByRol_IdAndModulo_Id(Integer rolId, Integer moduloId);

    List<RolModuloAccion> findByRol_Id(Integer rolId);
}
