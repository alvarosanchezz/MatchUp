-- =============================================================
-- 01_create_db.sql
-- PASO 1: Crear el usuario y la base de datos.
-- Ejecutar conectado a la base de datos "postgres" (la por defecto)
-- como superusuario "postgres".
-- =============================================================

-- Usuario de aplicación
CREATE USER matchup_user WITH
    LOGIN
    PASSWORD 'matchup_pass'
    NOSUPERUSER
    NOCREATEDB
    NOCREATEROLE;

-- Base de datos (sin locales españoles que en Windows dan problemas)
CREATE DATABASE matchup_db
    WITH
    OWNER    = matchup_user
    ENCODING = 'UTF8'
    TEMPLATE = template0;
