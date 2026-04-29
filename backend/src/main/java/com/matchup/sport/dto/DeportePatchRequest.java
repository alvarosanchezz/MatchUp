package com.matchup.sport.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record DeportePatchRequest(
        @Size(max = 100, message = "El nombre no puede superar 100 caracteres")
        String nombre,

        @Min(value = 2, message = "El número mínimo de jugadores es 2")
        Integer jugadoresDefault,

        String descripcion
) {}
