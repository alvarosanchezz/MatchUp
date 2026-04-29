package com.matchup.meetup.dto;

import com.matchup.meetup.entity.EstadoQuedada;

import java.time.LocalDateTime;

public record QuedadaSummaryResponse(
        Long id,
        Long idOrganizador,
        String nombreOrganizador,
        Long idDeporte,
        String nombreDeporte,
        LocalDateTime fechaHoraInicio,
        LocalDateTime fechaHoraFin,
        String ubicacionNombre,
        Double ubicacionLatitud,
        Double ubicacionLongitud,
        Integer numJugadoresTotal,
        Integer numParticipantesActivos,
        Boolean esPublica,
        String descripcion,
        EstadoQuedada estado
) {}
