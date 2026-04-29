package com.matchup.user.repository;

import com.matchup.user.entity.UsuarioDeporte;
import com.matchup.user.entity.UsuarioDeporteId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UsuarioDeporteRepository extends JpaRepository<UsuarioDeporte, UsuarioDeporteId> {
    List<UsuarioDeporte> findByUsuarioId(Long usuarioId);
    void deleteByUsuarioId(Long usuarioId);
}
