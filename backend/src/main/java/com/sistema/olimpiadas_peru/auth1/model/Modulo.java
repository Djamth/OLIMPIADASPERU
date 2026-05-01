package com.sistema.olimpiadas_peru.auth1.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "modulos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = "roles")
public class Modulo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Integer id;
    
    @Column(length = 100)
    private String nombre;
    
    @Column(length = 100)
    private String ruta;
    
    @Column(length = 50)
    private String icono;
    
    @ManyToMany(mappedBy = "modulos")
    @Builder.Default
    private Set<Rol> roles = new HashSet<>();
}
