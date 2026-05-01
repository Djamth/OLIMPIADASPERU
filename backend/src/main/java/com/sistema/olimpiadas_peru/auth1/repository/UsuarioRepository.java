package com.sistema.olimpiadas_peru.auth1.repository;

import com.sistema.olimpiadas_peru.auth1.model.Usuario;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    Optional<Usuario> findByEmail(String email);

    @EntityGraph(attributePaths = {"rol", "rol.modulos"})
    Optional<Usuario> findWithRolAndModulosByEmail(String email);

    @EntityGraph(attributePaths = {"rol", "rol.modulos"})
    Optional<Usuario> findWithRolAndModulosById(Integer id);

    Optional<Usuario> findByNombre(String nombre);

    @Query("select u from Usuario u where coalesce(u.eliminado, false) = false")
    java.util.List<Usuario> findAllVisible();

    long countByRol_NombreIgnoreCaseAndEstado(String nombreRol, Usuario.Estado estado);

    long countByRol_Id(Integer rolId);

    @Query("select count(u) from Usuario u where u.rol.id = :rolId and coalesce(u.eliminado, false) = false")
    long countVisibleByRolId(@Param("rolId") Integer rolId);
}
