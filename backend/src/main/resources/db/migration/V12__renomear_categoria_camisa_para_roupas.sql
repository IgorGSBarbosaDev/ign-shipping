-- Atualizar registros existentes com a categoria antiga
UPDATE produtos SET categoria = 'ROUPAS' WHERE categoria = 'CAMISA';

-- Atualizar o CHECK constraint da coluna categoria
ALTER TABLE produtos DROP CONSTRAINT IF EXISTS produtos_categoria_check;
ALTER TABLE produtos ADD CONSTRAINT produtos_categoria_check
    CHECK (categoria IN ('ROUPAS', 'TENIS', 'ELETRONICO', 'OUTROS'));
