package com.matchup.meetup.entity;

import com.matchup.sport.entity.Deporte;
import com.matchup.user.entity.Usuario;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "quedada")
public class Quedada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_organizador", nullable = false)
    @ToString.Exclude
    private Usuario organizador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_deporte", nullable = false)
    @ToString.Exclude
    private Deporte deporte;

    @Column(name = "fecha_hora_inicio", nullable = false)
    private LocalDateTime fechaHoraInicio;

    @Column(name = "fecha_hora_fin", nullable = false)
    private LocalDateTime fechaHoraFin;

    @Column(name = "ubicacion_nombre", nullable = false, length = 255)
    private String ubicacionNombre;

    @Column(name = "ubicacion_latitud", nullable = false)
    private Double ubicacionLatitud;

    @Column(name = "ubicacion_longitud", nullable = false)
    private Double ubicacionLongitud;

    @Column(name = "num_jugadores_total", nullable = false)
    private Integer numJugadoresTotal;

    @Builder.Default
    @Column(name = "es_publica", nullable = false)
    private Boolean esPublica = true;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Builder.Default
    @Column(nullable = false, columnDefinition = "estado_quedada")
    private EstadoQuedada estado = EstadoQuedada.ABIERTA;

    // ── Relaciones ──

    @ToString.Exclude
    @OneToMany(mappedBy = "quedada", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<com.matchup.participation.entity.UsuarioQuedada> participantes = new ArrayList<>();

    @ToString.Exclude
    @OneToMany(mappedBy = "quedada", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<com.matchup.rating.entity.Rating> ratings = new ArrayList<>();

    @ToString.Exclude
    @OneToMany(mappedBy = "quedada", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<com.matchup.comment.entity.Comentario> comentarios = new ArrayList<>();
}
