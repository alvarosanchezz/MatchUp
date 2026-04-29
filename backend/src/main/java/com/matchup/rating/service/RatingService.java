package com.matchup.rating.service;

import com.matchup.common.exception.BusinessException;
import com.matchup.common.exception.ConflictException;
import com.matchup.common.exception.NotFoundException;
import com.matchup.meetup.entity.EstadoQuedada;
import com.matchup.meetup.entity.Quedada;
import com.matchup.meetup.service.QuedadaService;
import com.matchup.participation.entity.EstadoAsistencia;
import com.matchup.participation.repository.ParticipacionRepository;
import com.matchup.rating.dto.RatingRequest;
import com.matchup.rating.dto.RatingResponse;
import com.matchup.rating.entity.Rating;
import com.matchup.rating.repository.RatingRepository;
import com.matchup.user.entity.Usuario;
import com.matchup.user.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final ParticipacionRepository participacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final QuedadaService quedadaService;

    @Transactional
    public RatingResponse crear(Long quedadaId, String emailValorador, RatingRequest request) {
        Quedada quedada = quedadaService.findById(quedadaId);

        if (quedada.getEstado() != EstadoQuedada.FINALIZADA) {
            throw new BusinessException("Solo puedes valorar en quedadas con estado FINALIZADA");
        }

        Usuario valorador = findByEmail(emailValorador);
        Usuario valorado  = usuarioRepository.findById(request.idValorado())
                .orElseThrow(() -> new NotFoundException("Usuario valorado no encontrado: " + request.idValorado()));

        if (valorador.getId().equals(valorado.getId())) {
            throw new BusinessException("No puedes valorarte a ti mismo");
        }

        requireParticipanteOOrganizador(quedada, valorador, "No eres participante de esta quedada");
        requireParticipanteOOrganizador(quedada, valorado,  "El usuario valorado no participó en esta quedada");

        if (ratingRepository.existsByQuedadaIdAndValorador_IdAndValorado_Id(
                quedadaId, valorador.getId(), valorado.getId())) {
            throw new ConflictException("Ya has valorado a este usuario en esta quedada");
        }

        Rating rating = Rating.builder()
                .quedada(quedada)
                .valorador(valorador)
                .valorado(valorado)
                .nivelNota(request.nivelNota())
                .deportividadNota(request.deportividadNota())
                .build();

        return toResponse(ratingRepository.save(rating));
    }

    @Transactional(readOnly = true)
    public List<RatingResponse> getRatingsRecibidos(Long quedadaId, String email) {
        quedadaService.findById(quedadaId);          // valida que existe
        Usuario usuario = findByEmail(email);
        return ratingRepository.findByQuedadaIdAndValorado_Id(quedadaId, usuario.getId())
                .stream().map(this::toResponse).toList();
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private void requireParticipanteOOrganizador(Quedada quedada, Usuario usuario, String msg) {
        boolean esOrganizador = quedada.getOrganizador().getId().equals(usuario.getId());
        boolean esParticipante = participacionRepository
                .findByQuedadaIdAndUsuarioId(quedada.getId(), usuario.getId())
                .map(uq -> uq.getEstadoAsistencia() != EstadoAsistencia.RETIRADO)
                .orElse(false);
        if (!esOrganizador && !esParticipante) {
            throw new BusinessException(msg);
        }
    }

    private Usuario findByEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    }

    private RatingResponse toResponse(Rating r) {
        return new RatingResponse(
                r.getId(),
                r.getQuedada().getId(),
                r.getValorador().getId(),
                r.getValorador().getNombre(),
                r.getValorado().getId(),
                r.getValorado().getNombre(),
                r.getNivelNota(),
                r.getDeportividadNota(),
                r.getFechaCreacion()
        );
    }
}
