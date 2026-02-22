CREATE TABLE orcamentos (
                            id                       BIGSERIAL     PRIMARY KEY,
                            tenant_id                BIGINT        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
                            nome_produto             VARCHAR(150)  NOT NULL,
                            categoria                VARCHAR(20),
                            custo_yuan               NUMERIC(10,2) NOT NULL,
                            frete_vendedor_yuan      NUMERIC(10,2) NOT NULL DEFAULT 0,
                            frete_internacional_yuan NUMERIC(10,2) NOT NULL DEFAULT 0,
                            taxa_cssbuy_yuan         NUMERIC(10,2) NOT NULL DEFAULT 0,
                            taxa_alfandegaria_brl    NUMERIC(10,2) NOT NULL DEFAULT 0,
                            peso_gramas              INTEGER       NOT NULL,
                            cambio                   NUMERIC(8,4)  NOT NULL,
                            preco_venda_brl          NUMERIC(10,2),
                            custo_total_brl          NUMERIC(10,2),
                            lucro_brl                NUMERIC(10,2),
                            margem_percentual        NUMERIC(6,2),
                            criado_em                TIMESTAMP     NOT NULL DEFAULT NOW()
);