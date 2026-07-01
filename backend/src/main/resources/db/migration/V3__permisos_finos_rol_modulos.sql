ALTER TABLE rol_modulos
    ADD COLUMN IF NOT EXISTS puede_ver BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS puede_crear BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS puede_editar BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS puede_eliminar BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS puede_exportar BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE rol_modulos
SET puede_ver = TRUE,
    puede_crear = TRUE,
    puede_editar = TRUE,
    puede_eliminar = TRUE,
    puede_exportar = TRUE
WHERE puede_ver IS NULL
   OR puede_crear IS NULL
   OR puede_editar IS NULL
   OR puede_eliminar IS NULL
   OR puede_exportar IS NULL;
