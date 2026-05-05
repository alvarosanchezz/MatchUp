-- =============================================================
-- V1__init_schema.sql
-- Esquema inicial de MatchUp
-- Stack: PostgreSQL 16 · Flyway 10
-- =============================================================

-- ─────────────────────────────────────────────
-- TIPOS ENUM
-- ─────────────────────────────────────────────
CREATE TYPE rol_usuario        AS ENUM ('USER', 'ADMIN');
CREATE TYPE estado_quedada     AS ENUM ('ABIERTA', 'COMPLETA', 'FINALIZADA', 'CANCELADA');
CREATE TYPE estado_asistencia  AS ENUM ('CONFIRMADO', 'PENDIENTE', 'RETIRADO', 'AUSENTE');

-- ─────────────────────────────────────────────
-- USUARIO
-- ─────────────────────────────────────────────
CREATE TABLE usuario (
    id                  BIGSERIAL       PRIMARY KEY,
    nombre              VARCHAR(100)    NOT NULL,
    email               VARCHAR(255)    NOT NULL,
    password_hash       VARCHAR(255)    NOT NULL,
    ubicacion_latitud   DOUBLE PRECISION,
    ubicacion_longitud  DOUBLE PRECISION,
    fiabilidad_score    DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    fecha_registro      DATE            NOT NULL DEFAULT CURRENT_DATE,
    url_foto_perfil     TEXT,
    rol                 rol_usuario     NOT NULL DEFAULT 'USER',
    esta_baneado        BOOLEAN         NOT NULL DEFAULT FALSE,

    CONSTRAINT uq_usuario_email UNIQUE (email)
);

CREATE INDEX idx_usuario_email ON usuario (email);

-- ─────────────────────────────────────────────
-- DEPORTE
-- ─────────────────────────────────────────────
CREATE TABLE deporte (
    id                  BIGSERIAL       PRIMARY KEY,
    nombre              VARCHAR(100)    NOT NULL,
    jugadores_default   INTEGER,
    descripcion         TEXT,

    CONSTRAINT uq_deporte_nombre UNIQUE (nombre)
);

-- ─────────────────────────────────────────────
-- QUEDADA
-- ─────────────────────────────────────────────
CREATE TABLE quedada (
    id                      BIGSERIAL       PRIMARY KEY,
    id_organizador          BIGINT          NOT NULL,
    id_deporte              BIGINT          NOT NULL,
    fecha_hora_inicio       TIMESTAMP       NOT NULL,
    fecha_hora_fin          TIMESTAMP       NOT NULL,
    ubicacion_nombre        VARCHAR(255)    NOT NULL,
    ubicacion_latitud       DOUBLE PRECISION NOT NULL,
    ubicacion_longitud      DOUBLE PRECISION NOT NULL,
    num_jugadores_total     INTEGER         NOT NULL,
    es_publica              BOOLEAN         NOT NULL DEFAULT TRUE,
    descripcion             TEXT,
    estado                  estado_quedada  NOT NULL DEFAULT 'ABIERTA',

    CONSTRAINT fk_quedada_organizador FOREIGN KEY (id_organizador) REFERENCES usuario (id),
    CONSTRAINT fk_quedada_deporte     FOREIGN KEY (id_deporte)     REFERENCES deporte (id),
    CONSTRAINT chk_quedada_fechas     CHECK (fecha_hora_fin > fecha_hora_inicio),
    CONSTRAINT chk_quedada_capacidad  CHECK (num_jugadores_total >= 2)
);

CREATE INDEX idx_quedada_id_deporte       ON quedada (id_deporte);
CREATE INDEX idx_quedada_id_organizador   ON quedada (id_organizador);
CREATE INDEX idx_quedada_fecha_inicio     ON quedada (fecha_hora_inicio);
CREATE INDEX idx_quedada_estado           ON quedada (estado);
CREATE INDEX idx_quedada_ubicacion_lat    ON quedada (ubicacion_latitud);
CREATE INDEX idx_quedada_ubicacion_lon    ON quedada (ubicacion_longitud);

