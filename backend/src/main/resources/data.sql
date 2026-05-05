INSERT INTO deportes (id, created_at, updated_at, nombre, descripcion, maximo_equipos_por_grupo, numero_jugadores)
VALUES
    (1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'FUTBOL', 'Torneo de futbol escolar', 4, 11),
    (2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'VOLEY', 'Torneo de voley escolar', 4, 6),
    (3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'BASQUET', 'Torneo de basquet escolar', 4, 5),
    (4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'PING_PONG', 'Torneo de ping pong escolar', 4, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO modulos (id, nombre, ruta, icono)
VALUES
    (1, 'Usuarios', '/usuarios', 'users'),
    (2, 'Roles', '/roles', 'shield'),
    (3, 'Modulos', '/modulos', 'layout-grid'),
    (4, 'Instituciones', '/instituciones', 'building-2'),
    (5, 'Deportes', '/deportes', 'trophy'),
    (6, 'Equipos', '/equipos', 'users-round'),
    (7, 'Inscripciones', '/inscripciones', 'clipboard-check'),
    (8, 'Sorteos', '/sorteos', 'shuffle'),
    (9, 'Programaciones', '/programaciones', 'calendar-days'),
    (10, 'Resultados', '/resultados', 'medal'),
    (11, 'Estadisticas', '/estadisticas', 'bar-chart-3')
ON CONFLICT (id) DO NOTHING;

INSERT INTO roles (id, nombre, estado)
VALUES
    (1, 'administrador', 'ACTIVO'),
    (2, 'coordinador', 'ACTIVO'),
    (3, 'consulta', 'ACTIVO')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO rol_modulos (rol_id, modulo_id)
VALUES
    (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10), (1, 11),
    (2, 4), (2, 5), (2, 6), (2, 7), (2, 8), (2, 9), (2, 10), (2, 11),
    (3, 9), (3, 10), (3, 11)
ON CONFLICT DO NOTHING;

ALTER TABLE usuarios DROP COLUMN IF EXISTS enabled;

INSERT INTO usuarios (id, nombre, email, password, rol_id, estado, eliminado)
VALUES
    (1, 'Administrador Olimpiadas', 'admin@olimpiadasperu.pe', '$2a$10$Q8bQHBJ8oJHKEQ8pBovOQOQRVcPFaVf8jcdCCMDQ0iRUHyPcSdUsq', 1, 'ACTIVO', false),
    (2, 'Coordinador Demo', 'coordinador@olimpiadasperu.pe', '$2a$10$Q8bQHBJ8oJHKEQ8pBovOQOQRVcPFaVf8jcdCCMDQ0iRUHyPcSdUsq', 2, 'ACTIVO', false),
    (3, 'Usuario Consulta', 'consulta@olimpiadasperu.pe', '$2a$10$Q8bQHBJ8oJHKEQ8pBovOQOQRVcPFaVf8jcdCCMDQ0iRUHyPcSdUsq', 3, 'ACTIVO', false)
ON CONFLICT (email) DO NOTHING;

INSERT INTO instituciones (id, created_at, updated_at, nombre, codigo_modular, region, ciudad, direccion, telefono, email)
VALUES
    (1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'IE Jose Maria Arguedas', 'IE-0001', 'Lima', 'Lima', 'Av. Los Proceres 123', '999111222', 'contacto@arguedas.edu.pe'),
    (2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Colegio Peru Campeon', 'IE-0002', 'Arequipa', 'Arequipa', 'Calle Melgar 456', '999333444', 'info@perucampeon.edu.pe')
ON CONFLICT (id) DO NOTHING;

INSERT INTO equipos (id, created_at, updated_at, nombre, categoria, genero, entrenador, institucion_id)
VALUES
    (1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Arguedas FC', 'SUB_17', 'MASCULINO', 'Carlos Perez', 1),
    (2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Campeon Voley', 'SUB_15', 'FEMENINO', 'Maria Rojas', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO inscripciones (id, created_at, updated_at, equipo_id, deporte_id, estado, fecha_inscripcion)
VALUES
    (1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 1, 'CONFIRMADA', CURRENT_DATE),
    (2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2, 2, 'CONFIRMADA', CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('deportes', 'id'), COALESCE((SELECT MAX(id) FROM deportes), 1), true);
SELECT setval(pg_get_serial_sequence('modulos', 'id'), COALESCE((SELECT MAX(id) FROM modulos), 1), true);
SELECT setval(pg_get_serial_sequence('roles', 'id'), COALESCE((SELECT MAX(id) FROM roles), 1), true);
SELECT setval(pg_get_serial_sequence('usuarios', 'id'), COALESCE((SELECT MAX(id) FROM usuarios), 1), true);
SELECT setval(pg_get_serial_sequence('instituciones', 'id'), COALESCE((SELECT MAX(id) FROM instituciones), 1), true);
SELECT setval(pg_get_serial_sequence('equipos', 'id'), COALESCE((SELECT MAX(id) FROM equipos), 1), true);
SELECT setval(pg_get_serial_sequence('inscripciones', 'id'), COALESCE((SELECT MAX(id) FROM inscripciones), 1), true);
