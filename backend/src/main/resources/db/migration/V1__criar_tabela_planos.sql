CREATE TABLE planos (
                        id                       BIGSERIAL    PRIMARY KEY,
                        nome                     VARCHAR(20)  NOT NULL UNIQUE
                            CHECK (nome IN ('GRATUITO','BASICO','PRO','ENTERPRISE')),
                        max_pacotes_mes          INTEGER,     -- NULL = ilimitado
                        max_compradores          INTEGER,
                        max_produtos             INTEGER,
                        portal_comprador         BOOLEAN      NOT NULL DEFAULT FALSE,
                        exportacao_incluida      BOOLEAN      NOT NULL DEFAULT FALSE,
                        preco_mensal_brl         NUMERIC(8,2) NOT NULL DEFAULT 0
);

INSERT INTO planos (nome, max_pacotes_mes, max_compradores, max_produtos,
                    portal_comprador, exportacao_incluida, preco_mensal_brl)
VALUES
    ('GRATUITO',   2,    10,  20,    FALSE, FALSE, 0),
    ('BASICO',     10,   50,  NULL,  TRUE,  TRUE,  29.90),
    ('PRO',        NULL, NULL,NULL,  TRUE,  TRUE,  69.90),
    ('ENTERPRISE', NULL, NULL,NULL,  TRUE,  TRUE,  199.00);