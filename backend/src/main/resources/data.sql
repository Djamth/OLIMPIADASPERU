INSERT INTO deportes (id, created_at, updated_at, nombre, descripcion, maximo_equipos_por_grupo, numero_jugadores)
VALUES
    (1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'FUTBOL', 'Torneo de futbol escolar', 4, 11),
    (2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'VOLEY', 'Torneo de voley escolar', 4, 6),
    (3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'BASQUET', 'Torneo de basquet escolar', 4, 5),
    (4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'PING_PONG', 'Torneo de ping pong escolar', 4, 1),
    (5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'ATLETISMO', 'Pruebas de velocidad y resistencia', 4, 1),
    (6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'AJEDREZ', 'Competencia individual de ajedrez', 4, 1),
    (7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'NATACION', 'Pruebas de piscina por categoria', 4, 1),
    (8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'HANDBALL', 'Torneo escolar de handball', 4, 7),
    (9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'FUTSAL', 'Torneo de futsal escolar', 4, 5),
    (10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'TENIS', 'Competencia individual de tenis', 4, 1),
    (11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'BADMINTON', 'Competencia individual de badminton', 4, 1),
    (12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'RUGBY', 'Torneo escolar de rugby', 4, 7),
    (13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'KARATE', 'Competencia por categorias de karate', 4, 1),
    (14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'TAEKWONDO', 'Competencia por categorias de taekwondo', 4, 1),
    (15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'GIMNASIA', 'Competencia de gimnasia escolar', 4, 1),
    (16, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'CICLISMO', 'Prueba individual de ciclismo', 4, 1),
    (17, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'ESCALADA', 'Competencia individual de escalada', 4, 1),
    (18, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'BEISBOL', 'Torneo escolar de beisbol', 4, 9),
    (19, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'SOFTBOL', 'Torneo escolar de softbol', 4, 9),
    (20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'FRONTON', 'Competencia individual de fronton', 4, 1),
    (21, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'CROSS_COUNTRY', 'Prueba de campo traviesa', 4, 1),
    (22, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'LANZAMIENTO', 'Pruebas de lanzamiento escolar', 4, 1),
    (23, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'SALTO_LARGO', 'Prueba individual de salto largo', 4, 1),
    (24, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'RELEVOS', 'Competencia de relevos por equipo', 4, 4)
ON CONFLICT DO NOTHING;

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
    (11, 'Estadisticas', '/estadisticas', 'bar-chart-3'),
    (12, 'Dashboard', '/dashboard', 'layout-dashboard'),
    (13, 'Auditoria', '/auditoria', 'history')
ON CONFLICT (id) DO NOTHING;

INSERT INTO roles (id, nombre, estado)
VALUES
    (1, 'administrador', 'ACTIVO'),
    (2, 'coordinador', 'ACTIVO'),
    (3, 'consulta', 'ACTIVO')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO rol_modulos (rol_id, modulo_id)
