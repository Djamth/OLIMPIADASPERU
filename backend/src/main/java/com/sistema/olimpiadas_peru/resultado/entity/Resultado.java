package com.sistema.olimpiadas_peru.resultado.entity;

import com.sistema.olimpiadas_peru.common.entity.BaseEntity;
import com.sistema.olimpiadas_peru.programacion.entity.Partido;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "resultados")
public class Resultado extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "partido_id", unique = true)
    private Partido partido;

    @Column(nullable = false)
    private Integer puntajeLocal;

    @Column(nullable = false)
    private Integer puntajeVisitante;

    private String observaciones;

    @Column(nullable = false)
    private String goleadores;
}
