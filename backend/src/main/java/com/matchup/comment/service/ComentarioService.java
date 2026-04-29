package com.matchup.comment.service;

import com.matchup.comment.dto.ComentarioRequest;
import com.matchup.comment.dto.ComentarioResponse;
import com.matchup.comment.entity.Comentario;
import com.matchup.comment.repository.ComentarioRepository;
import com.matchup.common.exception.BusinessException;
import com.matchup.common.exception.NotFoundException;
import com.matchup.meetup.entity.Quedada;
import com.matchup.meetup.service.QuedadaService;
import com.matchup.participation.entity.EstadoAsistencia;
import com.matchup.participation.repository.ParticipacionRepository;
import com.matchup.user.entity.RolUsuario;
import com.matchup.user.entity.Usuario;
import com.matchup.user.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ComentarioService {

    private final ComentarioRepository comentarioRepository;
    private final ParticipacionRepository participacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final QuedadaService quedadaService;

    @Transactional
    public ComentarioResponse crear(Long quedadaId, String email, ComentarioRequest request) {
        Quedada quedada = quedadaService.findById(quedadaId);
        Usuario usuario = findByEmail(email);

        requireParticipanteOOrganizador(quedada, usuario);

        Comentario comentario = Comentario.builder()
                .quedada(quedada)
                .usuario(usuario)
                .contenido(request.contenido())
                .build();

        return toResponse(comentarioRepository.save(comentario));
    }

    @Transactional(readOnly = true)
    public Page<ComentarioResponse> listar(Long quedadaId, Pageable pageable) {
        quedadaService.findById(quedadaId);   // valida que existe
        return comentarioRepository.findByQuedadaId(quedadaId, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public void eliminar(Long quedadaId, Long comentarioId, String email) {
        quedadaService.findById(quedadaId);   // valida que existe
        Usuario usuario = findByEmail(email);

        Comentario comentario = comentarioRepository.findById(comentarioId)
                .orElseThrow(() -> new NotFoundException("Comentario no encontrado: " + comentarioId));

        if (!comentario.getQuedada().getId().equals(quedadaId)) {
            throw new NotFoundException("Comentario no encontrado en esta quedada");
        }

        boolean esAutor = comentario.getUsuario().getId().equals(usuario.getId());
        boolean esAdmin = usuario.getRol() == RolUsuario.ADMIN;

        if (!esAutor && !esAdmin) {
            throw new AccessDeniedException("Solo el autor o un ADMIN puede eliminar este comentario");
        }

        comentarioRepository.delete(comentario);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private void requireParticipanteOOrganizador(Quedada quedada, Usuario usuario) {
        boolean esOrganizador = quedada.getOrganizador().getId().equals(usuario.getId());
        boolean esParticipante = participacionRepository
                .findByQuedadaIdAndUsuarioId(quedada.getId(), usuario.getId())
                .map(uq -> uq.getEstadoAsistencia() != EstadoAsistencia.RETIRADO)
                .orElse(false);
        if (!esOrganizador && !esParticipante) {
            throw new BusinessException("Debes ser participante u organizador para comentar");
        }
    }

    private Usuario findByEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    }

    private ComentarioResponse toResponse(Comentario c) {
        return new ComentarioResponse(
                c.getId(),
                c.getQuedada().getId(),
                c.getUsuario().getId(),
                c.getUsuario().getNombre(),
                c.getContenido(),
                c.getFechaCreacion()
        );
    }
}
