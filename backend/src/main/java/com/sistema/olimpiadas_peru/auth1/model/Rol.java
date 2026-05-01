package com.sistema.olimpiadas_peru.auth1.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"usuarios", "modulos"})
public class Rol {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Integer id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String nombre;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Estado estado;
    
    @OneToMany(mappedBy = "rol")
    @Builder.Default
    private Set<Usuario> usuarios = new HashSet<>();
    
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "rol_modulos",
        joinColumns = @JoinColumn(name = "rol_id"),
        inverseJoinColumns = @JoinColumn(name = "modulo_id")
    )
    @Builder.Default
    private Set<Modulo> modulos = new HashSet<>();
    
    public enum Estado {
        ACTIVO, INACTIVO
    }
}
