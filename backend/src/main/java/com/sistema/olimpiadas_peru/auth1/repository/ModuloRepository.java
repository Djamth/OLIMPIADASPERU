package com.sistema.olimpiadas_peru.auth1.repository;

import com.sistema.olimpiadas_peru.auth1.model.Modulo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ModuloRepository extends JpaRepository<Modulo, Integer> {
}
