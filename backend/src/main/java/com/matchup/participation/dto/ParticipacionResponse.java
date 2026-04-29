package com.matchup.participation.dto;

import com.matchup.participation.entity.EstadoAsistencia;

import java.time.LocalDateTime;

public record ParticipacionResponse(
        Long idUsuario,
        String nombreUsuario,
        Long idQuedada,
        EstadoAsistencia estadoAsistencia,
        LocalDateTime fechaConfirmacion
) {}
