package com.matchup.sport.service;

import com.matchup.common.exception.ConflictException;
import com.matchup.sport.dto.DeporteRequest;
import com.matchup.sport.dto.DeporteResponse;
import com.matchup.sport.entity.Deporte;
import com.matchup.sport.mapper.DeporteMapper;
import com.matchup.sport.repository.DeporteRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DeporteServiceTest {

    @Mock private DeporteRepository deporteRepository;
    @Mock private DeporteMapper deporteMapper;

    @InjectMocks private DeporteService deporteService;

    @Test
    void crear_nombreDuplicado_lanzaConflictException() {
        when(deporteRepository.existsByNombre("Fútbol")).thenReturn(true);

        assertThatThrownBy(() -> deporteService.crear(new DeporteRequest("Fútbol", 11, null)))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Fútbol");
    }

    @Test
    void crear_nombreNuevo_devuelveDeporteResponse() {
        DeporteRequest req = new DeporteRequest("Pádel", 4, "Deporte de raqueta");
        Deporte deporte    = Deporte.builder().id(1L).nombre("Pádel").jugadoresDefault(4).build();
        DeporteResponse expected = new DeporteResponse(1L, "Pádel", 4, "Deporte de raqueta");

        when(deporteRepository.existsByNombre("Pádel")).thenReturn(false);
        when(deporteRepository.save(any(Deporte.class))).thenReturn(deporte);
        when(deporteMapper.toResponse(deporte)).thenReturn(expected);

        DeporteResponse result = deporteService.crear(req);

        assertThat(result.nombre()).isEqualTo("Pádel");
        assertThat(result.id()).isEqualTo(1L);
    }
}
