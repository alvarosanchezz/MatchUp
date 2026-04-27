-- =============================================================
-- V2__seed_deportes.sql
-- Catálogo inicial de 20 deportes
-- =============================================================

INSERT INTO deporte (nombre, jugadores_default, descripcion) VALUES
    ('Fútbol 7',        7,   'Fútbol en campo reducido, 7 jugadores por equipo.'),
    ('Fútbol 11',       11,  'Fútbol reglamentario en campo grande, 11 jugadores por equipo.'),
    ('Fútbol Sala',     5,   'Fútbol indoor en pista cubierta, 5 jugadores por equipo.'),
    ('Baloncesto',      5,   'Baloncesto reglamentario 5vs5 en pista.'),
    ('3x3 Baloncesto',  3,   'Baloncesto en media pista, 3 jugadores por equipo.'),
    ('Pádel',           2,   'Pádel en pista cerrada, pareja contra pareja.'),
    ('Tenis',           1,   'Tenis individual o dobles en pista.'),
    ('Tenis Dobles',    2,   'Tenis en modalidad de dobles.'),
    ('Vóley Playa',     2,   'Vóleibol playa, 2 jugadores por equipo.'),
    ('Vóleibol',        6,   'Vóleibol indoor reglamentario, 6 jugadores por equipo.'),
    ('Balonmano',       7,   'Balonmano reglamentario, 7 jugadores por equipo.'),
    ('Rugby',           15,  'Rugby union reglamentario, 15 jugadores por equipo.'),
    ('Ciclismo',        1,   'Salidas en grupo o individuales en bicicleta de carretera o montaña.'),
    ('Running',         1,   'Carreras populares o entrenamiento en grupo.'),
    ('Senderismo',      1,   'Rutas de senderismo y montaña en grupo.'),
    ('Natación',        1,   'Entrenos y competiciones en piscina o aguas abiertas.'),
    ('Tenis de Mesa',   1,   'Ping-pong individual o por parejas.'),
    ('Badminton',       1,   'Badminton individual o dobles en pista cubierta.'),
    ('Escalada',        1,   'Escalada en rocódromo o pared natural en grupo.'),
    ('Ultimate Frisbee',7,   'Disco volador en campo, 7 jugadores por equipo.');
