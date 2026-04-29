package com.matchup.meetup.service;

import com.matchup.common.exception.BusinessException;
import com.matchup.common.exception.NotFoundException;
import com.matchup.meetup.dto.*;
import com.matchup.meetup.entity.EstadoQuedada;
import com.matchup.meetup.entity.Quedada;
import com.matchup.meetup.mapper.QuedadaMapper;
import com.matchup.meetup.repository.QuedadaRepository;
import com.matchup.meetup.repository.QuedadaSpecification;
import com.matchup.sport.entity.Deporte;
import com.matchup.sport.repository.DeporteRepository;
import com.matchup.user.entity.Usuario;
import com.matchup.user.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class QuedadaService {

    private final QuedadaRepository quedadaRepository;
    private final UsuarioRepository usuarioRepository;
    private final DeporteRepository deporteRepository;
    private final QuedadaMapper quedadaMapper;

    @Transactional
    public QuedadaDetailResponse crear(String email, QuedadaRequest request) {
        if (!request.fechaHoraFin().isAfter(request.fechaHoraInicio())) {
            throw new BusinessException("La fecha de fin debe ser posterior a la fecha de inicio");
        }
        Usuario organizador = findUsuarioByEmail(email);
        Deporte deporte = findDeporteById(request.idDeporte());

        Quedada quedada = Quedada.builder()
                .organizador(organizador)
                .deporte(deporte)
                .fechaHoraInicio(request.fechaHoraInicio())
                .fechaHoraFin(request.fechaHoraFin())
                .ubicacionNombre(request.ubicacionNombre())
                .ubicacionLatitud(request.ubicacionLatitud())
                .ubicacionLongitud(request.ubicacionLongitud())
                .numJugadoresTotal(request.numJugadoresTotal())
                .esPublica(request.esPublica() != null ? request.esPublica() : true)
                .descripcion(request.descripcion())
                .estado(EstadoQuedada.ABIERTA)
                .build();

        return quedadaMapper.toDetailResponse(quedadaRepository.save(quedada));
    }

    @Transactional(readOnly = true)
    public Page<QuedadaSummaryResponse> listar(
            Long idDeporte,
            LocalDateTime fechaDesde,
            LocalDateTime fechaHasta,
            EstadoQuedada estado,
            Double lat,
            Double lon,
            Double radioKm,
            Pageable pageable) {

        Specification<Quedada> spec = QuedadaSpecification.conFiltros(
                idDeporte, fechaDesde, fechaHasta, estado, lat, lon, radioKm);
        return quedadaRepository.findAll(spec, pageable)
                .map(quedadaMapper::toSummaryResponse);
    }

    @Transactional(readOnly = true)
    public QuedadaDetailResponse getDetalle(Long id) {
        return quedadaMapper.toDetailResponse(findById(id));
    }

    @Transactional
    public QuedadaDetailResponse editar(Long id, String email, QuedadaPatchRequest request) {
        Quedada quedada = findById(id);
        requireOrganizador(quedada, email);

        if (quedada.getEstado() == EstadoQuedada.CANCELADA) {
            throw new BusinessException("No se puede editar una quedada cancelada");
        }

        if (request.fechaHoraInicio() != null) quedada.setFechaHoraInicio(request.fechaHoraInicio());
        if (request.fechaHoraFin() != null)    quedada.setFechaHoraFin(request.fechaHoraFin());
        if (request.ubicacionNombre() != null) quedada.setUbicacionNombre(request.ubicacionNombre());
        if (request.ubicacionLatitud() != null) quedada.setUbicacionLatitud(request.ubicacionLatitud());
        if (request.ubicacionLongitud() != null) quedada.setUbicacionLongitud(request.ubicacionLongitud());
        if (request.numJugadoresTotal() != null) quedada.setNumJugadoresTotal(request.numJugadoresTotal());
        if (request.esPublica() != null)        quedada.setEsPublica(request.esPublica());
        if (request.descripcion() != null)      quedada.setDescripcion(request.descripcion());

        if (!quedada.getFechaHoraFin().isAfter(quedada.getFechaHoraInicio())) {
            throw new BusinessException("La fecha de fin debe ser posterior a la fecha de inicio");
        }

        return quedadaMapper.toDetailResponse(quedadaRepository.save(quedada));
    }

    @Transactional
    public void cancelar(Long id, String email) {
        Quedada quedada = findById(id);
        requireOrganizador(quedada, email);

        if (quedada.getEstado() == EstadoQuedada.CANCELADA) {
            throw new BusinessException("La quedada ya está cancelada");
        }
        quedada.setEstado(EstadoQuedada.CANCELADA);
        quedadaRepository.save(quedada);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    public Quedada findById(Long id) {
        return quedadaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Quedada no encontrada: " + id));
    }

    private void requireOrganizador(Quedada quedada, String email) {
        if (!quedada.getOrganizador().getEmail().equals(email)) {
            throw new AccessDeniedException("Solo el organizador puede realizar esta acción");
        }
    }

    private Usuario findUsuarioByEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    }

    private Deporte findDeporteById(Long id) {
        return deporteRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Deporte no encontrado: " + id));
    }
}
