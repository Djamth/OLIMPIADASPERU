package com.sistema.olimpiadas_peru.auth1.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = "rol")
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Integer id;
    
    @Column(length = 100)
    private String nombre;
    
    @Column(unique = true, length = 100)
    private String email;
    
    @Column(length = 255)
    private String password;
    
    @ManyToOne
    @JoinColumn(name = "rol_id")
    private Rol rol;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Estado estado;

    @Column
    @Builder.Default
    private Boolean eliminado = false;
    
    public enum Estado {
        ACTIVO, INACTIVO
    }
}
