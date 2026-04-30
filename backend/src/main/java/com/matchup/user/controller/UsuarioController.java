package com.matchup.user.controller;

import com.matchup.meetup.dto.QuedadaSummaryResponse;
import com.matchup.meetup.service.QuedadaService;
import com.matchup.user.dto.*;
import com.matchup.user.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Usuarios", description = "Gestión de perfiles de usuario y preferencias deportivas")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final QuedadaService quedadaService;

    @GetMapping("/me")
    @Operation(summary = "Perfil del usuario autenticado (con email)")
    public ResponseEntity<UsuarioResponse> getMe(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(usuarioService.getMe(principal.getUsername()));
    }

    @PatchMapping("/me")
    @Operation(summary = "Actualizar nombre, ubicación o foto de perfil")
    public ResponseEntity<UsuarioResponse> updateMe(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody UsuarioUpdateRequest request) {
        return ResponseEntity.ok(usuarioService.updateMe(principal.getUsername(), request));
    }

    @GetMapping("/me/sports")
    @Operation(summary = "Listar preferencias deportivas del usuario autenticado")
    public ResponseEntity<List<UsuarioPreferenciaResponse>> getMySports(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(usuarioService.getMySports(principal.getUsername()));
    }

    @PutMapping("/me/sports")
    @Operation(summary = "Reemplazar preferencias deportivas (lista completa)")
    public ResponseEntity<List<UsuarioPreferenciaResponse>> updateMySports(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody List<@Valid UsuarioPreferenciaRequest> request) {
        return ResponseEntity.ok(usuarioService.updateMySports(principal.getUsername(), request));
    }

    @GetMapping("/me/meetups")
    @Operation(summary = "Quedadas del usuario (ORGANIZADAS | APUNTADAS | TODAS)")
    public ResponseEntity<Page<QuedadaSummaryResponse>> getMisMeetups(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam(defaultValue = "TODAS") String role,
            @PageableDefault(size = 20, sort = "fechaHoraInicio") Pageable pageable) {
        return ResponseEntity.ok(quedadaService.getMisQuedadas(principal.getUsername(), role, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Perfil público de otro usuario (sin email ni password)")
    public ResponseEntity<UsuarioPublicResponse> getPublicProfile(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.getPublicProfile(id));
    }
}
