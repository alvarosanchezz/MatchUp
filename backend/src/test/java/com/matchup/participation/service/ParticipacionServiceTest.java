package com.matchup.participation.service;

import com.matchup.common.exception.BusinessException;
import com.matchup.meetup.entity.EstadoQuedada;
import com.matchup.meetup.entity.Quedada;
import com.matchup.meetup.repository.QuedadaRepository;
import com.matchup.meetup.service.QuedadaService;
import com.matchup.participation.entity.EstadoAsistencia;
import com.matchup.participation.repository.ParticipacionRepository;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ParticipacionServiceTest {

    @Mock private ParticipacionRepository participacionRepository;
    @Mock private QuedadaRepository quedadaRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private QuedadaService quedadaService;

    @InjectMocks private ParticipacionService participacionService;

    @Test
    void join_quedadaNoAbierta_lanzaBusinessException() {
        Usuario usuario = Usuario.builder().id(2L).email("carlos@test.com").build();
        Usuario organizador = Usuario.builder().id(1L).email("ana@test.com").build();

        Quedada quedada = Quedada.builder()
                .id(1L)
                .organizador(organizador)
                .estado(EstadoQuedada.COMPLETA)
                .numJugadoresTotal(10)
                .fechaHoraInicio(LocalDateTime.now().plusDays(1))
                .build();

        when(usuarioRepository.findByEmail("carlos@test.com")).thenReturn(Optional.of(usuario));
        when(quedadaService.findById(1L)).thenReturn(quedada);

        assertThatThrownBy(() -> participacionService.join(1L, "carlos@test.com"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("ABIERTA");
    }

    @Test
    void confirmar_sinSerOrganizador_lanzaAccessDeniedException() {
        Usuario organizador = Usuario.builder().id(1L).email("ana@test.com").build();

        Quedada quedada = Quedada.builder()
                .id(1L)
                .organizador(organizador)
                .estado(EstadoQuedada.FINALIZADA)
                .build();

        when(quedadaService.findById(1L)).thenReturn(quedada);

        assertThatThrownBy(() -> participacionService.confirmar(1L, 2L, "carlos@test.com"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void recalcularFiabilidad_daElPorcentajeCorrecto() {
        Usuario usuario = Usuario.builder().id(2L).fiabilidadScore(100.0).build();

        when(participacionRepository.countByUsuarioIdAndEstado(2L, EstadoAsistencia.CONFIRMADO))
                .thenReturn(3L);
        when(participacionRepository.countByUsuarioIdAndEstado(2L, EstadoAsistencia.AUSENTE))
                .thenReturn(1L);
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        participacionService.recalcularFiabilidad(usuario);

        assertThat(usuario.getFiabilidadScore()).isEqualTo(75.0);
        verify(usuarioRepository).save(usuario);
    }
}
