package com.matchup.meetup.dto;

import java.time.LocalDateTime;

public record ComentarioSummaryResponse(
        Long id,
        Long idUsuario,
        String nombreUsuario,
        String contenido,
        LocalDateTime fechaCreacion
) {}
