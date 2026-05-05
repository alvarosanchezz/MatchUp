-- =============================================================
-- V4__add_auth_tokens.sql
-- Tablas para refresh tokens y password-reset tokens
-- =============================================================

-- ─────────────────────────────────────────────
-- REFRESH TOKEN
-- ─────────────────────────────────────────────
CREATE TABLE refresh_token (
    id          BIGSERIAL       PRIMARY KEY,
    token       VARCHAR(512)    NOT NULL,
    id_usuario  BIGINT          NOT NULL,
    expiry_date TIMESTAMP       NOT NULL,
    revoked     BOOLEAN         NOT NULL DEFAULT FALSE,

    CONSTRAINT uq_refresh_token         UNIQUE (token),
    CONSTRAINT fk_rt_usuario            FOREIGN KEY (id_usuario) REFERENCES usuario (id) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_token_usuario ON refresh_token (id_usuario);

-- ─────────────────────────────────────────────
-- PASSWORD RESET TOKEN
-- ─────────────────────────────────────────────
CREATE TABLE password_reset_token (
    id          BIGSERIAL       PRIMARY KEY,
    token       VARCHAR(512)    NOT NULL,
    id_usuario  BIGINT          NOT NULL,
    expiry_date TIMESTAMP       NOT NULL,
    used        BOOLEAN         NOT NULL DEFAULT FALSE,

    CONSTRAINT uq_prt                   UNIQUE (token),
    CONSTRAINT fk_prt_usuario           FOREIGN KEY (id_usuario) REFERENCES usuario (id) ON DELETE CASCADE
);

CREATE INDEX idx_prt_usuario ON password_reset_token (id_usuario);
