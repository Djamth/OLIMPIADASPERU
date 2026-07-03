INSERT INTO modulos (nombre, ruta, icono, modulo_padre_id)
SELECT 'Acciones', '/acciones', 'key-round', padre.id
FROM modulos padre
WHERE padre.ruta = '/seguridad'
  AND NOT EXISTS (SELECT 1 FROM modulos WHERE ruta = '/acciones');

UPDATE modulos
SET nombre = 'Acciones',
    icono = 'key-round',
    modulo_padre_id = (SELECT id FROM modulos WHERE ruta = '/seguridad' LIMIT 1)
WHERE ruta = '/acciones';

INSERT INTO rol_modulos (rol_id, modulo_id)
SELECT r.id, m.id
FROM roles r
CROSS JOIN modulos m
WHERE lower(r.nombre) = 'administrador'
  AND m.ruta = '/acciones'
ON CONFLICT DO NOTHING;

INSERT INTO rol_modulo_acciones (rol_id, modulo_id, accion_id)
SELECT r.id, m.id, a.id
FROM roles r
CROSS JOIN modulos m
CROSS JOIN acciones a
WHERE lower(r.nombre) = 'administrador'
  AND m.ruta = '/acciones'
  AND a.codigo IN ('VER', 'CREAR', 'EDITAR', 'ELIMINAR', 'EXPORTAR')
ON CONFLICT (rol_id, modulo_id, accion_id) DO NOTHING;
