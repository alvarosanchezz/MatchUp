package com.matchup.sport.dto;

public record DeporteResponse(
        Long id,
        String nombre,
        Integer jugadoresDefault,
        String descripcion
) {}
