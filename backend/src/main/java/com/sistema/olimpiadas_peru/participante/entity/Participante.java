package com.sistema.olimpiadas_peru.participante.entity;

import com.sistema.olimpiadas_peru.common.entity.BaseEntity;
import com.sistema.olimpiadas_peru.common.enums.Genero;
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
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "participantes")
public class Participante extends BaseEntity {

    @Column(nullable = false)
    private String nombres;

    @Column(nullable = false)
    private String apellidos;

    @Column(nullable = false, unique = true, length = 20)
    private String numeroDocumento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Genero genero;

    @Column(nullable = false)
    private LocalDate fechaNacimiento;

    @Column(nullable = false, length = 20)
    private String codigoEstudiante;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private RolParticipante rolEquipo = RolParticipante.JUGADOR;

    private Integer numeroCamiseta;

    @Column(length = 500)
    private String fotografiaUrl;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipo_id")
    private Equipo equipo;
}
