ALTER TABLE produtos
    ADD COLUMN custo_compra_yuan NUMERIC(10,2);

UPDATE produtos
SET custo_compra_yuan = custo_yuan
WHERE custo_compra_yuan IS NULL;

ALTER TABLE produtos
    ALTER COLUMN custo_compra_yuan SET NOT NULL;