-- ─────────────────────────────────────────────
-- USUARIO_DEPORTE
-- ─────────────────────────────────────────────
CREATE TABLE usuario_deporte (
    id_usuario          BIGINT          NOT NULL,
    id_deporte          BIGINT          NOT NULL,
    nivel_autoevaluado  INTEGER         NOT NULL,
    rol_preferido       VARCHAR(100),

    CONSTRAINT pk_usuario_deporte   PRIMARY KEY (id_usuario, id_deporte),
    CONSTRAINT fk_ud_usuario        FOREIGN KEY (id_usuario) REFERENCES usuario (id) ON DELETE CASCADE,
    CONSTRAINT fk_ud_deporte        FOREIGN KEY (id_deporte) REFERENCES deporte (id) ON DELETE CASCADE,
    CONSTRAINT chk_ud_nivel         CHECK (nivel_autoevaluado BETWEEN 1 AND 5)
);

CREATE INDEX idx_usuario_deporte_deporte ON usuario_deporte (id_deporte);

-- ─────────────────────────────────────────────
-- USUARIO_QUEDADA
-- ─────────────────────────────────────────────
CREATE TABLE usuario_quedada (
    id_usuario          BIGINT          NOT NULL,
    id_quedada          BIGINT          NOT NULL,
    estado_asistencia   estado_asistencia NOT NULL DEFAULT 'PENDIENTE',
    fecha_confirmacion  TIMESTAMP,

    CONSTRAINT pk_usuario_quedada   PRIMARY KEY (id_usuario, id_quedada),
    CONSTRAINT fk_uq_usuario        FOREIGN KEY (id_usuario) REFERENCES usuario  (id) ON DELETE CASCADE,
    CONSTRAINT fk_uq_quedada        FOREIGN KEY (id_quedada) REFERENCES quedada  (id) ON DELETE CASCADE
);

CREATE INDEX idx_usuario_quedada_quedada ON usuario_quedada (id_quedada);

-- ─────────────────────────────────────────────
-- RATING
-- ─────────────────────────────────────────────
CREATE TABLE rating (
    id                  BIGSERIAL       PRIMARY KEY,
    id_quedada          BIGINT          NOT NULL,
    id_valorador        BIGINT          NOT NULL,
    id_valorado         BIGINT          NOT NULL,
    nivel_nota          INTEGER         NOT NULL,
    deportividad_nota   INTEGER         NOT NULL,
    fecha_creacion      TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_rating_quedada        FOREIGN KEY (id_quedada)    REFERENCES quedada (id),
    CONSTRAINT fk_rating_valorador      FOREIGN KEY (id_valorador)  REFERENCES usuario (id),
    CONSTRAINT fk_rating_valorado       FOREIGN KEY (id_valorado)   REFERENCES usuario (id),
    CONSTRAINT chk_rating_no_self       CHECK (id_valorador <> id_valorado),
    CONSTRAINT chk_rating_nivel         CHECK (nivel_nota        BETWEEN 1 AND 5),
    CONSTRAINT chk_rating_deportividad  CHECK (deportividad_nota  BETWEEN 1 AND 5),
    CONSTRAINT uq_rating_por_quedada    UNIQUE (id_quedada, id_valorador, id_valorado)
);

CREATE INDEX idx_rating_valorado  ON rating (id_valorado);
CREATE INDEX idx_rating_quedada   ON rating (id_quedada);

-- ─────────────────────────────────────────────
-- COMENTARIO
-- ─────────────────────────────────────────────
CREATE TABLE comentario (
    id              BIGSERIAL   PRIMARY KEY,
    id_quedada      BIGINT      NOT NULL,
    id_usuario      BIGINT      NOT NULL,
    contenido       TEXT        NOT NULL,
    fecha_creacion  TIMESTAMP   NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_comentario_quedada FOREIGN KEY (id_quedada) REFERENCES quedada (id) ON DELETE CASCADE,
    CONSTRAINT fk_comentario_usuario FOREIGN KEY (id_usuario) REFERENCES usuario (id)
);

CREATE INDEX idx_comentario_quedada ON comentario (id_quedada);
CREATE INDEX idx_comentario_fecha   ON comentario (fecha_creacion);
