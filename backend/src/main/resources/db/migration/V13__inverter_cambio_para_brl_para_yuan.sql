-- Inverte o significado de cambio para "1 BRL = X CNY" nas linhas historicas.
-- Antes: cambio representava "1 CNY = X BRL".
-- Depois: cambio representa "1 BRL = X CNY".

UPDATE pacotes
SET cambio = ROUND((1 / cambio)::numeric, 4)
WHERE cambio IS NOT NULL
  AND cambio > 0;

UPDATE orcamentos
SET cambio = ROUND((1 / cambio)::numeric, 4)
WHERE cambio IS NOT NULL
  AND cambio > 0;
