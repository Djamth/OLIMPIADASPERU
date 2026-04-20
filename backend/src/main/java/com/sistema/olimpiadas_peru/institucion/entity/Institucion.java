package com.sistema.olimpiadas_peru.institucion.entity;

import com.sistema.olimpiadas_peru.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

    @Column(nullable = false)
    private String region;

    @Column(nullable = false)
    private String ciudad;

    private String direccion;

    private String telefono;

    private String email;
}
