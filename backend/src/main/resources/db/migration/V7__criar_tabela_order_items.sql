CREATE TABLE order_items (
                             id                BIGSERIAL     PRIMARY KEY,
                             tenant_id         BIGINT        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
                             pacote_id         BIGINT        NOT NULL REFERENCES pacotes(id) ON DELETE CASCADE,
                             comprador_id      BIGINT        NOT NULL REFERENCES compradores(id),
                             produto_id        BIGINT        NOT NULL REFERENCES produtos(id),
                             quantidade        INTEGER       NOT NULL DEFAULT 1 CHECK (quantidade >= 1),
                             preco_venda_brl   NUMERIC(10,2) NOT NULL,
                             custo_rateado_brl NUMERIC(10,2),
                             status_pagamento  VARCHAR(10)   NOT NULL DEFAULT 'PENDENTE'
                                 CHECK (status_pagamento IN ('PENDENTE','PAGO','PARCIAL')),
                             criado_em         TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_tenant   ON order_items(tenant_id);
CREATE INDEX idx_order_items_pacote   ON order_items(pacote_id);
CREATE INDEX idx_order_items_comprador ON order_items(comprador_id);