CREATE TABLE compradores (
                             id            BIGSERIAL    PRIMARY KEY,
                             tenant_id     BIGINT       NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
                             usuario_id    BIGINT       REFERENCES usuarios(id),  -- NULL se ainda não criou conta no portal
                             nome          VARCHAR(100) NOT NULL,
                             email         VARCHAR(150),
                             telefone      VARCHAR(20),
                             codigo_convite VARCHAR(20) UNIQUE,
                             criado_em     TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_compradores_tenant ON compradores(tenant_id);