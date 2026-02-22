-- Para recuperação de senha
CREATE TABLE tokens_recuperacao_senha (
                                          id          BIGSERIAL    PRIMARY KEY,
                                          usuario_id  BIGINT       NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
                                          token       VARCHAR(255) NOT NULL UNIQUE,
                                          expira_em   TIMESTAMP    NOT NULL,
                                          usado       BOOLEAN      NOT NULL DEFAULT FALSE,
                                          criado_em   TIMESTAMP    NOT NULL DEFAULT NOW()
);