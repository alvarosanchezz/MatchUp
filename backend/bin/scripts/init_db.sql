-- =============================================================
-- init_db.sql
-- Ejecutar UNA SOLA VEZ como superusuario de PostgreSQL:
--   psql -U postgres -f init_db.sql
--
-- Crea: usuario matchup_user, base de datos matchup_db y permisos.
-- Las tablas las crea Flyway en el arranque de Spring Boot (C3).
-- =============================================================

-- Usuario de aplicación
CREATE USER matchup_user WITH
    LOGIN
    PASSWORD 'matchup_pass'
    NOSUPERUSER
    NOCREATEDB
    NOCREATEROLE;

-- Base de datos
CREATE DATABASE matchup_db
    WITH
    OWNER       = matchup_user
    ENCODING    = 'UTF8'
    LC_COLLATE  = 'es_ES.UTF-8'
    LC_CTYPE    = 'es_ES.UTF-8'
    TEMPLATE    = template0;

-- Conexión a la BD para asignar permisos finos
\connect matchup_db

-- Permisos sobre el esquema public
GRANT USAGE  ON SCHEMA public TO matchup_user;
GRANT CREATE ON SCHEMA public TO matchup_user;

-- Permisos sobre objetos existentes y futuros (Flyway los creará en el arranque)
GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO matchup_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO matchup_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON TABLES    TO matchup_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON SEQUENCES TO matchup_user;
