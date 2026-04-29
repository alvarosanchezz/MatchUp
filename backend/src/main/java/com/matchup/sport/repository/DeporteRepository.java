package com.matchup.sport.repository;

import com.matchup.sport.entity.Deporte;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeporteRepository extends JpaRepository<Deporte, Long> {
    Optional<Deporte> findByNombre(String nombre);
    boolean existsByNombre(String nombre);
}
