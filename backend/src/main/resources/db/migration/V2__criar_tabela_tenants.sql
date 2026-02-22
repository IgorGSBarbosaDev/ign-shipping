CREATE TABLE tenants (
                         id              BIGSERIAL    PRIMARY KEY,
                         plano_id        BIGINT       NOT NULL REFERENCES planos(id),
                         status_conta    VARCHAR(15)  NOT NULL DEFAULT 'TRIAL'
                             CHECK (status_conta IN ('TRIAL','ATIVO','SUSPENSO','CANCELADO')),
                         trial_expira_em TIMESTAMP,
                         criado_em       TIMESTAMP    NOT NULL DEFAULT NOW(),
                         atualizado_em   TIMESTAMP    NOT NULL DEFAULT NOW()
);