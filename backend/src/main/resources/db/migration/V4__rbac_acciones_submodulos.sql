ALTER TABLE modulos
    ADD COLUMN IF NOT EXISTS modulo_padre_id INTEGER;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_modulo_padre'
    ) THEN
        ALTER TABLE modulos
            ADD CONSTRAINT fk_modulo_padre
            FOREIGN KEY (modulo_padre_id) REFERENCES modulos(id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_modulos_padre
    ON modulos (modulo_padre_id);

INSERT INTO modulos (id, nombre, ruta, icono, modulo_padre_id)
VALUES
    (17, 'Seguridad', '/seguridad', 'shield-check', NULL),
    (18, 'Gestion deportiva', '/gestion-deportiva', 'trophy', NULL),
    (19, 'Configuracion institucional', '/configuracion-institucional', 'building-2', NULL)
ON CONFLICT (id) DO UPDATE
SET nombre = EXCLUDED.nombre,
    ruta = EXCLUDED.ruta,
    icono = EXCLUDED.icono;

UPDATE modulos SET modulo_padre_id = 19 WHERE ruta IN ('/instituciones', '/paises', '/eventos');
UPDATE modulos SET modulo_padre_id = 18 WHERE ruta IN ('/deportes', '/equipos', '/participantes', '/inscripciones', '/sorteos', '/programacion', '/resultados', '/estadisticas');
UPDATE modulos SET modulo_padre_id = 17 WHERE ruta IN ('/usuarios', '/perfiles', '/modulos', '/auditoria');

CREATE TABLE IF NOT EXISTS acciones (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nombre VARCHAR(80) NOT NULL
);

INSERT INTO acciones (codigo, nombre) VALUES
    ('VER', 'Ver'),
    ('CREAR', 'Crear'),
    ('EDITAR', 'Editar'),
    ('ELIMINAR', 'Eliminar'),
    ('EXPORTAR', 'Exportar')
ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre;

CREATE TABLE IF NOT EXISTS rol_modulo_acciones (
    id BIGSERIAL PRIMARY KEY,
    rol_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    modulo_id INTEGER NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
    accion_id INTEGER NOT NULL REFERENCES acciones(id) ON DELETE CASCADE,
    CONSTRAINT uk_rol_modulo_accion UNIQUE (rol_id, modulo_id, accion_id)
);

CREATE INDEX IF NOT EXISTS idx_rma_rol_modulo
    ON rol_modulo_acciones (rol_id, modulo_id);

INSERT INTO rol_modulo_acciones (rol_id, modulo_id, accion_id)
SELECT rm.rol_id, rm.modulo_id, a.id
FROM rol_modulos rm
JOIN acciones a ON a.codigo = 'VER'
WHERE COALESCE(rm.puede_ver, TRUE)
ON CONFLICT (rol_id, modulo_id, accion_id) DO NOTHING;

INSERT INTO rol_modulo_acciones (rol_id, modulo_id, accion_id)
SELECT rm.rol_id, rm.modulo_id, a.id
FROM rol_modulos rm
JOIN acciones a ON a.codigo = 'CREAR'
WHERE COALESCE(rm.puede_crear, TRUE)
ON CONFLICT (rol_id, modulo_id, accion_id) DO NOTHING;

INSERT INTO rol_modulo_acciones (rol_id, modulo_id, accion_id)
SELECT rm.rol_id, rm.modulo_id, a.id
FROM rol_modulos rm
JOIN acciones a ON a.codigo = 'EDITAR'
WHERE COALESCE(rm.puede_editar, TRUE)
ON CONFLICT (rol_id, modulo_id, accion_id) DO NOTHING;

INSERT INTO rol_modulo_acciones (rol_id, modulo_id, accion_id)
SELECT rm.rol_id, rm.modulo_id, a.id
FROM rol_modulos rm
JOIN acciones a ON a.codigo = 'ELIMINAR'
WHERE COALESCE(rm.puede_eliminar, TRUE)
ON CONFLICT (rol_id, modulo_id, accion_id) DO NOTHING;

INSERT INTO rol_modulo_acciones (rol_id, modulo_id, accion_id)
SELECT rm.rol_id, rm.modulo_id, a.id
FROM rol_modulos rm
JOIN acciones a ON a.codigo = 'EXPORTAR'
WHERE COALESCE(rm.puede_exportar, TRUE)
ON CONFLICT (rol_id, modulo_id, accion_id) DO NOTHING;
