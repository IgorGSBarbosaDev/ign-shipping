# Implementacao: Correcao de Estimativa de Custo em Produtos

## Objetivo
Implementar o novo campo de custo de compra em yuan no cadastro de produto e corrigir a regra de estimativa para usar:

- Custo estimado (BRL) = (custoCompraYuan + freteVendedorYuan) / cambioAtual

Tambem foi removida a mensagem de texto de cambio abaixo do valor estimado, mantendo apenas o valor final de custo estimado.

## Pastas alteradas

- backend/src/main/java/br/com/ignshipping/domain/entity
- backend/src/main/java/br/com/ignshipping/dto/vendedor
- backend/src/main/java/br/com/ignshipping/service
- backend/src/main/resources/db/migration
- docs
- frontend/app/vendedor/produtos
- frontend/lib
- frontend/src/types

## Detalhamento por arquivo

## Backend

### backend/src/main/resources/db/migration/V14__adicionar_custo_compra_yuan_produtos.sql
O que mudou:
- Adicao da coluna custo_compra_yuan na tabela produtos.
- Backfill dos registros existentes copiando custo_yuan para custo_compra_yuan.
- Aplicacao de NOT NULL na nova coluna apos o backfill.

Por que:
- Garantir persistencia do novo campo sem quebrar dados antigos.

### backend/src/main/java/br/com/ignshipping/domain/entity/Produto.java
O que mudou:
- Novo atributo custoCompraYuan mapeado para a coluna custo_compra_yuan.

Por que:
- Expor a nova coluna no modelo JPA para leitura e escrita.

### backend/src/main/java/br/com/ignshipping/dto/vendedor/ProdutoRequest.java
O que mudou:
- Novo campo custoCompraYuan no request.
- Validacoes:
  - obrigatorio
  - nao pode ser negativo

Por que:
- Receber o valor de custo de compra vindo do formulario com validacao de regra de negocio.

### backend/src/main/java/br/com/ignshipping/dto/vendedor/ProdutoResponse.java
O que mudou:
- Novo campo custoCompraYuan no response.

Por que:
- Retornar o novo valor para frontend e demais consumidores da API.

### backend/src/main/java/br/com/ignshipping/service/ProdutoService.java
O que mudou:
- Normalizacao defensiva em criar/atualizar:
  - se custoCompraYuan vier nulo, usa custoYuan como fallback.

Por que:
- Evitar persistencia invalida em cenarios de compatibilidade.

## Contrato

### docs/openapi.yaml
O que mudou:
- Schema ProdutoRequest:
  - custoCompraYuan adicionado em properties.
  - custoCompraYuan adicionado em required.
  - validacao minima 0.
- Schema ProdutoResponse:
  - custoCompraYuan adicionado em properties.

Por que:
- Sincronizar contrato entre backend e frontend.

## Frontend

### frontend/src/types/api.generated.ts
O que mudou:
- Regenerado via script a partir do OpenAPI.
- Tipos ProdutoRequest e ProdutoResponse agora incluem custoCompraYuan.

Por que:
- Manter tipagem forte no frontend sem edicao manual de arquivo gerado.

### frontend/lib/utils.ts
O que mudou:
- Novo helper converterYuanParaBrl(valorYuan, cambio).
- Novo helper calcularCustoEstimadoProdutoBrl(custoCompraYuan, freteVendedorYuan, cambio).

Por que:
- Evitar formula duplicada e centralizar logica de conversao/estimativa.

### frontend/app/vendedor/produtos/page.tsx
O que mudou:
- Form schema:
  - novo campo custoCompraYuan com validacao de nao negativo.
- Form UI:
  - novo input numerico Custo de compra (¥) no padrao visual existente.
- Submissao create/update:
  - payload agora envia custoCompraYuan.
- Calculo do preview:
  - usa custoCompraYuan + freteVendedorYuan.
  - usa helper compartilhado para conversao.
  - recalculo reativo por watch dos campos e por cambioAtual.
- Mensagem removida:
  - removido texto de cambio estimado abaixo do valor de custo estimado.
- Tabela:
  - coluna Custo est. (R$) passa a usar helper e custoCompraYuan (com fallback para custoYuan em legado).

Por que:
- Corrigir a estimativa, manter reatividade de UI e garantir consistencia de formula em preview e tabela.

## Nova regra de calculo

A regra agora vive no helper compartilhado:

- Arquivo: frontend/lib/utils.ts
- Funcao: calcularCustoEstimadoProdutoBrl

Formula aplicada:
- custoEstimadoBrl = (custoCompraYuan + freteVendedorYuan) / cambio

## Validacoes executadas

### Backend
- Comando: .\mvnw -DskipTests compile
- Resultado: sucesso

Observacao sobre testes:
- .\mvnw test falhou por problema pre-existente de configuracao de teste de contexto SpringBoot (nao relacionado a esta implementacao).

### Frontend
- Comando: corepack pnpm generate:types
- Resultado: sucesso

- Comando: corepack pnpm build
- Resultado: sucesso

- Comando: corepack pnpm exec tsc --noEmit
- Resultado: falhou por erros pre-existentes em app/auth/cadastro/page.tsx (fora do escopo desta entrega).

## Resumo final
- Campo novo persistido implementado: custoCompraYuan.
- Estimativa corrigida para usar custoCompraYuan + freteVendedorYuan com cambio atual.
- Mensagem de cambio estimado removida do preview.
- Logica de calculo centralizada em helper reutilizavel.
