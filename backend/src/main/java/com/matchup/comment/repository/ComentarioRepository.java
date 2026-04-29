package com.matchup.comment.repository;

import com.matchup.comment.entity.Comentario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComentarioRepository extends JpaRepository<Comentario, Long> {
    Page<Comentario> findByQuedadaId(Long quedadaId, Pageable pageable);
}
