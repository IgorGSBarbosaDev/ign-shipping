# Backlog de Melhorias — Simulador de Custo

## Contexto técnico

- **Arquivo principal:** `frontend/app/vendedor/simulador/page.tsx` (672 linhas)
- **Hook de dados:** `frontend/hooks/vendedor/useOrcamentos.ts`
- **Gerenciamento de formulário:** React Hook Form + Zod (`simuladorSchema`)
- **Cálculo em tempo real:** função `calcularLocal()` alimentada por `useWatch({ control })`
- **Backend:** Spring Boot — endpoint de orçamentos via `orcamentoService.ts`

---

## Metodologia recomendada para resolução por IA

Divida o trabalho em **duas categorias** e resolva nesta ordem:

1. **BUGS** — Cada bug deve ser um prompt isolado, com o trecho de código atual e a correção esperada. São mudanças pequenas, sem risco de regressão ampla.
2. **FEATURES** — Cada feature deve começar com um prompt de planejamento de UI/schema, seguido de um prompt de implementação. Requerem decisões de design antes de código.

> **Regra geral para prompts:** sempre inclua o trecho de código relevante no contexto do prompt. Nunca peça para a IA "achar o lugar certo" — aponte o arquivo, a função e o trecho exato.

---

## Parte 1 — Bugs (prioridade alta)

### BUG-001 — Botão "Limpar" não reseta `pesoGramas` e `custoYuan`

**Arquivo:** `frontend/app/vendedor/simulador/page.tsx`

**Causa raiz:** A função `limpar` chama `reset()` passando `undefined as unknown as number` para `pesoGramas` e `custoYuan`. O React Hook Form não consegue limpar inputs `type="number"` com valor `undefined` dessa forma — o campo visual permanece com o último valor digitado.

**Código atual (função `limpar`):**
```tsx
const limpar = () => {
  reset({
    nomeProduto: '',
    categoria: undefined,
    pesoGramas: undefined as unknown as number,   // ← não limpa o input
    custoYuan: undefined as unknown as number,    // ← não limpa o input
    freteVendedorYuan: 0,
    freteInternacionalYuan: 0,
    taxaCssbuyYuan: 0,
    cambio: 0.75,                // ← reseta cambio para o default, mas deveria preservar o valor atual
    taxaAlfandegariaBrl: 0,
    precoVendaBrl: 0,
    margemDesejada: 0,
  })
  setApiError('')
}
```

**Comportamento esperado:**
- `pesoGramas` e `custoYuan` devem ser resetados para `0` (ou string vazia `''`) para que o campo visual limpe corretamente.
- O valor de `cambio` deve ser **preservado** (não resetado), pois o usuário geralmente mantém o câmbio e simula produtos diferentes.

**Correção esperada:**
```tsx
const limpar = () => {
  const currentCambio = watched.cambio ?? 0.75
  reset({
    nomeProduto: '',
    categoria: undefined,
    pesoGramas: 0,
    custoYuan: 0,
    freteVendedorYuan: 0,
    freteInternacionalYuan: 0,
    taxaCssbuyYuan: 0,
    cambio: currentCambio,          // ← preserva o câmbio atual
    taxaAlfandegariaBrl: 0,
    precoVendaBrl: 0,
    margemDesejada: 0,
  })
  setApiError('')
}
```

---

### BUG-002 — Taxa alfandegária causa concatenação de valores ao ser preenchida após o câmbio

**Arquivo:** `frontend/app/vendedor/simulador/page.tsx`

**Passos para reproduzir:**
1. Preencha o campo **Câmbio** (ex: `0.75`).
2. Em seguida, preencha o campo **Taxa alfandegária** (ex: `68.80`).

**Comportamento atual:** O valor da taxa é concatenado em vez de somado. Exemplo:
```
Digitado:  68,80
Calculado: 6.810,80   ← valor corrompido
```

**Causa raiz provável:** O input de `taxaAlfandegariaBrl` usa `{...register('taxaAlfandegariaBrl')}` sem opção `valueAsNumber: true`. Isso faz com que o React Hook Form trate o valor como `string` internamente. Quando `calcularLocal` executa `vals.taxaAlfandegariaBrl || 0`, o JS aplica coerção de tipo e, dependendo do estado do formulário no momento do re-render disparado pelo cambio, o valor pode ser tratado como string e concatenado com outro campo numérico.

**Código atual:**
```tsx
// Registro do campo (sem valueAsNumber)
{...register('taxaAlfandegariaBrl')}

// Uso na função calcularLocal
const taxaAlf = vals.taxaAlfandegariaBrl || 0
```

**Correção esperada:**
```tsx
// Forçar coerção numérica no registro
{...register('taxaAlfandegariaBrl', { valueAsNumber: true })}

// Garantir segurança na função calcularLocal
const taxaAlf = Number(vals.taxaAlfandegariaBrl) || 0
```

Aplicar o mesmo padrão (`valueAsNumber: true`) para todos os campos numéricos que usam `register()` diretamente (fora do `YuanInput`): `cambio`, `pesoGramas`, `precoVendaBrl`, `margemDesejada`.

---

## Parte 2 — Features (planejamento necessário)

### FEATURE-001 — Separar seção "Câmbio e Impostos" em dois blocos distintos

**Arquivo:** `frontend/app/vendedor/simulador/page.tsx`

**Motivação:** Câmbio e taxa alfandegária são conceitos e fontes de dados distintos. Misturá-los em um grid de 2 colunas dificulta a leitura e o preenchimento sequencial.

