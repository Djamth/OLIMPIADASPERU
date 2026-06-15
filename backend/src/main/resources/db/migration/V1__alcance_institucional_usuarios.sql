ALTER TABLE IF EXISTS usuarios
    ADD COLUMN IF NOT EXISTS institucion_id BIGINT;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = current_schema() AND table_name = 'usuarios'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = current_schema() AND table_name = 'instituciones'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_usuario_institucion'
    ) THEN
        ALTER TABLE usuarios
            ADD CONSTRAINT fk_usuario_institucion
            FOREIGN KEY (institucion_id) REFERENCES instituciones(id);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = current_schema() AND table_name = 'usuarios'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_usuario_institucion
            ON usuarios (institucion_id);
    END IF;
END $$;
