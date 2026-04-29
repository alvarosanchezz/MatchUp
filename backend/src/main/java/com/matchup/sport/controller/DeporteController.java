package com.matchup.sport.controller;

import com.matchup.sport.dto.DeportePatchRequest;
import com.matchup.sport.dto.DeporteRequest;
import com.matchup.sport.dto.DeporteResponse;
import com.matchup.sport.service.DeporteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sports")
@RequiredArgsConstructor
@Tag(name = "Deportes", description = "Catálogo de deportes (escritura restringida a ADMIN)")
public class DeporteController {

    private final DeporteService deporteService;

    @GetMapping
    @Operation(summary = "Listar todos los deportes disponibles")
    public ResponseEntity<List<DeporteResponse>> listar() {
        return ResponseEntity.ok(deporteService.listarTodos());
    }

    @PostMapping
    @Operation(summary = "Crear nuevo deporte (solo ADMIN)")
    public ResponseEntity<DeporteResponse> crear(@Valid @RequestBody DeporteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(deporteService.crear(request));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Actualizar campos de un deporte (solo ADMIN)")
    public ResponseEntity<DeporteResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody DeportePatchRequest request) {
        return ResponseEntity.ok(deporteService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un deporte (solo ADMIN)")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        deporteService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
