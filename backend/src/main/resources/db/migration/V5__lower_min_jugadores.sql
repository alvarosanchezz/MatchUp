-- Reduce the minimum players constraint from 2 to 1.
-- The organizer is not counted as a participant, so a 1v1 activity (e.g. tennis)
-- only needs 1 slot for the opponent.
ALTER TABLE quedada DROP CONSTRAINT chk_quedada_capacidad;
ALTER TABLE quedada ADD CONSTRAINT chk_quedada_capacidad CHECK (num_jugadores_total >= 1);
