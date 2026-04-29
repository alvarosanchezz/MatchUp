package com.matchup.participation.service;

import com.matchup.common.exception.BusinessException;
import com.matchup.common.exception.ConflictException;
import com.matchup.common.exception.NotFoundException;
import com.matchup.meetup.entity.EstadoQuedada;
import com.matchup.meetup.entity.Quedada;
import com.matchup.meetup.repository.QuedadaRepository;
import com.matchup.meetup.service.QuedadaService;
import com.matchup.participation.dto.ParticipacionResponse;
import com.matchup.participation.entity.EstadoAsistencia;
import com.matchup.participation.entity.UsuarioQuedada;
import com.matchup.participation.entity.UsuarioQuedadaId;
import com.matchup.participation.repository.ParticipacionRepository;
import com.matchup.user.entity.Usuario;
import com.matchup.user.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ParticipacionService {

    private final ParticipacionRepository participacionRepository;
    private final QuedadaRepository quedadaRepository;
    private final UsuarioRepository usuarioRepository;
    private final QuedadaService quedadaService;

    // ── JOIN ──────────────────────────────────────────────────────────────────

    @Transactional
    public ParticipacionResponse join(Long quedadaId, String email) {
        Usuario usuario = findUsuarioByEmail(email);
        Quedada quedada = quedadaService.findById(quedadaId);

        if (quedada.getEstado() != EstadoQuedada.ABIERTA) {
            throw new BusinessException("Solo puedes apuntarte a quedadas con estado ABIERTA");
        }
        if (!quedada.getFechaHoraInicio().isAfter(LocalDateTime.now())) {
            throw new BusinessException("No puedes apuntarte a una quedada que ya ha comenzado");
        }
        if (quedada.getOrganizador().getId().equals(usuario.getId())) {
            throw new BusinessException("El organizador no puede apuntarse a su propia quedada");
        }

        participacionRepository.findByQuedadaIdAndUsuarioId(quedadaId, usuario.getId())
                .ifPresent(uq -> {
                    if (uq.getEstadoAsistencia() != EstadoAsistencia.RETIRADO) {
                        throw new ConflictException("Ya estás apuntado a esta quedada");
                    }
                });

        long activos = participacionRepository.countByQuedadaIdAndEstadoIn(
                quedadaId, List.of(EstadoAsistencia.PENDIENTE, EstadoAsistencia.CONFIRMADO));
        if (activos >= quedada.getNumJugadoresTotal()) {
            throw new BusinessException("La quedada está completa, no hay plazas disponibles");
        }

        UsuarioQuedadaId pk = new UsuarioQuedadaId(usuario.getId(), quedadaId);
        UsuarioQuedada participacion = participacionRepository.findById(pk)
                .map(uq -> { uq.setEstadoAsistencia(EstadoAsistencia.PENDIENTE);
                             uq.setFechaConfirmacion(null);
                             return uq; })
                .orElseGet(() -> UsuarioQuedada.builder()
                        .id(pk).usuario(usuario).quedada(quedada)
                        .estadoAsistencia(EstadoAsistencia.PENDIENTE)
                        .build());

        participacionRepository.save(participacion);

        // Marcar COMPLETA si se llenó el cupo
        if (activos + 1 >= quedada.getNumJugadoresTotal()) {
            quedada.setEstado(EstadoQuedada.COMPLETA);
            quedadaRepository.save(quedada);
        }

        return toResponse(participacion);
    }

    // ── LEAVE ─────────────────────────────────────────────────────────────────

    @Transactional
    public void leave(Long quedadaId, String email) {
        Usuario usuario = findUsuarioByEmail(email);
        Quedada quedada = quedadaService.findById(quedadaId);

        if (quedada.getEstado() == EstadoQuedada.FINALIZADA
                || quedada.getEstado() == EstadoQuedada.CANCELADA) {
            throw new BusinessException("No puedes desapuntarte de una quedada finalizada o cancelada");
        }

        UsuarioQuedada participacion = participacionRepository
                .findByQuedadaIdAndUsuarioId(quedadaId, usuario.getId())
                .filter(uq -> uq.getEstadoAsistencia() == EstadoAsistencia.PENDIENTE
                           || uq.getEstadoAsistencia() == EstadoAsistencia.CONFIRMADO)
                .orElseThrow(() -> new BusinessException("No estás apuntado a esta quedada"));

        participacion.setEstadoAsistencia(EstadoAsistencia.RETIRADO);
        participacionRepository.save(participacion);

        // Si la quedada estaba COMPLETA, volver a ABIERTA al liberar una plaza
        if (quedada.getEstado() == EstadoQuedada.COMPLETA) {
            quedada.setEstado(EstadoQuedada.ABIERTA);
            quedadaRepository.save(quedada);
        }
    }

    // ── CONFIRM (organizador) ─────────────────────────────────────────────────

    @Transactional
    public ParticipacionResponse confirmar(Long quedadaId, Long userId, String email) {
        Quedada quedada = quedadaService.findById(quedadaId);
        requireOrganizador(quedada, email);
        requireFinalizada(quedada);

        UsuarioQuedada participacion = findParticipacion(quedadaId, userId);
        participacion.setEstadoAsistencia(EstadoAsistencia.CONFIRMADO);
        participacion.setFechaConfirmacion(LocalDateTime.now());
        participacionRepository.save(participacion);

        recalcularFiabilidad(participacion.getUsuario());
        return toResponse(participacion);
    }

    // ── NO-SHOW (organizador) ─────────────────────────────────────────────────

    @Transactional
    public ParticipacionResponse marcarAusente(Long quedadaId, Long userId, String email) {
        Quedada quedada = quedadaService.findById(quedadaId);
        requireOrganizador(quedada, email);
        requireFinalizada(quedada);

        UsuarioQuedada participacion = findParticipacion(quedadaId, userId);
        participacion.setEstadoAsistencia(EstadoAsistencia.AUSENTE);
        participacionRepository.save(participacion);

        recalcularFiabilidad(participacion.getUsuario());
        return toResponse(participacion);
    }

    // ── Fiabilidad ────────────────────────────────────────────────────────────

    void recalcularFiabilidad(Usuario usuario) {
        long confirmados = participacionRepository.countByUsuarioIdAndEstado(
                usuario.getId(), EstadoAsistencia.CONFIRMADO);
        long ausentes = participacionRepository.countByUsuarioIdAndEstado(
                usuario.getId(), EstadoAsistencia.AUSENTE);
        long total = confirmados + ausentes;

        double score = total == 0 ? 100.0 : (confirmados * 100.0 / total);
        usuario.setFiabilidadScore(Math.round(score * 100.0) / 100.0);
        usuarioRepository.save(usuario);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private UsuarioQuedada findParticipacion(Long quedadaId, Long userId) {
        return participacionRepository.findByQuedadaIdAndUsuarioId(quedadaId, userId)
                .orElseThrow(() -> new NotFoundException(
                        "El usuario " + userId + " no es participante de esta quedada"));
    }

    private void requireOrganizador(Quedada quedada, String email) {
        if (!quedada.getOrganizador().getEmail().equals(email)) {
            throw new AccessDeniedException("Solo el organizador puede realizar esta acción");
        }
    }

    private void requireFinalizada(Quedada quedada) {
        if (quedada.getEstado() != EstadoQuedada.FINALIZADA) {
            throw new BusinessException(
                    "Solo se puede confirmar asistencia en quedadas con estado FINALIZADA");
        }
    }

    private Usuario findUsuarioByEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    }

    private ParticipacionResponse toResponse(UsuarioQuedada uq) {
        return new ParticipacionResponse(
                uq.getUsuario().getId(),
                uq.getUsuario().getNombre(),
                uq.getQuedada().getId(),
                uq.getEstadoAsistencia(),
                uq.getFechaConfirmacion()
        );
    }
}
