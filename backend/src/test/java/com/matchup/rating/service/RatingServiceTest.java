package com.matchup.rating.service;

import com.matchup.common.exception.BusinessException;
import com.matchup.common.exception.ConflictException;
import com.matchup.meetup.entity.EstadoQuedada;
import com.matchup.meetup.entity.Quedada;
import com.matchup.meetup.service.QuedadaService;
import com.matchup.participation.entity.EstadoAsistencia;
import com.matchup.participation.entity.UsuarioQuedada;
import com.matchup.participation.entity.UsuarioQuedadaId;
import com.matchup.participation.repository.ParticipacionRepository;
import com.matchup.rating.dto.RatingRequest;
import com.matchup.rating.repository.RatingRepository;
import com.matchup.user.entity.Usuario;
import com.matchup.user.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RatingServiceTest {

    @Mock private RatingRepository ratingRepository;
    @Mock private ParticipacionRepository participacionRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private QuedadaService quedadaService;

    @InjectMocks private RatingService ratingService;

    @Test
    void crear_quedadaNoFinalizada_lanzaBusinessException() {
        Quedada quedada = Quedada.builder()
                .id(1L)
                .estado(EstadoQuedada.ABIERTA)
                .build();

        when(quedadaService.findById(1L)).thenReturn(quedada);

        RatingRequest req = new RatingRequest(2L, 4, 5);

        assertThatThrownBy(() -> ratingService.crear(1L, "ana@test.com", req))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("FINALIZADA");
    }

    @Test
    void crear_ratingDuplicado_lanzaConflictException() {
        Usuario organizador = Usuario.builder().id(1L).email("ana@test.com").build();
        Usuario valorado    = Usuario.builder().id(2L).email("carlos@test.com").build();

        Quedada quedada = Quedada.builder()
                .id(1L)
                .organizador(organizador)
                .estado(EstadoQuedada.FINALIZADA)
                .build();

        UsuarioQuedada participacion = UsuarioQuedada.builder()
                .id(new UsuarioQuedadaId(2L, 1L))
                .usuario(valorado)
                .quedada(quedada)
                .estadoAsistencia(EstadoAsistencia.CONFIRMADO)
                .build();

        when(quedadaService.findById(1L)).thenReturn(quedada);
        when(usuarioRepository.findByEmail("ana@test.com")).thenReturn(Optional.of(organizador));
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(valorado));
        // requireParticipanteOOrganizador llama al repo incluso para el organizador
        when(participacionRepository.findByQuedadaIdAndUsuarioId(1L, 1L))
                .thenReturn(Optional.empty());
        // valorado es participante confirmado
        when(participacionRepository.findByQuedadaIdAndUsuarioId(1L, 2L))
                .thenReturn(Optional.of(participacion));
        // rating duplicado
        when(ratingRepository.existsByQuedadaIdAndValorador_IdAndValorado_Id(1L, 1L, 2L))
                .thenReturn(true);

        RatingRequest req = new RatingRequest(2L, 4, 5);

        assertThatThrownBy(() -> ratingService.crear(1L, "ana@test.com", req))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Ya has valorado");
    }
}
