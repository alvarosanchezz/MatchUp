package com.matchup.meetup.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public record QuedadaRequest(
        @NotNull(message = "El deporte es obligatorio")
        Long idDeporte,

        @NotNull(message = "La fecha de inicio es obligatoria")
        @Future(message = "La fecha de inicio debe ser futura")
        LocalDateTime fechaHoraInicio,

        @NotNull(message = "La fecha de fin es obligatoria")
        LocalDateTime fechaHoraFin,

        @NotBlank(message = "El nombre de la ubicación es obligatorio")
        @Size(max = 255)
        String ubicacionNombre,

        @NotNull(message = "La latitud es obligatoria")
        @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0")
        Double ubicacionLatitud,

        @NotNull(message = "La longitud es obligatoria")
        @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0")
        Double ubicacionLongitud,

        @NotNull(message = "El número de jugadores es obligatorio")
        @Min(value = 1, message = "Se necesita al menos 1 jugador")
        Integer numJugadoresTotal,

        Boolean esPublica,

        @Size(max = 2000)
        String descripcion
) {}
