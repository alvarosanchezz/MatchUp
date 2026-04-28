-- =============================================================
-- 02_grant_permissions.sql
-- PASO 2: Conceder permisos a matchup_user sobre el esquema public.
-- IMPORTANTE: Ejecutar conectado a "matchup_db" como "postgres".
-- =============================================================

GRANT USAGE  ON SCHEMA public TO matchup_user;
GRANT CREATE ON SCHEMA public TO matchup_user;

GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO matchup_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO matchup_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON TABLES    TO matchup_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON SEQUENCES TO matchup_user;

-- Verificación: la siguiente consulta debe devolver matchup_user con permisos
-- SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE grantee = 'matchup_user';
