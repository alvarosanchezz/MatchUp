package com.matchup.user.service;

import com.matchup.common.exception.NotFoundException;
import com.matchup.sport.entity.Deporte;
import com.matchup.sport.repository.DeporteRepository;
import com.matchup.user.dto.*;
import com.matchup.user.entity.Usuario;
import com.matchup.user.entity.UsuarioDeporte;
import com.matchup.user.entity.UsuarioDeporteId;
import com.matchup.user.mapper.UsuarioMapper;
import com.matchup.user.repository.UsuarioDeporteRepository;
import com.matchup.user.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioDeporteRepository usuarioDeporteRepository;
    private final DeporteRepository deporteRepository;
    private final UsuarioMapper usuarioMapper;

    @Transactional(readOnly = true)
    public UsuarioResponse getMe(String email) {
        return usuarioMapper.toResponse(findByEmail(email));
    }

    @Transactional
    public UsuarioResponse updateMe(String email, UsuarioUpdateRequest request) {
        Usuario usuario = findByEmail(email);
        if (request.nombre() != null)            usuario.setNombre(request.nombre());
        if (request.ubicacionLatitud() != null)  usuario.setUbicacionLatitud(request.ubicacionLatitud());
        if (request.ubicacionLongitud() != null) usuario.setUbicacionLongitud(request.ubicacionLongitud());
        if (request.urlFotoPerfil() != null)     usuario.setUrlFotoPerfil(request.urlFotoPerfil());
        return usuarioMapper.toResponse(usuarioRepository.save(usuario));
    }

    @Transactional(readOnly = true)
    public List<UsuarioPreferenciaResponse> getMySports(String email) {
        Usuario usuario = findByEmail(email);
        return usuarioDeporteRepository.findByUsuarioId(usuario.getId())
                .stream()
                .map(usuarioMapper::toPreferenciaResponse)
                .toList();
    }

    @Transactional
    public List<UsuarioPreferenciaResponse> updateMySports(String email,
                                                            List<UsuarioPreferenciaRequest> requests) {
        Usuario usuario = findByEmail(email);
        usuarioDeporteRepository.deleteByUsuarioId(usuario.getId());
        usuarioDeporteRepository.flush();

        List<UsuarioDeporte> nuevas = requests.stream().map(req -> {
            Deporte deporte = deporteRepository.findById(req.idDeporte())
                    .orElseThrow(() -> new NotFoundException("Deporte no encontrado: " + req.idDeporte()));
            return UsuarioDeporte.builder()
                    .id(new UsuarioDeporteId(usuario.getId(), deporte.getId()))
                    .usuario(usuario)
                    .deporte(deporte)
                    .nivelAutoevaluado(req.nivel())
                    .rolPreferido(req.rolPreferido())
                    .build();
        }).toList();

        usuarioDeporteRepository.saveAll(nuevas);
        return nuevas.stream().map(usuarioMapper::toPreferenciaResponse).toList();
    }

    @Transactional(readOnly = true)
    public UsuarioPublicResponse getPublicProfile(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado: " + id));
        return usuarioMapper.toPublicResponse(usuario);
    }

    private Usuario findByEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    }
}
