package com.matchup.rating.entity;

import com.matchup.meetup.entity.Quedada;
import com.matchup.user.entity.Usuario;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(
    name = "rating",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_rating_por_quedada",
        columnNames = {"id_quedada", "id_valorador", "id_valorado"}
    )
)
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_quedada", nullable = false)
    @ToString.Exclude
    private Quedada quedada;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_valorador", nullable = false)
    @ToString.Exclude
    private Usuario valorador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_valorado", nullable = false)
    @ToString.Exclude
    private Usuario valorado;

    @Column(name = "nivel_nota", nullable = false)
    private Integer nivelNota;

    @Column(name = "deportividad_nota", nullable = false)
    private Integer deportividadNota;

    @CreationTimestamp
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
}
