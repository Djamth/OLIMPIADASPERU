package com.sistema.olimpiadas_peru.sorteo.entity;

import com.sistema.olimpiadas_peru.common.entity.BaseEntity;
import com.sistema.olimpiadas_peru.deporte.entity.Deporte;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "grupos")
public class Grupo extends BaseEntity {

    @Column(nullable = false)
    private String nombre;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "deporte_id")
    private Deporte deporte;
}
