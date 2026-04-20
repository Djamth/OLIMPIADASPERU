package com.sistema.olimpiadas_peru.equipo.entity;

import com.sistema.olimpiadas_peru.common.entity.BaseEntity;
import com.sistema.olimpiadas_peru.common.enums.CategoriaEquipo;
import com.sistema.olimpiadas_peru.common.enums.Genero;
import com.sistema.olimpiadas_peru.institucion.entity.Institucion;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "equipos")
public class Equipo extends BaseEntity {

    @Column(nullable = false)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategoriaEquipo categoria;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Genero genero;

    @Column(nullable = false)
    private String entrenador;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "institucion_id")
    private Institucion institucion;
}
