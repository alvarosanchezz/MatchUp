package com.matchup.auth.service;

import com.matchup.auth.dto.AuthResponse;
import com.matchup.auth.dto.LoginRequest;
import com.matchup.auth.dto.RegisterRequest;
import com.matchup.auth.entity.RefreshToken;
import com.matchup.auth.repository.PasswordResetTokenRepository;
import com.matchup.auth.repository.RefreshTokenRepository;
import com.matchup.common.exception.ConflictException;
import com.matchup.security.JwtService;
import com.matchup.user.entity.RolUsuario;
import com.matchup.user.entity.Usuario;
import com.matchup.user.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UsuarioRepository usuarioRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock private JwtService jwtService;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;

    @InjectMocks private AuthService authService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "refreshExpirationMs", 604800000L);
    }

    @Test
    void register_emailDuplicado_lanzaConflictException() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("ana@test.com");
        req.setNombre("Ana");
        req.setPassword("password1");

        when(usuarioRepository.existsByEmail("ana@test.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("ana@test.com");
    }

    @Test
    void login_credencialesValidas_devuelveTokens() {
        LoginRequest req = new LoginRequest();
        req.setEmail("ana@test.com");
        req.setPassword("password1");

        Usuario usuario = Usuario.builder()
                .id(1L)
                .email("ana@test.com")
                .nombre("Ana")
                .passwordHash("hashed")
                .rol(RolUsuario.USER)
                .build();

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(null);
        when(usuarioRepository.findByEmail("ana@test.com")).thenReturn(Optional.of(usuario));
        when(jwtService.generateAccessToken(any())).thenReturn("access-token");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        AuthResponse response = authService.login(req);

        assertThat(response.getAccessToken()).isEqualTo("access-token");
        assertThat(response.getRefreshToken()).isNotBlank();
    }
}
