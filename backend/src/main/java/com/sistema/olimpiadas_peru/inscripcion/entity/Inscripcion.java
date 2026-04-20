package com.sistema.olimpiadas_peru.inscripcion.entity;

import com.sistema.olimpiadas_peru.common.entity.BaseEntity;
import com.sistema.olimpiadas_peru.common.enums.EstadoInscripcion;
import com.sistema.olimpiadas_peru.deporte.entity.Deporte;
import com.sistema.olimpiadas_peru.equipo.entity.Equipo;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "inscripciones")
public class Inscripcion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipo_id")
    private Equipo equipo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "deporte_id")
    private Deporte deporte;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoInscripcion estado;

    @Column(nullable = false)
    private LocalDate fechaInscripcion;
}
