package com.matchup.rating.dto;

import java.time.LocalDateTime;

public record RatingResponse(
        Long id,
        Long idQuedada,
        Long idValorador,
        String nombreValorador,
        Long idValorado,
        String nombreValorado,
        Integer nivelNota,
        Integer deportividadNota,
        LocalDateTime fechaCreacion
) {}
