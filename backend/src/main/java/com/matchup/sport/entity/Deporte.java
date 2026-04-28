package com.matchup.sport.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "deporte")
public class Deporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String nombre;

    @Column(name = "jugadores_default")
    private Integer jugadoresDefault;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    // ── Relaciones ──

    @ToString.Exclude
    @OneToMany(mappedBy = "deporte", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<com.matchup.user.entity.UsuarioDeporte> usuarios = new ArrayList<>();

    @ToString.Exclude
    @OneToMany(mappedBy = "deporte")
    @Builder.Default
    private List<com.matchup.meetup.entity.Quedada> quedadas = new ArrayList<>();
}
