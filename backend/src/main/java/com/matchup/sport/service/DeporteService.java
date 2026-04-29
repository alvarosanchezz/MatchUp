package com.matchup.sport.service;

import com.matchup.common.exception.ConflictException;
import com.matchup.common.exception.NotFoundException;
import com.matchup.sport.dto.DeportePatchRequest;
import com.matchup.sport.dto.DeporteRequest;
import com.matchup.sport.dto.DeporteResponse;
import com.matchup.sport.entity.Deporte;
import com.matchup.sport.mapper.DeporteMapper;
import com.matchup.sport.repository.DeporteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DeporteService {

    private final DeporteRepository deporteRepository;
    private final DeporteMapper deporteMapper;

    @Transactional(readOnly = true)
    public List<DeporteResponse> listarTodos() {
        return deporteRepository.findAll()
                .stream()
                .map(deporteMapper::toResponse)
                .toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public DeporteResponse crear(DeporteRequest request) {
        if (deporteRepository.existsByNombre(request.nombre())) {
            throw new ConflictException("Ya existe un deporte con el nombre: " + request.nombre());
        }
        Deporte deporte = Deporte.builder()
                .nombre(request.nombre())
                .jugadoresDefault(request.jugadoresDefault())
                .descripcion(request.descripcion())
                .build();
        return deporteMapper.toResponse(deporteRepository.save(deporte));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public DeporteResponse actualizar(Long id, DeportePatchRequest request) {
        Deporte deporte = findById(id);
        if (request.nombre() != null) {
            if (!request.nombre().equals(deporte.getNombre())
                    && deporteRepository.existsByNombre(request.nombre())) {
                throw new ConflictException("Ya existe un deporte con el nombre: " + request.nombre());
            }
            deporte.setNombre(request.nombre());
        }
        if (request.jugadoresDefault() != null) deporte.setJugadoresDefault(request.jugadoresDefault());
        if (request.descripcion() != null)      deporte.setDescripcion(request.descripcion());
        return deporteMapper.toResponse(deporteRepository.save(deporte));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void eliminar(Long id) {
        if (!deporteRepository.existsById(id)) {
            throw new NotFoundException("Deporte no encontrado: " + id);
        }
        deporteRepository.deleteById(id);
    }

    private Deporte findById(Long id) {
        return deporteRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Deporte no encontrado: " + id));
    }
}