VALUES
    (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10), (1, 11), (1, 12), (1, 13),
    (2, 4), (2, 5), (2, 6), (2, 7), (2, 8), (2, 9), (2, 10), (2, 11), (2, 12),
    (3, 9), (3, 10), (3, 11), (3, 12)
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
    (2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Colegio Peru Campeon', 'IE-0002', 'Arequipa', 'Arequipa', 'Calle Melgar 456', '999333444', 'info@perucampeon.edu.pe'),
    (3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Colegio San Martin', 'IE-0003', 'Lima', 'Miraflores', 'Av. Larco 120', '999000003', 'contacto@sanmartin.edu.pe'),
    (4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'IE Miguel Grau', 'IE-0004', 'Callao', 'Callao', 'Av. La Marina 450', '999000004', 'contacto@grau.edu.pe'),
    (5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Colegio Santa Rosa', 'IE-0005', 'Lima', 'San Miguel', 'Jr. Los Alamos 224', '999000005', 'contacto@santarosa.edu.pe'),
    (6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'IE Ricardo Palma', 'IE-0006', 'Lima', 'Surco', 'Av. Primavera 780', '999000006', 'contacto@palma.edu.pe'),
    (7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Colegio Los Andes', 'IE-0007', 'Cusco', 'Cusco', 'Calle Sol 110', '999000007', 'contacto@losandes.edu.pe'),
    (8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'IE Tupac Amaru', 'IE-0008', 'Cusco', 'Wanchaq', 'Av. Cultura 980', '999000008', 'contacto@tupac.edu.pe'),
    (9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Colegio Mariano Melgar', 'IE-0009', 'Arequipa', 'Cayma', 'Calle Mistiano 455', '999000009', 'contacto@melgar.edu.pe'),
    (10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'IE Micaela Bastidas', 'IE-0010', 'Arequipa', 'Yanahuara', 'Av. Ejercito 300', '999000010', 'contacto@bastidas.edu.pe'),
    (11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Colegio Cesar Vallejo', 'IE-0011', 'La Libertad', 'Trujillo', 'Av. America 678', '999000011', 'contacto@vallejo.edu.pe'),
    (12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'IE Victor Raul Haya', 'IE-0012', 'La Libertad', 'Victor Larco', 'Calle Libertad 333', '999000012', 'contacto@haya.edu.pe'),
    (13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Colegio San Jose', 'IE-0013', 'Lambayeque', 'Chiclayo', 'Av. Balta 456', '999000013', 'contacto@sanjose.edu.pe'),
    (14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'IE Rosa Flores', 'IE-0014', 'Lambayeque', 'Pimentel', 'Malecon Norte 210', '999000014', 'contacto@rosaflores.edu.pe'),
    (15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Colegio Amazonas', 'IE-0015', 'Loreto', 'Iquitos', 'Av. Grau 520', '999000015', 'contacto@amazonas.edu.pe'),
    (16, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'IE Belen de Iquitos', 'IE-0016', 'Loreto', 'Iquitos', 'Jr. Putumayo 150', '999000016', 'contacto@belen.edu.pe'),
    (17, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Colegio Huancayo Central', 'IE-0017', 'Junin', 'Huancayo', 'Av. Real 1000', '999000017', 'contacto@huancayocentral.edu.pe'),
    (18, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'IE Daniel Alcides Carrion', 'IE-0018', 'Junin', 'El Tambo', 'Av. Universitaria 705', '999000018', 'contacto@carrion.edu.pe'),
    (19, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Colegio Grau Piura', 'IE-0019', 'Piura', 'Piura', 'Av. Sanchez Cerro 430', '999000019', 'contacto@graupiura.edu.pe'),
    (20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'IE Las Palmeras', 'IE-0020', 'Piura', 'Castilla', 'Calle Los Faiques 89', '999000020', 'contacto@palmeras.edu.pe'),
    (21, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Colegio Tacna Heroica', 'IE-0021', 'Tacna', 'Tacna', 'Av. Bolognesi 300', '999000021', 'contacto@tacnaheroica.edu.pe'),
    (22, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'IE Francisco Bolognesi', 'IE-0022', 'Tacna', 'Alto de la Alianza', 'Av. Industrial 990', '999000022', 'contacto@bolognesi.edu.pe'),
    (23, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Colegio Puno Grande', 'IE-0023', 'Puno', 'Puno', 'Jr. Lima 455', '999000023', 'contacto@punogrande.edu.pe'),
    (24, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'IE Jose Carlos Mariategui', 'IE-0024', 'Puno', 'Juliaca', 'Av. Circunvalacion 800', '999000024', 'contacto@mariategui.edu.pe'),
    (25, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Colegio Bicentenario Peru', 'IE-0025', 'Lima', 'San Borja', 'Av. Canada 1500', '999000025', 'contacto@bicentenario.edu.pe')
ON CONFLICT DO NOTHING;

INSERT INTO equipos (id, created_at, updated_at, nombre, categoria, genero, entrenador, institucion_id)
VALUES
    (1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Arguedas FC', 'SUB_17', 'MASCULINO', 'Carlos Perez', 1),
    (2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Campeon Voley', 'SUB_15', 'FEMENINO', 'Maria Rojas', 2),
    (3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Brasil 1A', 'SUB_17', 'MASCULINO', 'Carlos Ramos', 3),
    (4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Francia 5A', 'SUB_17', 'MASCULINO', 'Luis Herrera', 4),
    (5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Argentina 2B', 'SUB_17', 'MASCULINO', 'Jorge Salas', 5),
    (6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Uruguay 3C', 'SUB_17', 'MASCULINO', 'Marco Leon', 6),
    (7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Colombia 4D', 'SUB_17', 'MASCULINO', 'Hector Vega', 7),
    (8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Chile 2A', 'SUB_17', 'MASCULINO', 'Pablo Soto', 8),
    (9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Peru Damas A', 'SUB_17', 'FEMENINO', 'Ana Torres', 9),
    (10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Bolivia Damas B', 'SUB_17', 'FEMENINO', 'Rosa Campos', 10),
    (11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Ecuador Damas C', 'SUB_17', 'FEMENINO', 'Patricia Diaz', 11),
    (12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Paraguay Damas D', 'SUB_17', 'FEMENINO', 'Lucia Flores', 12),
    (13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Venezuela Damas E', 'SUB_17', 'FEMENINO', 'Elena Rios', 13),
    (14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Mexico Damas F', 'SUB_17', 'FEMENINO', 'Claudia Pena', 14),
    (15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Lima Basket', 'SUB_17', 'MASCULINO', 'Mario Chavez', 15),
    (16, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Callao Basket', 'SUB_17', 'MASCULINO', 'Raul Medina', 16),
    (17, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Cusco Basket', 'SUB_17', 'MASCULINO', 'Nestor Ortiz', 17),
    (18, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Arequipa Basket', 'SUB_17', 'MASCULINO', 'Oscar Vargas', 18),
    (19, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Trujillo Basket', 'SUB_17', 'MASCULINO', 'Ivan Castro', 19),
    (20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Chiclayo Basket', 'SUB_17', 'MASCULINO', 'Ricardo Vera', 20),
    (21, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Mixto Norte Ping', 'LIBRE', 'MIXTO', 'Teresa Leon', 21),
    (22, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Mixto Sur Ping', 'LIBRE', 'MIXTO', 'Felipe Arias', 22),
    (23, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Mixto Este Ping', 'LIBRE', 'MIXTO', 'Carmen Prado', 23),
    (24, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Mixto Oeste Ping', 'LIBRE', 'MIXTO', 'Victor Luna', 24),
    (25, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Mixto Centro Ping', 'LIBRE', 'MIXTO', 'Gloria Paz', 25),
    (26, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Mixto Altura Ping', 'LIBRE', 'MIXTO', 'Hugo Molina', 1)
ON CONFLICT DO NOTHING;

INSERT INTO participantes (id, created_at, updated_at, nombres, apellidos, numero_documento, genero, fecha_nacimiento, codigo_estudiante, equipo_id)
SELECT
    equipo_id * 100 + jugador_nro,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CASE
        WHEN equipo_id IN (2, 9, 10, 11, 12, 13, 14)
            OR (equipo_id IN (21, 22, 23, 24, 25, 26) AND jugador_nro % 2 = 0)
        THEN (ARRAY[
            'Valeria', 'Camila', 'Luciana', 'Sofia', 'Mariana', 'Daniela', 'Alejandra', 'Fernanda',
            'Gabriela', 'Antonella', 'Andrea', 'Paula', 'Renata', 'Ximena', 'Isabella', 'Natalia',
            'Carolina', 'Milagros', 'Fiorella', 'Claudia', 'Patricia', 'Rosa', 'Diana', 'Elena'
        ])[((equipo_id + jugador_nro - 2) % 24) + 1]
        ELSE (ARRAY[
            'Luis', 'Diego', 'Carlos', 'Jorge', 'Miguel', 'Andres', 'Sebastian', 'Mateo',
            'Alonso', 'Nicolas', 'Adrian', 'Fernando', 'Rodrigo', 'Bruno', 'Gabriel', 'Emilio',
            'Franco', 'Martin', 'Piero', 'Santiago', 'Hector', 'Rafael', 'Ivan', 'Oscar'
        ])[((equipo_id + jugador_nro - 2) % 24) + 1]
    END,
    (ARRAY[
        'Quispe', 'Flores', 'Ramos', 'Mendoza', 'Torres', 'Vargas', 'Castillo', 'Rojas',
        'Huaman', 'Chavez', 'Salazar', 'Medina', 'Paredes', 'Cruz', 'Reyes', 'Aguilar',
        'Campos', 'Herrera', 'Soto', 'Navarro', 'Leon', 'Caceres', 'Valverde', 'Arias',
        'Carrasco', 'Espinoza', 'Benavides', 'Lopez', 'Garcia', 'Morales'
    ])[((equipo_id * 3 + jugador_nro - 4) % 30) + 1],
    '90' || LPAD(equipo_id::text, 2, '0') || LPAD(jugador_nro::text, 2, '0'),
    CASE
        WHEN equipo_id IN (2, 9, 10, 11, 12, 13, 14) THEN 'FEMENINO'
        WHEN equipo_id IN (21, 22, 23, 24, 25, 26) AND jugador_nro % 2 = 0 THEN 'FEMENINO'
        ELSE 'MASCULINO'
    END,
    DATE '2009-01-01' + jugador_nro,
    'EST-' || LPAD(equipo_id::text, 2, '0') || '-' || LPAD(jugador_nro::text, 2, '0'),
    equipo_id
FROM (
    SELECT equipo_id, generate_series(1,
        CASE
            WHEN equipo_id IN (1, 3, 4, 5, 6, 7, 8) THEN 11
            WHEN equipo_id IN (2, 9, 10, 11, 12, 13, 14) THEN 6
            WHEN equipo_id IN (15, 16, 17, 18, 19, 20) THEN 5
            ELSE 2
        END
    ) AS jugador_nro
    FROM generate_series(1, 26) AS equipos(equipo_id)
) plantilla
ON CONFLICT (id) DO UPDATE
SET nombres = EXCLUDED.nombres,
    apellidos = EXCLUDED.apellidos,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO inscripciones (id, created_at, updated_at, equipo_id, deporte_id, estado, fecha_inscripcion)
VALUES
    (1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 1, 'CONFIRMADA', CURRENT_DATE),
    (2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2, 2, 'CONFIRMADA', CURRENT_DATE),
    (3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 3, 1, 'CONFIRMADA', CURRENT_DATE),
    (4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4, 1, 'CONFIRMADA', CURRENT_DATE),
    (5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 5, 1, 'CONFIRMADA', CURRENT_DATE),
    (6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 6, 1, 'CONFIRMADA', CURRENT_DATE),
    (7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 7, 1, 'CONFIRMADA', CURRENT_DATE),
    (8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 8, 1, 'CONFIRMADA', CURRENT_DATE),
    (9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 9, 2, 'CONFIRMADA', CURRENT_DATE),
    (10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 10, 2, 'CONFIRMADA', CURRENT_DATE),
    (11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 11, 2, 'CONFIRMADA', CURRENT_DATE),
    (12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 12, 2, 'CONFIRMADA', CURRENT_DATE),
    (13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 13, 2, 'CONFIRMADA', CURRENT_DATE),
    (14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 14, 2, 'CONFIRMADA', CURRENT_DATE),
    (15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 15, 3, 'CONFIRMADA', CURRENT_DATE),
    (16, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 16, 3, 'CONFIRMADA', CURRENT_DATE),
    (17, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 17, 3, 'CONFIRMADA', CURRENT_DATE),
    (18, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 18, 3, 'CONFIRMADA', CURRENT_DATE),
    (19, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 19, 3, 'CONFIRMADA', CURRENT_DATE),
    (20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 20, 3, 'CONFIRMADA', CURRENT_DATE),
    (21, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 21, 4, 'CONFIRMADA', CURRENT_DATE),
    (22, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 22, 4, 'CONFIRMADA', CURRENT_DATE),
    (23, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 23, 4, 'CONFIRMADA', CURRENT_DATE),
    (24, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 24, 4, 'CONFIRMADA', CURRENT_DATE),
    (25, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 25, 4, 'CONFIRMADA', CURRENT_DATE),
    (26, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 26, 4, 'CONFIRMADA', CURRENT_DATE)
ON CONFLICT DO NOTHING;

INSERT INTO grupos (id, created_at, updated_at, nombre, deporte_id)
VALUES
    (101, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Grupo A', 1),
    (102, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Grupo B', 1),
    (103, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Grupo A', 2),
    (104, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Grupo B', 2),
    (105, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Grupo A', 3),
    (106, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Grupo B', 3),
    (107, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Grupo A', 4),
    (108, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Grupo B', 4),
    (109, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Grupo A', 5),
    (110, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Grupo A', 6),
    (111, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Grupo A', 7),
    (112, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Grupo A', 8),
    (113, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Grupo A', 9),
    (114, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Grupo A', 10),
    (115, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Grupo A', 11),
    (116, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Grupo A', 12),
    (117, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Grupo A', 13),
    (118, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Grupo A', 14),
    (119, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Grupo A', 15),
    (120, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Grupo A', 16),
    (121, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Grupo A', 17),
    (122, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Grupo A', 18),
    (123, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Grupo A', 19),
    (124, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Grupo A', 20),
    (125, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Grupo A', 21),
    (126, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Grupo A', 22),
    (127, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Grupo A', 23),
    (128, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Grupo A', 24)
ON CONFLICT DO NOTHING;

INSERT INTO grupo_equipos (id, created_at, updated_at, grupo_id, equipo_id, posicion)
VALUES
    (1001, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 101, 1, 1),
    (1002, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 101, 3, 2),
    (1003, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 101, 4, 3),
    (1004, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 101, 5, 4),
    (1005, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 102, 6, 1),
    (1006, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 102, 7, 2),
    (1007, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 102, 8, 3),
    (1008, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 103, 2, 1),
    (1009, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 103, 9, 2),
    (1010, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 103, 10, 3),
    (1011, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 103, 11, 4),
    (1012, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 104, 12, 1),
    (1013, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 104, 13, 2),
    (1014, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 104, 14, 3),
    (1015, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 105, 15, 1),
    (1016, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 105, 16, 2),
    (1017, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 105, 17, 3),
    (1018, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 106, 18, 1),
    (1019, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 106, 19, 2),
    (1020, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 106, 20, 3),
    (1021, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 107, 21, 1),
    (1022, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 107, 22, 2),
    (1023, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 107, 23, 3),
    (1024, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 108, 24, 1),
    (1025, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 108, 25, 2),
    (1026, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 108, 26, 3)
ON CONFLICT DO NOTHING;

INSERT INTO partidos (id, created_at, updated_at, grupo_id, deporte_id, equipo_local_id, equipo_visitante_id, fecha_hora, sede, estado)
VALUES
    (1001, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 101, 1, 1, 3, CURRENT_TIMESTAMP + INTERVAL '3 days', 'Cancha Principal', 'FINALIZADO'),
    (1002, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 101, 1, 4, 5, CURRENT_TIMESTAMP + INTERVAL '4 days', 'Cancha Principal', 'FINALIZADO'),
    (1003, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 101, 1, 1, 4, CURRENT_TIMESTAMP + INTERVAL '5 days', 'Cancha Norte', 'FINALIZADO'),
    (1004, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 101, 1, 3, 5, CURRENT_TIMESTAMP + INTERVAL '6 days', 'Cancha Norte', 'PROGRAMADO'),
    (1005, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 102, 1, 6, 7, CURRENT_TIMESTAMP + INTERVAL '7 days', 'Cancha Sur', 'FINALIZADO'),
    (1006, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 102, 1, 7, 8, CURRENT_TIMESTAMP + INTERVAL '8 days', 'Cancha Sur', 'FINALIZADO'),
    (1007, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 103, 2, 2, 9, CURRENT_TIMESTAMP + INTERVAL '3 days', 'Coliseo A', 'FINALIZADO'),
    (1008, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 103, 2, 10, 11, CURRENT_TIMESTAMP + INTERVAL '4 days', 'Coliseo A', 'FINALIZADO'),
    (1009, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 104, 2, 12, 13, CURRENT_TIMESTAMP + INTERVAL '5 days', 'Coliseo B', 'FINALIZADO'),
    (1010, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 104, 2, 13, 14, CURRENT_TIMESTAMP + INTERVAL '6 days', 'Coliseo B', 'PROGRAMADO'),
    (1011, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 105, 3, 15, 16, CURRENT_TIMESTAMP + INTERVAL '3 days', 'Cancha Techada', 'FINALIZADO'),
    (1012, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 105, 3, 16, 17, CURRENT_TIMESTAMP + INTERVAL '4 days', 'Cancha Techada', 'FINALIZADO'),
    (1013, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 106, 3, 18, 19, CURRENT_TIMESTAMP + INTERVAL '5 days', 'Cancha Auxiliar', 'FINALIZADO'),
    (1014, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 106, 3, 19, 20, CURRENT_TIMESTAMP + INTERVAL '6 days', 'Cancha Auxiliar', 'PROGRAMADO'),
    (1015, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 107, 4, 21, 22, CURRENT_TIMESTAMP + INTERVAL '3 days', 'Mesa 1', 'FINALIZADO'),
    (1016, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 107, 4, 22, 23, CURRENT_TIMESTAMP + INTERVAL '4 days', 'Mesa 2', 'FINALIZADO'),
    (1017, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 108, 4, 24, 25, CURRENT_TIMESTAMP + INTERVAL '5 days', 'Mesa 3', 'FINALIZADO'),
    (1018, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 108, 4, 25, 26, CURRENT_TIMESTAMP + INTERVAL '6 days', 'Mesa 4', 'PROGRAMADO'),
    (1019, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 101, 1, 1, 5, CURRENT_TIMESTAMP + INTERVAL '9 days', 'Cancha Principal', 'FINALIZADO'),
    (1020, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 102, 1, 6, 8, CURRENT_TIMESTAMP + INTERVAL '10 days', 'Cancha Sur', 'FINALIZADO'),
    (1021, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 103, 2, 2, 10, CURRENT_TIMESTAMP + INTERVAL '9 days', 'Coliseo A', 'FINALIZADO'),
    (1022, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 105, 3, 15, 17, CURRENT_TIMESTAMP + INTERVAL '9 days', 'Cancha Techada', 'FINALIZADO'),
    (1023, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 107, 4, 21, 23, CURRENT_TIMESTAMP + INTERVAL '9 days', 'Mesa 1', 'FINALIZADO'),
    (1024, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 108, 4, 24, 26, CURRENT_TIMESTAMP + INTERVAL '10 days', 'Mesa 3', 'FINALIZADO'),
    (1025, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 101, 1, 3, 4, CURRENT_TIMESTAMP + INTERVAL '11 days', 'Cancha Principal', 'FINALIZADO')
ON CONFLICT DO NOTHING;

ALTER TABLE resultados DROP COLUMN IF EXISTS goleadores;

INSERT INTO resultados (id, created_at, updated_at, partido_id, puntaje_local, puntaje_visitante, observaciones)
VALUES
    (1001, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1001, 3, 1, 'Partido cerrado con buen ritmo'),
    (1002, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1002, 2, 2, 'Empate intenso'),
    (1003, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1003, 1, 0, 'Victoria por minima diferencia'),
    (1004, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1005, 4, 2, 'Buen desempeno ofensivo'),
    (1005, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1006, 2, 3, 'Remontada visitante'),
    (1006, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1007, 2, 0, 'Victoria en sets corridos'),
    (1007, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1008, 1, 2, 'Partido definido en tercer set'),
    (1008, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1009, 2, 1, 'Gran cierre de partido'),
    (1009, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1011, 45, 39, 'Basquet con alto ritmo'),
    (1010, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1012, 51, 48, 'Final ajustado'),
    (1011, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1013, 40, 44, 'Victoria visitante'),
    (1012, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1015, 3, 1, 'Ping pong rapido'),
    (1013, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1016, 2, 3, 'Partido muy parejo'),
    (1014, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1017, 3, 0, 'Dominio local'),
    (1015, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1019, 2, 1, 'Resultado valido para ranking'),
    (1016, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1020, 0, 1, 'Defensa solida'),
    (1017, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1021, 2, 1, 'Set final emocionante'),
    (1018, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1022, 60, 58, 'Marcador alto'),
    (1019, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1023, 3, 2, 'Duelo individual parejo'),
    (1020, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1024, 1, 3, 'Victoria visitante'),
    (1021, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1025, 4, 3, 'Partido con muchos goles')
ON CONFLICT DO NOTHING;

INSERT INTO resultado_anotaciones (id, resultado_id, participante_id, cantidad)
VALUES
    (1001, 1001, 101, 2),
    (1002, 1001, 301, 1),
    (1003, 1002, 401, 2),
    (1004, 1002, 501, 2),
    (1005, 1003, 102, 1),
    (1006, 1004, 601, 3),
    (1007, 1004, 701, 2),
    (1008, 1005, 702, 2),
    (1009, 1005, 801, 3),
    (1010, 1006, 201, 2),
    (1011, 1006, 901, 1),
    (1012, 1007, 1001, 1),
    (1013, 1007, 1101, 2),
    (1014, 1008, 1201, 2),
    (1015, 1008, 1301, 1),
    (1016, 1009, 1501, 18),
    (1017, 1009, 1601, 14),
    (1018, 1010, 1602, 20),
    (1019, 1010, 1701, 16),
    (1020, 1011, 1801, 15),
    (1021, 1011, 1901, 19),
    (1022, 1012, 2101, 3),
    (1023, 1013, 2201, 2),
    (1024, 1013, 2301, 3),
    (1025, 1014, 2401, 3),
    (1026, 1015, 103, 2),
    (1027, 1016, 802, 1),
    (1028, 1017, 202, 2),
    (1029, 1018, 1502, 24),
    (1030, 1019, 2102, 3),
    (1031, 1020, 2601, 3),
    (1032, 1021, 301, 2),
    (1033, 1021, 401, 1)
ON CONFLICT DO NOTHING;

SELECT setval(pg_get_serial_sequence('deportes', 'id'), COALESCE((SELECT MAX(id) FROM deportes), 1), true);
SELECT setval(pg_get_serial_sequence('modulos', 'id'), COALESCE((SELECT MAX(id) FROM modulos), 1), true);
SELECT setval(pg_get_serial_sequence('roles', 'id'), COALESCE((SELECT MAX(id) FROM roles), 1), true);
SELECT setval(pg_get_serial_sequence('usuarios', 'id'), COALESCE((SELECT MAX(id) FROM usuarios), 1), true);
SELECT setval(pg_get_serial_sequence('instituciones', 'id'), COALESCE((SELECT MAX(id) FROM instituciones), 1), true);
SELECT setval(pg_get_serial_sequence('equipos', 'id'), COALESCE((SELECT MAX(id) FROM equipos), 1), true);
SELECT setval(pg_get_serial_sequence('participantes', 'id'), COALESCE((SELECT MAX(id) FROM participantes), 1), true);
SELECT setval(pg_get_serial_sequence('inscripciones', 'id'), COALESCE((SELECT MAX(id) FROM inscripciones), 1), true);
SELECT setval(pg_get_serial_sequence('grupos', 'id'), COALESCE((SELECT MAX(id) FROM grupos), 1), true);
SELECT setval(pg_get_serial_sequence('grupo_equipos', 'id'), COALESCE((SELECT MAX(id) FROM grupo_equipos), 1), true);
SELECT setval(pg_get_serial_sequence('partidos', 'id'), COALESCE((SELECT MAX(id) FROM partidos), 1), true);
SELECT setval(pg_get_serial_sequence('resultados', 'id'), COALESCE((SELECT MAX(id) FROM resultados), 1), true);
SELECT setval(pg_get_serial_sequence('resultado_anotaciones', 'id'), COALESCE((SELECT MAX(id) FROM resultado_anotaciones), 1), true);
