package com.matchup.comment.controller;

import com.matchup.comment.dto.ComentarioRequest;
import com.matchup.comment.dto.ComentarioResponse;
import com.matchup.comment.service.ComentarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/meetups/{meetupId}/comments")
@RequiredArgsConstructor
@Tag(name = "Comentarios", description = "Comentarios en quedadas (participantes y organizador)")
public class ComentarioController {

    private final ComentarioService comentarioService;

    @PostMapping
    @Operation(summary = "Crear comentario (debes ser participante u organizador)")
    public ResponseEntity<ComentarioResponse> crear(
            @PathVariable Long meetupId,
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody ComentarioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(comentarioService.crear(meetupId, principal.getUsername(), request));
    }

    @GetMapping
    @Operation(summary = "Listar comentarios de una quedada (paginado, orden cronológico)")
    public ResponseEntity<Page<ComentarioResponse>> listar(
            @PathVariable Long meetupId,
            @PageableDefault(size = 20, sort = "fechaCreacion") Pageable pageable) {
        return ResponseEntity.ok(comentarioService.listar(meetupId, pageable));
    }

    @DeleteMapping("/{commentId}")
    @Operation(summary = "Eliminar comentario (solo autor o ADMIN)")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long meetupId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserDetails principal) {
        comentarioService.eliminar(meetupId, commentId, principal.getUsername());
        return ResponseEntity.noContent().build();
    }
}
