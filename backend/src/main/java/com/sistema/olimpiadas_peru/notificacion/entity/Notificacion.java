package com.sistema.olimpiadas_peru.notificacion.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "notificaciones", indexes = {
    @Index(name = "idx_notificacion_destinatario", columnList = "destinatario_email"),
    @Index(name = "idx_notificacion_leido", columnList = "leido")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notificacion {

    public enum Tipo {
        INSCRIPCION,
        PROGRAMACION,
        RESULTADO,
        SISTEMA
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "destinatario_email", nullable = false, length = 120)
    private String destinatarioEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Tipo tipo;

    @Column(nullable = false, length = 140)
    private String titulo;

    @Column(nullable = false, length = 500)
    private String mensaje;

    @Column(length = 120)
    private String referencia;

    @Column(nullable = false)
    private boolean leido;

    @Column(nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    @Column
    private LocalDateTime leidoEn;

    @PrePersist
    protected void onCreate() {
        creadoEn = LocalDateTime.now();
    }
}
