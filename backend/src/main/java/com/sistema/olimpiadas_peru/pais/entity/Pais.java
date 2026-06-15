package com.sistema.olimpiadas_peru.pais.entity;

import com.sistema.olimpiadas_peru.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "paises", uniqueConstraints = {
        @UniqueConstraint(name = "uk_pais_nombre", columnNames = "nombre"),
        @UniqueConstraint(name = "uk_pais_codigo", columnNames = "codigo")
})
public class Pais extends BaseEntity {

    @Column(nullable = false, length = 80)
    private String nombre;

    @Column(nullable = false, length = 3)
    private String codigo;

    @Column(nullable = false, length = 10)
    private String bandera;

    @Column(nullable = false, length = 20)
    private String colorPrimario;

    @Column(nullable = false, length = 20)
    private String colorSecundario;

    @Column(length = 300)
    private String datoCultural;

    @Column(nullable = false)
    private boolean activo = true;
}
