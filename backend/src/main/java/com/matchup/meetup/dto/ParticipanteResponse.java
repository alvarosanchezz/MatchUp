package com.matchup.meetup.dto;

import com.matchup.participation.entity.EstadoAsistencia;

public record ParticipanteResponse(
        Long idUsuario,
        String nombre,
        String urlFotoPerfil,
        EstadoAsistencia estadoAsistencia
) {}
