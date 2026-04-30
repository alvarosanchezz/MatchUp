package com.matchup.comment.service;

import com.matchup.comment.dto.ComentarioRequest;
import com.matchup.comment.repository.ComentarioRepository;
import com.matchup.common.exception.BusinessException;
import com.matchup.meetup.entity.Quedada;
import com.matchup.meetup.service.QuedadaService;
import com.matchup.participation.repository.ParticipacionRepository;
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
class ComentarioServiceTest {

    @Mock private ComentarioRepository comentarioRepository;
    @Mock private ParticipacionRepository participacionRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private QuedadaService quedadaService;

    @InjectMocks private ComentarioService comentarioService;

    @Test
    void crear_sinSerParticipanteNiOrganizador_lanzaBusinessException() {
        Usuario organizador = Usuario.builder().id(1L).email("ana@test.com").build();
        Usuario carlos      = Usuario.builder().id(2L).email("carlos@test.com").build();

        Quedada quedada = Quedada.builder()
                .id(1L)
                .organizador(organizador)
                .build();

        when(quedadaService.findById(1L)).thenReturn(quedada);
        when(usuarioRepository.findByEmail("carlos@test.com")).thenReturn(Optional.of(carlos));
        when(participacionRepository.findByQuedadaIdAndUsuarioId(1L, 2L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> comentarioService.crear(1L, "carlos@test.com",
                new ComentarioRequest("Hola")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("participante");
    }

    @Test
    void crear_comoOrganizador_exitoso() {
        Usuario organizador = Usuario.builder().id(1L).email("ana@test.com").nombre("Ana").build();

        Quedada quedada = Quedada.builder()
                .id(1L)
                .organizador(organizador)
                .build();

        com.matchup.comment.entity.Comentario comentarioGuardado =
                com.matchup.comment.entity.Comentario.builder()
                        .id(1L)
                        .quedada(quedada)
                        .usuario(organizador)
                        .contenido("Nos vemos mañana")
                        .build();

        when(quedadaService.findById(1L)).thenReturn(quedada);
        when(usuarioRepository.findByEmail("ana@test.com")).thenReturn(Optional.of(organizador));
        when(comentarioRepository.save(org.mockito.ArgumentMatchers.any()))
                .thenReturn(comentarioGuardado);

        var response = comentarioService.crear(1L, "ana@test.com",
                new ComentarioRequest("Nos vemos mañana"));

        org.assertj.core.api.Assertions.assertThat(response.contenido()).isEqualTo("Nos vemos mañana");
    }
}
