package com.matchup.comment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ComentarioRequest(
        @NotBlank(message = "El contenido del comentario no puede estar vacío")
        @Size(max = 1000, message = "El comentario no puede superar 1000 caracteres")
        String contenido
) {}
