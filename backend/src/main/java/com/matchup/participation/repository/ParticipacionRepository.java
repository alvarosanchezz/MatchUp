package com.matchup.participation.repository;

import com.matchup.participation.entity.EstadoAsistencia;
import com.matchup.participation.entity.UsuarioQuedada;
import com.matchup.participation.entity.UsuarioQuedadaId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ParticipacionRepository extends JpaRepository<UsuarioQuedada, UsuarioQuedadaId> {

    Optional<UsuarioQuedada> findByQuedadaIdAndUsuarioId(Long quedadaId, Long usuarioId);

    @Query("SELECT COUNT(uq) FROM UsuarioQuedada uq " +
           "WHERE uq.quedada.id = :quedadaId AND uq.estadoAsistencia IN :estados")
    long countByQuedadaIdAndEstadoIn(@Param("quedadaId") Long quedadaId,
                                     @Param("estados") List<EstadoAsistencia> estados);

    @Query("SELECT COUNT(uq) FROM UsuarioQuedada uq " +
           "WHERE uq.usuario.id = :usuarioId AND uq.estadoAsistencia = :estado")
    long countByUsuarioIdAndEstado(@Param("usuarioId") Long usuarioId,
                                   @Param("estado") EstadoAsistencia estado);
}
