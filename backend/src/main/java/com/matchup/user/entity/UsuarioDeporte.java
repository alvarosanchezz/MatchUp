package com.matchup.user.entity;

import com.matchup.sport.entity.Deporte;
import jakarta.persistence.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "usuario_deporte")
public class UsuarioDeporte {

    @EmbeddedId
    @EqualsAndHashCode.Include
    private UsuarioDeporteId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idUsuario")
    @JoinColumn(name = "id_usuario")
    @ToString.Exclude
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idDeporte")
    @JoinColumn(name = "id_deporte")
    @ToString.Exclude
    private Deporte deporte;

    @Column(name = "nivel_autoevaluado", nullable = false)
    private Integer nivelAutoevaluado;

    @Column(name = "rol_preferido", length = 100)
    private String rolPreferido;
}
