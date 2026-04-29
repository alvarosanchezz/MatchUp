package com.matchup.meetup.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public record QuedadaPatchRequest(
        LocalDateTime fechaHoraInicio,
        LocalDateTime fechaHoraFin,

        @Size(max = 255)
        String ubicacionNombre,

        @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0")
        Double ubicacionLatitud,

        @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0")
        Double ubicacionLongitud,

        @Min(value = 2, message = "Se necesitan al menos 2 jugadores")
        Integer numJugadoresTotal,

        Boolean esPublica,

        @Size(max = 2000)
        String descripcion
) {}
