package com.matchup.participation.entity;

import com.matchup.meetup.entity.Quedada;
import com.matchup.user.entity.Usuario;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "usuario_quedada")
public class UsuarioQuedada {

    @EmbeddedId
    @EqualsAndHashCode.Include
    private UsuarioQuedadaId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idUsuario")
    @JoinColumn(name = "id_usuario")
    @ToString.Exclude
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idQuedada")
    @JoinColumn(name = "id_quedada")
    @ToString.Exclude
    private Quedada quedada;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Builder.Default
    @Column(name = "estado_asistencia", nullable = false, columnDefinition = "estado_asistencia")
    private EstadoAsistencia estadoAsistencia = EstadoAsistencia.PENDIENTE;

    @Column(name = "fecha_confirmacion")
    private LocalDateTime fechaConfirmacion;
}
