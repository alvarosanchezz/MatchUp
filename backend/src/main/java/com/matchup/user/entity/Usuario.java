package com.matchup.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "ubicacion_latitud")
    private Double ubicacionLatitud;

    @Column(name = "ubicacion_longitud")
    private Double ubicacionLongitud;

    @Builder.Default
    @Column(name = "fiabilidad_score", nullable = false)
    private Double fiabilidadScore = 100.0;

    @CreationTimestamp
    @Column(name = "fecha_registro", nullable = false, updatable = false)
    private LocalDate fechaRegistro;

    @Column(name = "url_foto_perfil")
    private String urlFotoPerfil;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "rol_usuario")
    @Builder.Default
    private RolUsuario rol = RolUsuario.USER;

    @Builder.Default
    @Column(name = "esta_baneado", nullable = false)
    private Boolean estaBaneado = false;

    // ── Relaciones ──

    @ToString.Exclude
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<com.matchup.user.entity.UsuarioDeporte> deportes = new ArrayList<>();

    @ToString.Exclude
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<com.matchup.participation.entity.UsuarioQuedada> participaciones = new ArrayList<>();
}
