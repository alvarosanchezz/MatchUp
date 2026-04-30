package com.matchup.meetup.repository;

import com.matchup.meetup.entity.Quedada;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface QuedadaRepository extends JpaRepository<Quedada, Long>,
        JpaSpecificationExecutor<Quedada> {

    Page<Quedada> findByOrganizadorId(Long organizadorId, Pageable pageable);

    @Query("""
            SELECT q FROM Quedada q
            JOIN q.participantes p
            WHERE p.usuario.id = :usuarioId
              AND p.estadoAsistencia IN (
                  com.matchup.participation.entity.EstadoAsistencia.PENDIENTE,
                  com.matchup.participation.entity.EstadoAsistencia.CONFIRMADO,
                  com.matchup.participation.entity.EstadoAsistencia.AUSENTE)
            """)
    Page<Quedada> findApuntadasByUsuarioId(@Param("usuarioId") Long usuarioId, Pageable pageable);

    @Query("""
            SELECT DISTINCT q FROM Quedada q
            LEFT JOIN q.participantes p
            WHERE q.organizador.id = :usuarioId
               OR (p.usuario.id = :usuarioId
                   AND p.estadoAsistencia IN (
                       com.matchup.participation.entity.EstadoAsistencia.PENDIENTE,
                       com.matchup.participation.entity.EstadoAsistencia.CONFIRMADO,
                       com.matchup.participation.entity.EstadoAsistencia.AUSENTE))
            """)
    Page<Quedada> findOrganizadasOApuntadasByUsuarioId(@Param("usuarioId") Long usuarioId, Pageable pageable);
}
