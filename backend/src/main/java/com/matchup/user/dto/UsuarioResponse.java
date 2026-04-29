package com.matchup.user.dto;

import com.matchup.user.entity.RolUsuario;

import java.time.LocalDate;
import java.util.List;

public record UsuarioResponse(
        Long id,
        String nombre,
        String email,
        Double ubicacionLatitud,
        Double ubicacionLongitud,
        Double fiabilidadScore,
        LocalDate fechaRegistro,
        String urlFotoPerfil,
        RolUsuario rol,
        List<UsuarioPreferenciaResponse> deportes
) {}
