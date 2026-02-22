CREATE TABLE pacotes (
                         id                       BIGSERIAL     PRIMARY KEY,
                         tenant_id                BIGINT        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
                         nome                     VARCHAR(150)  NOT NULL,
                         status                   VARCHAR(20)   NOT NULL DEFAULT 'RASCUNHO'
                             CHECK (status IN (
                                               'RASCUNHO','AGUARDANDO_ENVIO','EM_VIAGEM',
                                               'ALFANDEGA','TRANSITO','ENTREGUE','FINALIZADO'
                                 )),
                         tipo_envio               VARCHAR(15)   CHECK (tipo_envio IN ('EXPRESSA','ECONOMICA')),
                         cambio                   NUMERIC(8,4),
                         taxa_alfandegaria_brl    NUMERIC(10,2) NOT NULL DEFAULT 0,
                         frete_internacional_yuan NUMERIC(10,2),
                         observacoes              TEXT,
                         data_envio               DATE,
                         criado_em                TIMESTAMP     NOT NULL DEFAULT NOW(),
                         atualizado_em            TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pacotes_tenant ON pacotes(tenant_id);
CREATE INDEX idx_pacotes_status ON pacotes(status);