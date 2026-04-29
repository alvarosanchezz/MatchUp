package com.matchup.user.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

public record UsuarioUpdateRequest(
        @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
        String nombre,

        @DecimalMin(value = "-90.0", message = "Latitud mínima: -90")
        @DecimalMax(value = "90.0", message = "Latitud máxima: 90")
        Double ubicacionLatitud,

        @DecimalMin(value = "-180.0", message = "Longitud mínima: -180")
        @DecimalMax(value = "180.0", message = "Longitud máxima: 180")
        Double ubicacionLongitud,

        @Size(max = 500, message = "La URL de la foto no puede superar 500 caracteres")
        String urlFotoPerfil
) {}
