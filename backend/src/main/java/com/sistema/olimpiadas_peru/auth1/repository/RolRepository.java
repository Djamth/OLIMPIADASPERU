package com.sistema.olimpiadas_peru.auth1.repository;

import com.sistema.olimpiadas_peru.auth1.model.Rol;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RolRepository extends JpaRepository<Rol, Integer> {
    Optional<Rol> findByNombre(String nombre);

    @EntityGraph(attributePaths = {"modulos"})
    Optional<Rol> findWithModulosById(Integer id);
}
