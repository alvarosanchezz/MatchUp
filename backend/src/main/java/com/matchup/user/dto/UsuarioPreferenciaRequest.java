package com.matchup.user.dto;

import jakarta.validation.constraints.*;

public record UsuarioPreferenciaRequest(
        @NotNull(message = "El id del deporte es obligatorio")
        Long idDeporte,

        @NotNull(message = "El nivel es obligatorio")
        @Min(value = 1, message = "El nivel mínimo es 1")
        @Max(value = 5, message = "El nivel máximo es 5")
        Integer nivel,

        @Size(max = 100, message = "El rol preferido no puede superar 100 caracteres")
        String rolPreferido
) {}
