package com.sistema.olimpiadas_peru.deporte.entity;

import com.sistema.olimpiadas_peru.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "deportes")
public class Deporte extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String nombre;

    private String descripcion;

    @Column(nullable = false)
    private Integer maximoEquiposPorGrupo;

    @Column(nullable = false)
    private Integer numeroJugadores;
}
