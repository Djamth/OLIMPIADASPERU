package com.sistema.olimpiadas_peru.institucion.entity;

import com.sistema.olimpiadas_peru.common.entity.BaseEntity;
import com.sistema.olimpiadas_peru.common.enums.TipoInstitucion;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "instituciones")
public class Institucion extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String nombre;

    @Column(nullable = false, unique = true)
    private String codigoModular;

    @Column(unique = true, length = 20)
    private String ruc;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private TipoInstitucion tipo;

    @Column(length = 100)
    private String nivelEducativo;

    @Column(nullable = false)
    private String region;

    @Column(nullable = false)
    private String ciudad;

    private String direccion;

    private String telefono;

    private String email;

    @Column(length = 120)
    private String administradorNombre;

    @Column(length = 120)
    private String administradorEmail;
}
