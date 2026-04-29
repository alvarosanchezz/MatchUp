package com.matchup.rating.dto;

import jakarta.validation.constraints.*;

public record RatingRequest(
        @NotNull(message = "El usuario valorado es obligatorio")
        Long idValorado,

        @NotNull(message = "La nota de nivel es obligatoria")
        @Min(value = 1, message = "La nota mínima es 1")
        @Max(value = 5, message = "La nota máxima es 5")
        Integer nivelNota,

        @NotNull(message = "La nota de deportividad es obligatoria")
        @Min(value = 1, message = "La nota mínima es 1")
        @Max(value = 5, message = "La nota máxima es 5")
        Integer deportividadNota
) {}
