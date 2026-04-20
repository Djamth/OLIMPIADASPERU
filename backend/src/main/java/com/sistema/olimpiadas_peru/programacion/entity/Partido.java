package com.sistema.olimpiadas_peru.programacion.entity;

import com.sistema.olimpiadas_peru.common.entity.BaseEntity;
import com.sistema.olimpiadas_peru.common.enums.EstadoPartido;
import com.sistema.olimpiadas_peru.deporte.entity.Deporte;
import com.sistema.olimpiadas_peru.equipo.entity.Equipo;
import com.sistema.olimpiadas_peru.sorteo.entity.Grupo;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "partidos")
public class Partido extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grupo_id")
    private Grupo grupo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "deporte_id")
    private Deporte deporte;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipo_local_id")
    private Equipo equipoLocal;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipo_visitante_id")
    private Equipo equipoVisitante;

    @Column(nullable = false)
    private LocalDateTime fechaHora;

    @Column(nullable = false)
    private String sede;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoPartido estado;
}
