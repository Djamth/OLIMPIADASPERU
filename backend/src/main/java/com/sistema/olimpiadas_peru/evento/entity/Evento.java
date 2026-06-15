package com.sistema.olimpiadas_peru.evento.entity;

import com.sistema.olimpiadas_peru.common.entity.BaseEntity;
import com.sistema.olimpiadas_peru.common.enums.EstadoEvento;
import com.sistema.olimpiadas_peru.institucion.entity.Institucion;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "eventos", uniqueConstraints = {
        @UniqueConstraint(name = "uk_evento_institucion_nombre_anio",
                columnNames = {"institucion_id", "nombre", "anio"})
})
public class Evento extends BaseEntity {

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(nullable = false)
    private Integer anio;

    @Column(nullable = false)
    private LocalDate fechaInicio;

    @Column(nullable = false)
    private LocalDate fechaFin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoEvento estado;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "institucion_id", nullable = false)
    private Institucion institucion;
}
