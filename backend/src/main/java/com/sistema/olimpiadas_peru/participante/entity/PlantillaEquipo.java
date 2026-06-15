package com.sistema.olimpiadas_peru.participante.entity;

import com.sistema.olimpiadas_peru.common.entity.BaseEntity;
import com.sistema.olimpiadas_peru.common.enums.RolParticipante;
import com.sistema.olimpiadas_peru.equipo.entity.Equipo;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "plantillas_equipo", uniqueConstraints = {
        @UniqueConstraint(name = "uk_plantilla_participante_equipo",
                columnNames = {"participante_id", "equipo_id"}),
        @UniqueConstraint(name = "uk_plantilla_equipo_dorsal",
                columnNames = {"equipo_id", "numero_camiseta"})
})
public class PlantillaEquipo extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "participante_id", nullable = false)
    private Participante participante;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipo_id", nullable = false)
    private Equipo equipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RolParticipante rol;

    private Integer numeroCamiseta;
}
