package com.matchup.rating.controller;

import com.matchup.rating.dto.RatingRequest;
import com.matchup.rating.dto.RatingResponse;
import com.matchup.rating.service.RatingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/meetups/{meetupId}/ratings")
@RequiredArgsConstructor
@Tag(name = "Ratings", description = "Valoraciones entre participantes de una quedada finalizada")
public class RatingController {

    private final RatingService ratingService;

    @PostMapping
    @Operation(summary = "Valorar a otro participante (solo en quedadas FINALIZADAS, una vez por par)")
    public ResponseEntity<RatingResponse> crear(
            @PathVariable Long meetupId,
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody RatingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ratingService.crear(meetupId, principal.getUsername(), request));
    }

    @GetMapping("/received")
    @Operation(summary = "Mis valoraciones recibidas en esta quedada")
    public ResponseEntity<List<RatingResponse>> getRatingsRecibidos(
            @PathVariable Long meetupId,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(
                ratingService.getRatingsRecibidos(meetupId, principal.getUsername()));
    }
}
