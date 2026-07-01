CREATE TABLE IF NOT EXISTS notificaciones (
    id BIGSERIAL PRIMARY KEY,
    destinatario_email VARCHAR(120) NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    titulo VARCHAR(140) NOT NULL,
    mensaje VARCHAR(500) NOT NULL,
    referencia VARCHAR(120),
    leido BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    leido_en TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notificacion_destinatario
    ON notificaciones (destinatario_email);

CREATE INDEX IF NOT EXISTS idx_notificacion_leido
    ON notificaciones (leido);
