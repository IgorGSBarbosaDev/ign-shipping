CREATE TABLE faixas_frete (
                              id              BIGSERIAL     PRIMARY KEY,
                              tenant_id       BIGINT        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
                              tipo_envio      VARCHAR(15)   NOT NULL CHECK (tipo_envio IN ('EXPRESSA','ECONOMICA')),
                              peso_min_gramas INTEGER       NOT NULL,
                              peso_max_gramas INTEGER       NOT NULL,
                              custo_yuan      NUMERIC(10,2) NOT NULL,
                              CONSTRAINT chk_faixa_peso CHECK (peso_min_gramas < peso_max_gramas)
);