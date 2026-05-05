-- =============================================================
-- V3__seed_test_users.sql
-- 5 usuarios de prueba con hashes BCrypt (factor 10)
-- Generados con bcryptjs 2.4.3 (compatible con Spring BCryptPasswordEncoder)
--
-- Contraseñas en claro:
--   ana_garcia    -> matchup123
--   carlos_perez  -> carlos456
--   laura_martin  -> laura789
--   admin_matchup -> admin2024   (rol ADMIN)
--   pedro_lopez   -> pedro321
-- =============================================================

INSERT INTO usuario (nombre, email, password_hash, ubicacion_latitud, ubicacion_longitud, fiabilidad_score, fecha_registro, rol, esta_baneado) VALUES
(
    'Ana García',
    'ana.garcia@matchup.test',
    '$2b$10$wLRCIDUuzZshp71gmnUAMeNh9Wq5UQpy57HaSh6liPFrp9qfEp23.',
    40.4168, -3.7038,   -- Madrid
    100.0,
    '2026-01-10',
    'USER',
    FALSE
),
(
    'Carlos Pérez',
    'carlos.perez@matchup.test',
    '$2b$10$VFP3d3TAZ2PWKp0f3CTgpe1Z5kCX/K68dzJpv0CQP9F30lz.kdBsC',
    41.3851, 2.1734,    -- Barcelona
    85.0,
    '2026-01-15',
    'USER',
    FALSE
),
(
    'Laura Martín',
    'laura.martin@matchup.test',
    '$2b$10$8eGPHLYnUYVIVLFHzRYPdelqT5WHBEL6f8wy8QkUkPz89fFHkNAyS',
    37.3891, -5.9845,   -- Sevilla
    92.5,
    '2026-02-01',
    'USER',
    FALSE
),
(
    'Admin MatchUp',
    'admin@matchup.test',
    '$2b$10$wF.oDFKJOVTCHV059BwOce.5v3eB1bHTKgwTEdzAq6n5klTf31QDi',
    40.4168, -3.7038,   -- Madrid
    100.0,
    '2026-01-01',
    'ADMIN',
    FALSE
),
(
    'Pedro López',
    'pedro.lopez@matchup.test',
    '$2b$10$gbBijnONUeIgY0XYjnXIierL89adi8tMDBF0ryjXPMuV3jcHDXCLG',
    39.4699, -0.3763,   -- Valencia
    78.0,
    '2026-02-10',
    'USER',
    FALSE
);

-- Deportes favoritos de los usuarios de prueba
INSERT INTO usuario_deporte (id_usuario, id_deporte, nivel_autoevaluado, rol_preferido) VALUES
    (1, 6,  4, 'Drive'),        -- Ana: Pádel nivel 4
    (1, 7,  3, NULL),           -- Ana: Tenis nivel 3
    (2, 1,  5, 'Delantero'),    -- Carlos: Fútbol 7 nivel 5
    (2, 3,  4, 'Portero'),      -- Carlos: Fútbol Sala nivel 4
    (3, 4,  3, 'Alero'),        -- Laura: Baloncesto nivel 3
    (3, 10, 4, 'Central'),      -- Laura: Vóleibol nivel 4
    (5, 1,  4, 'Centrocampista'), -- Pedro: Fútbol 7 nivel 4
    (5, 6,  2, NULL);           -- Pedro: Pádel nivel 2
