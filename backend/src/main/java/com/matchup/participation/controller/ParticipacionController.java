package com.matchup.participation.controller;

import com.matchup.participation.dto.ParticipacionResponse;
import com.matchup.participation.service.ParticipacionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/meetups/{meetupId}/participations")
@RequiredArgsConstructor
@Tag(name = "Participaciones", description = "Gestión de asistencia a quedadas")
public class ParticipacionController {

    private final ParticipacionService participacionService;

    @PostMapping("/join")
    @Operation(summary = "Apuntarse a una quedada (valida cupo, fecha, no-organizador, no-duplicado)")
    public ResponseEntity<ParticipacionResponse> join(
            @PathVariable Long meetupId,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(participacionService.join(meetupId, principal.getUsername()));
    }

    @PostMapping("/leave")
    @Operation(summary = "Desapuntarse de una quedada")
    public ResponseEntity<Void> leave(
            @PathVariable Long meetupId,
            @AuthenticationPrincipal UserDetails principal) {
        participacionService.leave(meetupId, principal.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{userId}/confirm")
    @Operation(summary = "Confirmar asistencia de un participante tras el evento (solo organizador)")
    public ResponseEntity<ParticipacionResponse> confirmar(
            @PathVariable Long meetupId,
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(
                participacionService.confirmar(meetupId, userId, principal.getUsername()));
    }

    @PostMapping("/{userId}/no-show")
    @Operation(summary = "Marcar participante como ausente tras el evento (solo organizador)")
    public ResponseEntity<ParticipacionResponse> noShow(
            @PathVariable Long meetupId,
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(
                participacionService.marcarAusente(meetupId, userId, principal.getUsername()));
    }
}
