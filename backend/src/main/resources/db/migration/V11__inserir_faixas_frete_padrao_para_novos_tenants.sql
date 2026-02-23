-- Nota: as faixas de frete reais são inseridas programaticamente ao criar cada tenant
-- Este arquivo insere o admin inicial do sistema

-- Senha: Admin@123 (BCrypt hash)
INSERT INTO usuarios (tenant_id, nome, email, senha_hash, role, ativo)
VALUES (NULL, 'Administrador', 'admin@ignshipping.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LjTa.MA9RX2',
        'ADMIN', TRUE);
