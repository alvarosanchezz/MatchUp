package com.matchup.meetup.service;

import com.matchup.common.exception.BusinessException;
import com.matchup.meetup.dto.QuedadaPatchRequest;
import com.matchup.meetup.dto.QuedadaRequest;
import com.matchup.meetup.entity.EstadoQuedada;
import com.matchup.meetup.entity.Quedada;
import com.matchup.meetup.mapper.QuedadaMapper;
import com.matchup.meetup.repository.QuedadaRepository;
import com.matchup.sport.repository.DeporteRepository;
import com.matchup.user.entity.Usuario;
import com.matchup.user.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QuedadaServiceTest {

    @Mock private QuedadaRepository quedadaRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private DeporteRepository deporteRepository;
    @Mock private QuedadaMapper quedadaMapper;

    @InjectMocks private QuedadaService quedadaService;

    @Test
    void crear_fechaFinAntesDeFechaInicio_lanzaBusinessException() {
        LocalDateTime inicio = LocalDateTime.now().plusDays(1);
        LocalDateTime fin    = inicio.minusHours(1);          // fin < inicio

        QuedadaRequest req = new QuedadaRequest(
                1L, inicio, fin, "Cancha", 40.4, -3.7, 10, true, null);

        assertThatThrownBy(() -> quedadaService.crear("ana@test.com", req))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("fecha de fin");
    }

    @Test
    void editar_porNoOrganizador_lanzaAccessDeniedException() {
        Usuario organizador = Usuario.builder()
                .id(1L).email("organizador@test.com").build();

        Quedada quedada = Quedada.builder()
                .id(1L)
                .organizador(organizador)
                .estado(EstadoQuedada.ABIERTA)
                .fechaHoraInicio(LocalDateTime.now().plusDays(1))
                .fechaHoraFin(LocalDateTime.now().plusDays(1).plusHours(2))
                .build();

        when(quedadaRepository.findById(1L)).thenReturn(Optional.of(quedada));

        QuedadaPatchRequest patch = new QuedadaPatchRequest(
                null, null, null, null, null, null, null, null);

        assertThatThrownBy(() -> quedadaService.editar(1L, "otro@test.com", patch))
                .isInstanceOf(AccessDeniedException.class);
    }
}
