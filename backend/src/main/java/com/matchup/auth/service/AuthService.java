package com.matchup.auth.service;

import com.matchup.auth.dto.*;
import com.matchup.auth.entity.PasswordResetToken;
import com.matchup.auth.entity.RefreshToken;
import com.matchup.auth.repository.PasswordResetTokenRepository;
import com.matchup.auth.repository.RefreshTokenRepository;
import com.matchup.common.exception.ConflictException;
import com.matchup.common.exception.InvalidTokenException;
import com.matchup.common.exception.NotFoundException;
import com.matchup.security.JwtService;
import com.matchup.user.entity.RolUsuario;
import com.matchup.user.entity.Usuario;
import com.matchup.user.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("El email ya está registrado: " + request.getEmail());
        }
        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .rol(RolUsuario.USER)
                .build();
        usuarioRepository.save(usuario);

        return buildAuthResponse(usuario);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        return buildAuthResponse(usuario);
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken stored = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new InvalidTokenException("Refresh token no válido"));

        if (stored.getRevoked() || stored.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Refresh token expirado o revocado");
        }

        // Rotar: revocar el antiguo y emitir uno nuevo
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        return buildAuthResponse(stored.getUsuario());
    }

    @Transactional
    public void logout(LogoutRequest request) {
        refreshTokenRepository.findByToken(request.getRefreshToken()).ifPresent(rt -> {
            rt.setRevoked(true);
            refreshTokenRepository.save(rt);
        });
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        // Silencioso si el email no existe (evita user enumeration)
        usuarioRepository.findByEmail(request.getEmail()).ifPresent(usuario -> {
            String tokenValue = UUID.randomUUID().toString();
            PasswordResetToken prt = PasswordResetToken.builder()
                    .token(tokenValue)
                    .usuario(usuario)
                    .expiryDate(LocalDateTime.now().plusHours(1))
                    .build();
            passwordResetTokenRepository.save(prt);
            // TODO: reemplazar por envío real de email cuando se configure Spring Mail
            log.info("[DEV] Password reset token para {}: {}", request.getEmail(), tokenValue);
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken prt = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new InvalidTokenException("Token de reset no válido"));

        if (prt.getUsed() || prt.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Token de reset expirado o ya utilizado");
        }

        Usuario usuario = prt.getUsuario();
        usuario.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        usuarioRepository.save(usuario);

        prt.setUsed(true);
        passwordResetTokenRepository.save(prt);
    }

    // ── helpers ──

    private AuthResponse buildAuthResponse(Usuario usuario) {
        UserDetails userDetails = toUserDetails(usuario);
        String accessToken = jwtService.generateAccessToken(userDetails);
        String refreshToken = issueRefreshToken(usuario);
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    private String issueRefreshToken(Usuario usuario) {
        String tokenValue = UUID.randomUUID().toString();
        RefreshToken rt = RefreshToken.builder()
                .token(tokenValue)
                .usuario(usuario)
                .expiryDate(LocalDateTime.now().plus(refreshExpirationMs, ChronoUnit.MILLIS))
                .build();
        refreshTokenRepository.save(rt);
        return tokenValue;
    }

    private UserDetails toUserDetails(Usuario usuario) {
        return User.builder()
                .username(usuario.getEmail())
                .password(usuario.getPasswordHash())
                .roles(usuario.getRol().name())
                .build();
    }
}
