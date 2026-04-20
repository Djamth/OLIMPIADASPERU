INSERT INTO deportes (id, created_at, updated_at, nombre, descripcion, maximo_equipos_por_grupo, numero_jugadores)
VALUES
    (1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'FUTBOL', 'Torneo de futbol escolar', 4, 11),
    (2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'VOLEY', 'Torneo de voley escolar', 4, 6),
    (3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'BASQUET', 'Torneo de basquet escolar', 4, 5),
    (4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'PING_PONG', 'Torneo de ping pong escolar', 4, 1);

INSERT INTO instituciones (id, created_at, updated_at, nombre, codigo_modular, region, ciudad, direccion, telefono, email)
VALUES
    (1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'IE Jose Maria Arguedas', 'IE-0001', 'Lima', 'Lima', 'Av. Los Proceres 123', '999111222', 'contacto@arguedas.edu.pe'),
    (2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Colegio Peru Campeon', 'IE-0002', 'Arequipa', 'Arequipa', 'Calle Melgar 456', '999333444', 'info@perucampeon.edu.pe');

INSERT INTO equipos (id, created_at, updated_at, nombre, categoria, genero, entrenador, institucion_id)
VALUES
    (1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Arguedas FC', 'SUB_17', 'MASCULINO', 'Carlos Perez', 1),
    (2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Campeon Voley', 'SUB_15', 'FEMENINO', 'Maria Rojas', 2);

INSERT INTO inscripciones (id, created_at, updated_at, equipo_id, deporte_id, estado, fecha_inscripcion)
VALUES
    (1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 1, 'CONFIRMADA', CURRENT_DATE),
    (2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2, 2, 'CONFIRMADA', CURRENT_DATE);
