package com.matchup.comment.dto;

import java.time.LocalDateTime;

public record ComentarioResponse(
        Long id,
        Long idQuedada,
        Long idUsuario,
        String nombreUsuario,
        String contenido,
        LocalDateTime fechaCreacion
) {}
