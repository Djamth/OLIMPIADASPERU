-- Data demo reiniciable para desarrollo y exposiciones.
-- IMPORTANTE: con DEMO_DATA_ENABLED=true este script limpia y vuelve a cargar la data cada vez que inicia el backend.
-- Para conservar registros creados manualmente, usar DEMO_DATA_ENABLED=false en el archivo .env.

TRUNCATE TABLE
    auditoria,
    password_reset_tokens,
    resultado_anotaciones,
    resultados,
    partidos,
    grupo_equipos,
    grupos,
    inscripciones,
    plantillas_equipo,
    participantes,
    equipos,
    categorias_evento,
    eventos,
    usuarios,
    rol_modulo_acciones,
    rol_modulos,
    roles,
    modulos,
    acciones,
    paises,
    instituciones,
    deportes
RESTART IDENTITY CASCADE;

INSERT INTO deportes (id, created_at, updated_at, nombre, descripcion, maximo_equipos_por_grupo, numero_jugadores)
VALUES
    (1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'FUTBOL', 'Fútbol varones: marcador por goles y control de goleadores.', 4, 11),
    (2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'BASQUET', 'Básquet varones: marcador por puntos y control de encestadores.', 4, 5),
    (3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'VOLEY', 'Vóley damas: marcador por sets ganados.', 4, 6),
    (4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'PING_PONG', 'Ping pong mixto: marcador por sets o puntos según reglamento.', 4, 1);

INSERT INTO instituciones (
    id, created_at, updated_at, nombre, codigo_modular, ruc, tipo, nivel_educativo,
    region, ciudad, direccion, telefono, email, administrador_nombre, administrador_email
)
VALUES
    (1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Colegio San José', 'CSJ-2026', '20481234561', 'COLEGIO', 'Secundaria',
     'Lima', 'San Miguel', 'Av. La Marina 1240', '987654321', 'contacto@sanjose.edu.pe',
     'María Fernanda Ríos', 'mrios@sanjose.edu.pe'),
    (2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Colegio Santa Rosa', 'CSR-2026', '20487654321', 'COLEGIO', 'Secundaria',
     'Lima', 'Pueblo Libre', 'Jr. Bolívar 450', '987111222', 'contacto@santarosa.edu.pe',
     'Renato Salazar Vega', 'rsalazar@santarosa.edu.pe'),
    (3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Instituto Miguel Grau', 'IMG-2026', '20511223344', 'COLEGIO', 'Secundaria',
     'Callao', 'Bellavista', 'Av. Guardia Chalaca 780', '987333444', 'contacto@miguelgrau.edu.pe',
     'Claudia Vargas Soto', 'cvargas@miguelgrau.edu.pe');

