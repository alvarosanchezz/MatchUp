package com.matchup.rating.repository;

import com.matchup.rating.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    boolean existsByQuedadaIdAndValorador_IdAndValorado_Id(
            Long quedadaId, Long valoradorId, Long valoradoId);

    List<Rating> findByQuedadaIdAndValorado_Id(Long quedadaId, Long valoradoId);

    List<Rating> findByValorado_Id(Long valoradoId);
}
