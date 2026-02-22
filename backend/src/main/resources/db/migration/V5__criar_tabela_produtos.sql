CREATE TABLE produtos (
                          id                   BIGSERIAL      PRIMARY KEY,
                          tenant_id            BIGINT         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
                          nome                 VARCHAR(150)   NOT NULL,
                          categoria            VARCHAR(20)    NOT NULL
                              CHECK (categoria IN ('CAMISA','TENIS','ELETRONICO','OUTROS')),
                          custo_yuan           NUMERIC(10,2)  NOT NULL,
                          frete_vendedor_yuan  NUMERIC(10,2)  NOT NULL DEFAULT 0,
                          peso_gramas          INTEGER        NOT NULL,
                          descricao            TEXT,
                          foto_url             TEXT,
                          criado_em            TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_produtos_tenant ON produtos(tenant_id);