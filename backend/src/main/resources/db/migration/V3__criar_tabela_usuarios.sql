CREATE TABLE usuarios (
                          id          BIGSERIAL     PRIMARY KEY,
                          tenant_id   BIGINT        REFERENCES tenants(id) ON DELETE CASCADE,
                          nome        VARCHAR(100)  NOT NULL,
                          email       VARCHAR(150)  NOT NULL UNIQUE,
                          senha_hash  VARCHAR(255)  NOT NULL,
                          role        VARCHAR(15)   NOT NULL
                              CHECK (role IN ('VENDEDOR','COMPRADOR','ADMIN')),
                          ativo       BOOLEAN       NOT NULL DEFAULT TRUE,
                          criado_em   TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_tenant ON usuarios(tenant_id);