INSERT INTO paises (
    id, created_at, updated_at, nombre, codigo, bandera, color_primario, color_secundario, dato_cultural, activo
)
VALUES
    (1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Brasil', 'BRA', 'BR', '#FFDF00', '#009C3B', 'Representa alegría, fútbol y trabajo en equipo.', true),
    (2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Japón', 'JPN', 'JP', '#FFFFFF', '#BC002D', 'Representa disciplina, respeto y precisión.', true),
    (3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Italia', 'ITA', 'IT', '#008C45', '#CD212A', 'Representa tradición, estrategia y espíritu competitivo.', true),
    (4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'México', 'MEX', 'MX', '#006847', '#CE1126', 'Representa identidad, energía y comunidad.', true),
    (5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Francia', 'FRA', 'FR', '#0055A4', '#EF4135', 'Representa elegancia, perseverancia y juego limpio.', true),
    (6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Argentina', 'ARG', 'AR', '#74ACDF', '#FFFFFF', 'Representa pasión deportiva y liderazgo.', true),
    (7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Perú', 'PER', 'PE', '#D91023', '#FFFFFF', 'Representa orgullo, historia y unión.', true),
    (8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Canadá', 'CAN', 'CA', '#D80621', '#FFFFFF', 'Representa diversidad, respeto e inclusión.', true);

INSERT INTO eventos (id, created_at, updated_at, nombre, anio, fecha_inicio, fecha_fin, estado, institucion_id)
VALUES
    (1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Olimpiadas Internas San José', 2026, '2026-07-01', '2026-07-31', 'EN_CURSO', 1);

INSERT INTO categorias_evento (id, created_at, updated_at, nombre, nivel, descripcion, evento_id, pais_id)
VALUES
    (1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Primer año', 'Secundaria', 'Categoría base asignada automáticamente a Brasil.', 1, 1),
    (2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Segundo año', 'Secundaria', 'Categoría asignada automáticamente a Japón.', 1, 2),
    (3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Tercer año', 'Secundaria', 'Categoría asignada automáticamente a Italia.', 1, 3),
    (4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Cuarto año', 'Secundaria', 'Categoría asignada automáticamente a México.', 1, 4),
    (5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Quinto año', 'Secundaria', 'Categoría asignada automáticamente a Francia.', 1, 5);

INSERT INTO modulos (id, nombre, ruta, icono)
VALUES
    (1, 'Dashboard', '/dashboard', 'layout-dashboard'),
    (2, 'Instituciones', '/instituciones', 'building-2'),
    (3, 'Países', '/paises', 'flag'),
    (4, 'Eventos', '/eventos', 'calendar-range'),
    (5, 'Deportes', '/deportes', 'trophy'),
    (6, 'Equipos', '/equipos', 'users-round'),
    (7, 'Participantes', '/participantes', 'user-round'),
    (8, 'Inscripciones', '/inscripciones', 'clipboard-check'),
    (9, 'Sorteos', '/sorteos', 'shuffle'),
    (10, 'Programación', '/programacion', 'calendar-days'),
    (11, 'Resultados', '/resultados', 'medal'),
    (12, 'Estadísticas', '/estadisticas', 'bar-chart-3'),
    (13, 'Usuarios', '/usuarios', 'users'),
    (14, 'Perfiles', '/perfiles', 'shield'),
    (15, 'Módulos', '/modulos', 'layout-grid'),
    (16, 'Auditoría', '/auditoria', 'history');

INSERT INTO modulos (id, nombre, ruta, icono)
VALUES
    (17, 'Seguridad', '/seguridad', 'shield-check'),
    (18, 'Gestion deportiva', '/gestion-deportiva', 'trophy'),
    (19, 'Configuracion institucional', '/configuracion-institucional', 'building-2')
ON CONFLICT DO NOTHING;

UPDATE modulos SET modulo_padre_id = 19 WHERE ruta IN ('/instituciones', '/paises', '/eventos');
UPDATE modulos SET modulo_padre_id = 18 WHERE ruta IN ('/deportes', '/equipos', '/participantes', '/inscripciones', '/sorteos', '/programacion', '/resultados', '/estadisticas');
UPDATE modulos SET modulo_padre_id = 17 WHERE ruta IN ('/usuarios', '/perfiles', '/modulos', '/auditoria');

INSERT INTO roles (id, nombre, estado)
VALUES
    (1, 'administrador', 'ACTIVO'),
    (2, 'coordinador', 'ACTIVO'),
    (3, 'consulta', 'ACTIVO');

INSERT INTO acciones (id, codigo, nombre)
VALUES
    (1, 'VER', 'Ver'),
    (2, 'CREAR', 'Crear'),
    (3, 'EDITAR', 'Editar'),
    (4, 'ELIMINAR', 'Eliminar'),
    (5, 'EXPORTAR', 'Exportar')
ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre;

INSERT INTO rol_modulos (rol_id, modulo_id)
SELECT 1, id FROM modulos;

INSERT INTO rol_modulos (rol_id, modulo_id)
SELECT 2, id
FROM modulos
WHERE ruta IN (
    '/dashboard', '/instituciones', '/paises', '/eventos', '/deportes', '/equipos',
    '/participantes', '/inscripciones', '/sorteos', '/programacion', '/resultados', '/estadisticas'
);

INSERT INTO rol_modulos (rol_id, modulo_id)
SELECT 3, id
FROM modulos
WHERE ruta IN ('/dashboard', '/programacion', '/resultados', '/estadisticas');

INSERT INTO rol_modulo_acciones (rol_id, modulo_id, accion_id)
SELECT rm.rol_id, rm.modulo_id, a.id
FROM rol_modulos rm
CROSS JOIN acciones a
WHERE rm.rol_id = 1
ON CONFLICT (rol_id, modulo_id, accion_id) DO NOTHING;

INSERT INTO rol_modulo_acciones (rol_id, modulo_id, accion_id)
SELECT rm.rol_id, rm.modulo_id, a.id
FROM rol_modulos rm
CROSS JOIN acciones a
WHERE rm.rol_id = 2
  AND a.codigo IN ('VER', 'CREAR', 'EDITAR', 'EXPORTAR')
ON CONFLICT (rol_id, modulo_id, accion_id) DO NOTHING;

INSERT INTO rol_modulo_acciones (rol_id, modulo_id, accion_id)
SELECT rm.rol_id, rm.modulo_id, a.id
FROM rol_modulos rm
CROSS JOIN acciones a
WHERE rm.rol_id = 3
  AND a.codigo IN ('VER', 'EXPORTAR')
ON CONFLICT (rol_id, modulo_id, accion_id) DO NOTHING;

INSERT INTO usuarios (id, nombre, email, password, rol_id, institucion_id, estado, eliminado)
VALUES
    (1, 'Administrador Olimpiadas', 'admin@olimpiadasperu.pe',
     '$2a$10$CyuDUG5zjmf/kOTlRGYBouj4GJt0IWx1kFK3T4TMxegCDeR90ie5i', 1, 1, 'ACTIVO', false),
    (2, 'Coordinador San José', 'coordinador@olimpiadasperu.pe',
     '$2a$10$CyuDUG5zjmf/kOTlRGYBouj4GJt0IWx1kFK3T4TMxegCDeR90ie5i', 2, 1, 'ACTIVO', false),
    (3, 'Usuario Consulta', 'consulta@olimpiadasperu.pe',
     '$2a$10$CyuDUG5zjmf/kOTlRGYBouj4GJt0IWx1kFK3T4TMxegCDeR90ie5i', 3, 1, 'ACTIVO', false);

INSERT INTO equipos (
    id, created_at, updated_at, nombre, categoria, genero, entrenador, institucion_id, categoria_evento_id, deporte_id
)
VALUES
    (101, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Brasil Fútbol Varones', 'SUB_17', 'MASCULINO', 'Carlos Medina', 1, 1, 1),
    (102, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Brasil Básquet Varones', 'SUB_17', 'MASCULINO', 'Jorge Huamán', 1, 1, 2),
    (103, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Brasil Vóley Damas', 'SUB_17', 'FEMENINO', 'Patricia León', 1, 1, 3),
    (104, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Brasil Ping Pong Mixto', 'SUB_17', 'MIXTO', 'Daniela Torres', 1, 1, 4),
    (201, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Japón Fútbol Varones', 'SUB_17', 'MASCULINO', 'Miguel Cáceres', 1, 2, 1),
    (202, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Japón Básquet Varones', 'SUB_17', 'MASCULINO', 'Rafael Paredes', 1, 2, 2),
    (203, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Japón Vóley Damas', 'SUB_17', 'FEMENINO', 'Rosa Herrera', 1, 2, 3),
    (204, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Japón Ping Pong Mixto', 'SUB_17', 'MIXTO', 'Marco Peña', 1, 2, 4),
    (301, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Italia Fútbol Varones', 'SUB_17', 'MASCULINO', 'Luis Carranza', 1, 3, 1),
    (302, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Italia Básquet Varones', 'SUB_17', 'MASCULINO', 'Álvaro Núñez', 1, 3, 2),
    (303, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Italia Vóley Damas', 'SUB_17', 'FEMENINO', 'Karla Valdez', 1, 3, 3),
    (304, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Italia Ping Pong Mixto', 'SUB_17', 'MIXTO', 'Fernando Rojas', 1, 3, 4),
    (401, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'México Fútbol Varones', 'SUB_17', 'MASCULINO', 'Esteban Campos', 1, 4, 1),
    (402, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'México Básquet Varones', 'SUB_17', 'MASCULINO', 'Óscar Palacios', 1, 4, 2),
    (403, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'México Vóley Damas', 'SUB_17', 'FEMENINO', 'Mónica Salas', 1, 4, 3),
    (404, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'México Ping Pong Mixto', 'SUB_17', 'MIXTO', 'Bruno Aguilar', 1, 4, 4),
    (501, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Francia Fútbol Varones', 'SUB_17', 'MASCULINO', 'Sebastián Flores', 1, 5, 1),
    (502, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Francia Básquet Varones', 'SUB_17', 'MASCULINO', 'Víctor Ramos', 1, 5, 2),
    (503, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Francia Vóley Damas', 'SUB_17', 'FEMENINO', 'Gabriela Soto', 1, 5, 3),
    (504, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Francia Ping Pong Mixto', 'SUB_17', 'MIXTO', 'Lucía Mendoza', 1, 5, 4);

WITH plantel(equipo_id, cantidad) AS (
    VALUES
        (101, 11), (102, 5), (103, 6), (104, 2),
        (201, 11), (202, 5), (203, 6), (204, 2),
        (301, 11), (302, 5), (303, 6), (304, 2),
        (401, 11), (402, 5), (403, 6), (404, 2),
        (501, 11), (502, 5), (503, 6), (504, 2)
),
nombres_masculinos AS (
    SELECT ARRAY[
        'Mateo','Santiago','Sebastián','Nicolás','Gabriel','Andrés','Diego','Lucas','Joaquín','Emiliano','Rodrigo','Tomás'
    ] AS nombres
),
nombres_femeninos AS (
    SELECT ARRAY[
        'Valentina','Camila','Luciana','Mariana','Isabella','Renata','Sofía','Daniela','Alejandra','Paula','Fernanda','Andrea'
    ] AS nombres
),
apellidos AS (
    SELECT ARRAY[
        'Ramos','Castillo','Vargas','Quispe','Torres','Flores','Herrera','Mendoza','García','Rojas','Salazar','Paredes'
    ] AS apellidos
)
INSERT INTO participantes (
    id, created_at, updated_at, nombres, apellidos, numero_documento, genero, fecha_nacimiento,
    codigo_estudiante, rol_equipo, numero_camiseta, fotografia_url, equipo_id
)
SELECT
    (p.equipo_id * 100 + gs)::bigint AS id,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CASE
        WHEN e.genero = 'FEMENINO' THEN nf.nombres[((gs - 1) % array_length(nf.nombres, 1)) + 1]
        WHEN e.genero = 'MIXTO' AND gs % 2 = 0 THEN nf.nombres[((gs - 1) % array_length(nf.nombres, 1)) + 1]
        ELSE nm.nombres[((gs - 1) % array_length(nm.nombres, 1)) + 1]
    END AS nombres,
    a.apellidos[((p.equipo_id + gs - 1) % array_length(a.apellidos, 1)) + 1] || ' ' ||
        a.apellidos[((p.equipo_id + gs + 2) % array_length(a.apellidos, 1)) + 1] AS apellidos,
    LPAD((70000000 + p.equipo_id * 100 + gs)::text, 8, '0') AS numero_documento,
    CASE
        WHEN e.genero = 'FEMENINO' THEN 'FEMENINO'
        WHEN e.genero = 'MIXTO' AND gs % 2 = 0 THEN 'FEMENINO'
        ELSE 'MASCULINO'
    END AS genero,
    (DATE '2009-01-01' + ((gs + p.equipo_id) % 900)) AS fecha_nacimiento,
    'EST-' || p.equipo_id || '-' || LPAD(gs::text, 2, '0') AS codigo_estudiante,
    CASE WHEN gs = 1 THEN 'CAPITAN' ELSE 'JUGADOR' END AS rol_equipo,
    gs AS numero_camiseta,
    NULL AS fotografia_url,
    p.equipo_id
FROM plantel p
JOIN equipos e ON e.id = p.equipo_id
CROSS JOIN LATERAL generate_series(1, p.cantidad) gs
CROSS JOIN nombres_masculinos nm
CROSS JOIN nombres_femeninos nf
CROSS JOIN apellidos a;

INSERT INTO plantillas_equipo (
    id, created_at, updated_at, participante_id, equipo_id, rol, numero_camiseta
)
SELECT
    participante.id,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    participante.id,
    participante.equipo_id,
    participante.rol_equipo,
    participante.numero_camiseta
FROM participantes participante;

INSERT INTO inscripciones (id, created_at, updated_at, equipo_id, deporte_id, estado, fecha_inscripcion, evento_id)
SELECT
    equipo.id,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    equipo.id,
    equipo.deporte_id,
    'CONFIRMADA',
    DATE '2026-06-10' + ((equipo.id % 7)::int),
    1
FROM equipos equipo;

INSERT INTO grupos (id, created_at, updated_at, nombre, deporte_id, evento_id)
VALUES
    (1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Fútbol Grupo A', 1, 1),
    (2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Fútbol Grupo B', 1, 1),
    (3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Básquet Grupo A', 2, 1),
    (4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Básquet Grupo B', 2, 1),
    (5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Vóley Grupo A', 3, 1),
    (6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Vóley Grupo B', 3, 1),
    (7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Ping Pong Grupo A', 4, 1),
    (8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Ping Pong Grupo B', 4, 1);

INSERT INTO grupo_equipos (id, created_at, updated_at, grupo_id, equipo_id, posicion)
VALUES
    (1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 101, 1),
    (2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 201, 2),
    (3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 301, 3),
    (4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2, 401, 1),
    (5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2, 501, 2),
    (6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 3, 102, 1),
    (7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 3, 202, 2),
    (8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 3, 302, 3),
    (9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4, 402, 1),
    (10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4, 502, 2),
    (11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 5, 103, 1),
    (12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 5, 203, 2),
    (13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 5, 303, 3),
    (14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 6, 403, 1),
    (15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 6, 503, 2),
    (16, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 7, 104, 1),
    (17, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 7, 204, 2),
    (18, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 7, 304, 3),
    (19, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 8, 404, 1),
    (20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 8, 504, 2);

INSERT INTO partidos (
    id, created_at, updated_at, grupo_id, deporte_id, equipo_local_id, equipo_visitante_id, fecha_hora, sede, estado
)
VALUES
    (1001, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 1, 101, 201, TIMESTAMP '2026-07-05 09:00:00', 'Cancha Norte', 'FINALIZADO'),
    (1002, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 1, 301, 101, TIMESTAMP '2026-07-06 10:00:00', 'Cancha Norte', 'FINALIZADO'),
    (1003, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2, 1, 401, 501, TIMESTAMP '2026-07-12 09:30:00', 'Cancha Sur', 'PROGRAMADO'),
    (1004, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 3, 2, 102, 202, TIMESTAMP '2026-07-05 11:00:00', 'Coliseo Principal', 'FINALIZADO'),
    (1005, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 3, 2, 302, 102, TIMESTAMP '2026-07-13 11:00:00', 'Coliseo Principal', 'PROGRAMADO'),
    (1006, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4, 2, 402, 502, TIMESTAMP '2026-07-07 12:00:00', 'Coliseo Auxiliar', 'FINALIZADO'),
    (1007, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 5, 3, 103, 203, TIMESTAMP '2026-07-06 14:00:00', 'Coliseo B', 'FINALIZADO'),
    (1008, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 6, 3, 403, 503, TIMESTAMP '2026-07-14 14:00:00', 'Coliseo B', 'PROGRAMADO'),
    (1009, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 7, 4, 104, 204, TIMESTAMP '2026-07-06 16:00:00', 'Sala de Tenis de Mesa', 'FINALIZADO'),
    (1010, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 8, 4, 404, 504, TIMESTAMP '2026-07-15 16:00:00', 'Sala de Tenis de Mesa', 'PROGRAMADO');

INSERT INTO resultados (id, created_at, updated_at, partido_id, puntaje_local, puntaje_visitante, observaciones)
VALUES
    (1001, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1001, 3, 1, 'Brasil abrió el torneo con alta presión ofensiva.'),
    (1002, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1002, 2, 2, 'Italia y Brasil empataron en un cierre intenso.'),
    (1003, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1004, 54, 47, 'Brasil dominó el rebote y sostuvo la ventaja.'),
    (1004, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1006, 61, 58, 'México ganó por diferencia corta en el último cuarto.'),
    (1005, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1007, 2, 0, 'Brasil Vóley cerró el partido en sets corridos.'),
    (1006, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1009, 3, 1, 'Brasil Ping Pong ganó con buena efectividad.');

INSERT INTO resultado_anotaciones (id, resultado_id, participante_id, cantidad)
VALUES
    (1, 1001, 10101, 2),
    (2, 1001, 10102, 1),
    (3, 1001, 20101, 1),
    (4, 1002, 30101, 1),
    (5, 1002, 30102, 1),
    (6, 1002, 10103, 2),
    (7, 1003, 10201, 20),
    (8, 1003, 10202, 18),
    (9, 1003, 10203, 16),
    (10, 1003, 20201, 19),
    (11, 1003, 20202, 15),
    (12, 1003, 20203, 13),
    (13, 1004, 40201, 24),
    (14, 1004, 40202, 21),
    (15, 1004, 40203, 16),
    (16, 1004, 50201, 23),
    (17, 1004, 50202, 20),
    (18, 1004, 50203, 15),
    (19, 1005, 10301, 2),
    (20, 1006, 10401, 3),
    (21, 1006, 20401, 1);

SELECT setval(pg_get_serial_sequence('deportes', 'id'), COALESCE((SELECT MAX(id) FROM deportes), 1), true);
SELECT setval(pg_get_serial_sequence('instituciones', 'id'), COALESCE((SELECT MAX(id) FROM instituciones), 1), true);
SELECT setval(pg_get_serial_sequence('paises', 'id'), COALESCE((SELECT MAX(id) FROM paises), 1), true);
SELECT setval(pg_get_serial_sequence('eventos', 'id'), COALESCE((SELECT MAX(id) FROM eventos), 1), true);
SELECT setval(pg_get_serial_sequence('categorias_evento', 'id'), COALESCE((SELECT MAX(id) FROM categorias_evento), 1), true);
SELECT setval(pg_get_serial_sequence('modulos', 'id'), COALESCE((SELECT MAX(id) FROM modulos), 1), true);
SELECT setval(pg_get_serial_sequence('roles', 'id'), COALESCE((SELECT MAX(id) FROM roles), 1), true);
SELECT setval(pg_get_serial_sequence('usuarios', 'id'), COALESCE((SELECT MAX(id) FROM usuarios), 1), true);
SELECT setval(pg_get_serial_sequence('equipos', 'id'), COALESCE((SELECT MAX(id) FROM equipos), 1), true);
SELECT setval(pg_get_serial_sequence('participantes', 'id'), COALESCE((SELECT MAX(id) FROM participantes), 1), true);
SELECT setval(pg_get_serial_sequence('plantillas_equipo', 'id'), COALESCE((SELECT MAX(id) FROM plantillas_equipo), 1), true);
SELECT setval(pg_get_serial_sequence('inscripciones', 'id'), COALESCE((SELECT MAX(id) FROM inscripciones), 1), true);
SELECT setval(pg_get_serial_sequence('grupos', 'id'), COALESCE((SELECT MAX(id) FROM grupos), 1), true);
SELECT setval(pg_get_serial_sequence('grupo_equipos', 'id'), COALESCE((SELECT MAX(id) FROM grupo_equipos), 1), true);
SELECT setval(pg_get_serial_sequence('partidos', 'id'), COALESCE((SELECT MAX(id) FROM partidos), 1), true);
SELECT setval(pg_get_serial_sequence('resultados', 'id'), COALESCE((SELECT MAX(id) FROM resultados), 1), true);
SELECT setval(pg_get_serial_sequence('resultado_anotaciones', 'id'), COALESCE((SELECT MAX(id) FROM resultado_anotaciones), 1), true);
