package com.sistema.olimpiadas_peru.categoria.entity;

import com.sistema.olimpiadas_peru.common.entity.BaseEntity;
import com.sistema.olimpiadas_peru.evento.entity.Evento;
import com.sistema.olimpiadas_peru.pais.entity.Pais;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "categorias_evento", uniqueConstraints = {
        @UniqueConstraint(name = "uk_categoria_evento_nombre", columnNames = {"evento_id", "nombre"}),
        @UniqueConstraint(name = "uk_categoria_evento_pais", columnNames = {"evento_id", "pais_id"})
})
public class CategoriaEvento extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 80)
    private String nivel;

    @Column(length = 300)
    private String descripcion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "evento_id", nullable = false)
    private Evento evento;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pais_id", nullable = false)
    private Pais pais;
}