**Estado atual da seção no JSX:**
```tsx
{/* Seção: Câmbio e Impostos */}
<div className="bg-white ...">
  <h3>Câmbio e Impostos</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Campo: cambio */}
    {/* Campo: taxaAlfandegariaBrl */}
  </div>
</div>
```

**Label incorreto no campo câmbio:**
```tsx
<label htmlFor="cambio">Câmbio * (¥→R$)</label>
{/* texto de apoio */}
<p>Ex: 0.75 significa ¥1 = R$0,75</p>
```
O label diz `¥→R$` mas semanticamente o usuário insere quantos reais equivalem a 1 yuan, ou seja, a direção contextual do câmbio está correta no texto de apoio mas o label induz erro. Deve ser alterado para `R$ por ¥` ou `R$/¥`.

**Reestruturação proposta:**

Dividir em dois cards/blocos separados, nesta ordem no layout:

**Bloco 1 — Câmbio** (deve aparecer ANTES de "Custos em Yuan", pois é pré-requisito lógico):
- Campo: `cambio` (label: `Câmbio atual (R$/¥)`)

**Bloco 2 — Impostos** (substituir o campo manual `taxaAlfandegariaBrl` por campos calculados):

| Campo | Tipo | Descrição |
|---|---|---|
| `qtdItensNoPacote` | `number` | Quantidade de itens que compõem o pacote (divisor da taxa) |
| `estimativaTaxaReceita` | `number` (R$) | Valor total estimado que a Receita Federal cobrará pelo pacote |
| `taxaAlfandegariaBrl` | calculado (readonly) | Resultado de `estimativaTaxaReceita ÷ qtdItensNoPacote` |

> O campo `taxaAlfandegariaBrl` deixa de ser um input manual e passa a ser um valor calculado derivado dos dois campos acima. Na função `calcularLocal`, ele continua sendo utilizado da mesma forma.

**Novos campos a adicionar ao Zod schema:**
```ts
qtdItensNoPacote: z.coerce.number().int().positive().default(1),
estimativaTaxaReceita: z.coerce.number().min(0).default(0),
// taxaAlfandegariaBrl passa a ser derivado, não mais campo de input direto
```

---

### FEATURE-002 — Modo de precificação por alternância (toggle)

**Arquivo:** `frontend/app/vendedor/simulador/page.tsx`

**Motivação:** Os campos `precoVendaBrl` e `margemDesejada` são mutuamente exclusivos no cálculo (um deriva do outro), mas ambos ficam visíveis simultaneamente, gerando confusão. A lógica de `disabled` atual já tenta resolver isso, mas é inelegante.

**Estado atual no JSX:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* precoVendaBrl: disabled se margemDesejada > 0 */}
  {/* margemDesejada: sempre ativo */}
</div>
```

**Implementação proposta:**

1. Adicionar um estado local:
```tsx
const [modoPreco, setModoPreco] = useState<'venda' | 'margem'>('venda')
```

2. Substituir o grid atual por um bloco com toggle (usar componente existente `button-group.tsx` ou `ToggleGroup` do Radix):
```tsx
{/* Toggle: [ Por valor de venda ] [ Por margem desejada ] */}
```

3. Renderizar condicionalmente apenas o input correspondente ao modo selecionado.

4. Ao trocar de modo, limpar o campo do modo anterior (via `setValue`).

**Critério de aceite:**
- Apenas um dos dois campos está visível/ativo por vez.
- A troca de modo limpa o valor do campo anterior.
- O cálculo em `calcularLocal` não precisa mudar — já respeita a precedência atual.

---

### FEATURE-003 — Reordenar seções do formulário

**Arquivo:** `frontend/app/vendedor/simulador/page.tsx`

**Motivação:** A ordem atual força o usuário a descer até "Câmbio e Impostos" para definir o câmbio, que é necessário para interpretar todos os custos em yuan acima.

**Ordem atual dos cards:**
1. Produto
2. Custos em Yuan (¥)
3. Câmbio e Impostos
4. Precificação

**Ordem proposta (após FEATURE-001):**
1. Câmbio ← movido para o topo
2. Produto
3. Custos em Yuan (¥)
4. Impostos
5. Precificação

Esta é uma mudança de ordem de JSX apenas — sem impacto no schema ou na lógica de cálculo.

---

### FEATURE-004 — Renomear categoria `CAMISA` para `ROUPAS`

**Arquivos afetados:**
- `frontend/app/vendedor/simulador/page.tsx`
- `frontend/src/types/api.generated.ts` (verificar se `Categoria` é um enum gerado do backend)
- `backend/src/main/java/.../Categoria.java` (provável enum no backend)

**Motivação:** `CAMISA` é específico demais. `ROUPAS` representa melhor uma categoria de produto.

**Impacto:** mudança de breaking no enum — requer migração de dados existentes no banco se já houver registros salvos com `categoria = 'CAMISA'`. Verificar antes de implementar.

**Mudança no JSX (simulador):**
```tsx
// Antes
<SelectItem value="CAMISA">Camisa</SelectItem>

// Depois
<SelectItem value="ROUPAS">Roupas</SelectItem>
```

**Mudança no helper de cores:**
```tsx
// Antes
const categoriaBadgeColors = {
  CAMISA: 'bg-pink-100 ...',
  ...
}

// Depois
const categoriaBadgeColors = {
  ROUPAS: 'bg-pink-100 ...',
  ...
}
```

> Se o backend usa um enum Java `Categoria`, o valor `CAMISA` deve ser renomeado para `ROUPAS` no enum e uma migration Flyway deve ser criada para atualizar registros existentes.
