package com.matchup.user.dto;

public record UsuarioPreferenciaResponse(
        Long idDeporte,
        String nombreDeporte,
        Integer nivel,
        String rolPreferido
) {}
