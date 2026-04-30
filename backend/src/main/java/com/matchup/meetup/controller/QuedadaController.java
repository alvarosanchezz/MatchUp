package com.matchup.meetup.controller;

import com.matchup.meetup.dto.*;
import com.matchup.meetup.entity.EstadoQuedada;
import com.matchup.meetup.service.QuedadaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/meetups")
@RequiredArgsConstructor
@Tag(name = "Quedadas", description = "CRUD de quedadas deportivas con búsqueda y filtros")
public class QuedadaController {

    private final QuedadaService quedadaService;

    @PostMapping
    @Operation(summary = "Crear quedada (organizador = usuario autenticado, estado = ABIERTA)")
    public ResponseEntity<QuedadaDetailResponse> crear(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody QuedadaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(quedadaService.crear(principal.getUsername(), request));
    }

    @GetMapping
    @Operation(summary = "Listar quedadas con filtros opcionales y paginación")
    public ResponseEntity<Page<QuedadaSummaryResponse>> listar(
            @RequestParam(required = false) Long idDeporte,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaDesde,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaHasta,
            @RequestParam(required = false) EstadoQuedada estado,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(required = false) Double radioKm,
            @PageableDefault(size = 20, sort = "fechaHoraInicio") Pageable pageable) {

        return ResponseEntity.ok(quedadaService.listar(
                idDeporte, fechaDesde, fechaHasta, estado, lat, lon, radioKm, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalle de quedada con participantes y comentarios")
    public ResponseEntity<QuedadaDetailResponse> getDetalle(@PathVariable Long id) {
        return ResponseEntity.ok(quedadaService.getDetalle(id));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Editar quedada (solo organizador)")
    public ResponseEntity<QuedadaDetailResponse> editar(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody QuedadaPatchRequest request) {
        return ResponseEntity.ok(quedadaService.editar(id, principal.getUsername(), request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancelar quedada — cambia estado a CANCELADA (solo organizador)")
    public ResponseEntity<Void> cancelar(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        quedadaService.cancelar(id, principal.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/finalize")
    @Operation(summary = "Finalizar quedada — cambia estado a FINALIZADA (solo organizador)")
    public ResponseEntity<QuedadaDetailResponse> finalizar(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(quedadaService.finalizar(id, principal.getUsername()));
    }
}
