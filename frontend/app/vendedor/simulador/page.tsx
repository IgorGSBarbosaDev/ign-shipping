'use client'

import { useState, useMemo } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Calculator, Info, RotateCcw, Save, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useOrcamentos, useSalvarOrcamento } from '@/hooks/vendedor/useOrcamentos'
import { formatBRL, formatDate } from '@/lib/utils'
import type { components } from '@/src/types/api.generated'

type Categoria = components['schemas']['Categoria']

// ── Zod schema ──────────────────────────────────────────────────────────

const simuladorSchema = z.object({
  nomeProduto: z.string().min(1, 'Nome é obrigatório'),
  categoria: z.enum(['ROUPAS', 'TENIS', 'ELETRONICO', 'OUTROS']).optional(),
  pesoGramas: z.coerce.number().int().positive('Peso é obrigatório'),
  custoYuan: z.coerce.number().positive('Preço do produto é obrigatório'),
  freteVendedorYuan: z.coerce.number().min(0).default(0),
  freteInternacionalYuan: z.coerce.number().min(0).default(0),
  taxaCssbuyYuan: z.coerce.number().min(0).default(0),
  cambio: z.coerce.number().positive('Câmbio é obrigatório').default(1.24),
  qtdItensNoPacote: z.coerce.number().int().positive('Quantidade deve ser ao menos 1').default(1),
  estimativaTaxaReceita: z.coerce.number().min(0).default(0),
  precoVendaBrl: z.coerce.number().min(0).optional().or(z.literal(0)),
  margemDesejada: z.coerce.number().min(0).max(99).optional().or(z.literal(0)),
})

type SimuladorForm = z.infer<typeof simuladorSchema>

// ── Local calculation (mirrors backend) ─────────────────────────────────

interface Resultado {
  custoProdutoBrl: number
  custeFreteVendedorBrl: number
  custeFreteInternacionalBrl: number
  custoCssbuyBrl: number
  taxaAlfandegariaBrl: number
  custoTotalBrl: number
  precoVendaBrl: number
  lucroBrl: number
  margemPercentual: number
  precoSugeridoMargem20: number
  precoSugeridoMargem30: number
}

function calcularLocal(vals: Partial<SimuladorForm>): Resultado {
  const cambio = Number(vals.cambio) || 0
  const divisor = cambio > 0 ? cambio : 1
  const custoProdutoBrl = (Number(vals.custoYuan) || 0) / divisor
  const custeFreteVendedorBrl = (Number(vals.freteVendedorYuan) || 0) / divisor
  const custeFreteInternacionalBrl = (Number(vals.freteInternacionalYuan) || 0) / divisor
  const custoCssbuyBrl = (Number(vals.taxaCssbuyYuan) || 0) / divisor
  const qtdItens = Number(vals.qtdItensNoPacote) || 1
  const estimativaTaxa = Number(vals.estimativaTaxaReceita) || 0
  const taxaAlf = qtdItens > 0 ? estimativaTaxa / qtdItens : 0

  const custoTotalBrl =
    custoProdutoBrl + custeFreteVendedorBrl + custeFreteInternacionalBrl + custoCssbuyBrl + taxaAlf

  let precoVendaBrl = Number(vals.precoVendaBrl) || 0
  const margemDesejada = Number(vals.margemDesejada) || 0

  // Se margem preenchida, calcular preço de venda automaticamente
  if (margemDesejada > 0 && custoTotalBrl > 0) {
    precoVendaBrl = custoTotalBrl / (1 - margemDesejada / 100)
  }

  const lucroBrl = precoVendaBrl - custoTotalBrl
  const margemPercentual =
    custoTotalBrl > 0 && precoVendaBrl > 0 ? (lucroBrl / precoVendaBrl) * 100 : 0

  const precoSugeridoMargem20 = custoTotalBrl > 0 ? custoTotalBrl / 0.8 : 0
  const precoSugeridoMargem30 = custoTotalBrl > 0 ? custoTotalBrl / 0.7 : 0

  return {
    custoProdutoBrl,
    custeFreteVendedorBrl,
    custeFreteInternacionalBrl,
    custoCssbuyBrl,
    taxaAlfandegariaBrl: taxaAlf,
    custoTotalBrl,
    precoVendaBrl,
    lucroBrl,
    margemPercentual,
    precoSugeridoMargem20,
    precoSugeridoMargem30,
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────

const categoriaBadgeColors: Record<string, string> = {
  ROUPAS: 'bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300',
  TENIS: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300',
  ELETRONICO: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
  OUTROS: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
}

const getMargemColor = (margem: number) => {
  if (margem < 15) return 'text-red-600'
  if (margem < 25) return 'text-amber-600'
  return 'text-green-600'
}

// ── Yuan input helper ───────────────────────────────────────────────────

function YuanInput({
  id,
  register,
  label,
  tooltip,
}: {
  id: string
  register: ReturnType<typeof useForm<SimuladorForm>>['register']
  label: string
  tooltip?: string
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="relative">
        <span className="absolute left-0 top-0 h-full flex items-center bg-gray-50 dark:bg-gray-800 text-gray-500 px-3 rounded-l-md border-r border-gray-200 dark:border-gray-700">
          ¥
        </span>
        <input
          id={id}
          type="number"
          step="0.01"
          {...register(id as keyof SimuladorForm)}
          className="w-full h-10 pl-12 pr-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function SimuladorPage() {
  const { data: historico, isLoading: historicoLoading } = useOrcamentos()
  const salvarMutation = useSalvarOrcamento()
  const [apiError, setApiError] = useState('')
  const [modoPreco, setModoPreco] = useState<'venda' | 'margem'>('venda')

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SimuladorForm>({
    resolver: zodResolver(simuladorSchema),
    defaultValues: {
      nomeProduto: '',
      categoria: undefined,
      pesoGramas: undefined as unknown as number,
      custoYuan: undefined as unknown as number,
      freteVendedorYuan: 0,
      freteInternacionalYuan: 0,
      taxaCssbuyYuan: 0,
      cambio: 1.24,
      qtdItensNoPacote: 1,
      estimativaTaxaReceita: 0,
      precoVendaBrl: 0,
      margemDesejada: 0,
    },
  })

  // Watch all fields for real-time calculation
  const watched = useWatch({ control })

  const resultado = useMemo(() => calcularLocal(watched as Partial<SimuladorForm>), [watched])
  const temDados = resultado.custoTotalBrl > 0

  const limpar = () => {
    const currentCambio = watched.cambio ?? 1.24
    reset({
      nomeProduto: '',
      categoria: undefined,
      pesoGramas: 0,
      custoYuan: 0,
      freteVendedorYuan: 0,
      freteInternacionalYuan: 0,
      taxaCssbuyYuan: 0,
      cambio: currentCambio,
      qtdItensNoPacote: 1,
      estimativaTaxaReceita: 0,
      precoVendaBrl: 0,
      margemDesejada: 0,
    })
    setApiError('')
  }

  const onSalvar = (data: SimuladorForm) => {
    setApiError('')
    salvarMutation.mutate(
      {
        nomeProduto: data.nomeProduto,
        categoria: data.categoria,
        custoYuan: data.custoYuan,
        freteVendedorYuan: data.freteVendedorYuan ?? 0,
        freteInternacionalYuan: data.freteInternacionalYuan ?? 0,
        taxaCssbuyYuan: data.taxaCssbuyYuan ?? 0,
        taxaAlfandegariaBrl: (data.qtdItensNoPacote ?? 1) > 0
          ? (data.estimativaTaxaReceita ?? 0) / (data.qtdItensNoPacote ?? 1)
          : 0,
        pesoGramas: data.pesoGramas,
        cambio: data.cambio,
        precoVendaBrl: resultado.precoVendaBrl || undefined,
      },
      {
        onSuccess: () => limpar(),
        onError: (err: any) =>
          setApiError(err?.response?.data?.message || 'Erro ao salvar simulação'),
      },
    )
  }

  const historicoRecente = (historico ?? []).slice(0, 10)

  return (
    <form onSubmit={handleSubmit(onSalvar)}>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── COLUNA ESQUERDA — Formulário ──────────────────── */}
        <div className="flex-1 space-y-6">
          {/* Seção: Câmbio */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Câmbio
            </h3>
            <div className="h-px bg-gray-200 dark:bg-gray-800 mb-4" />

            <div>
              <div className="flex items-center gap-2 mb-1">
                <label htmlFor="cambio" className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                  Câmbio atual (R$1 = ¥X) <span className="text-red-500">*</span>
                </label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-700 cursor-help"
                        aria-label="Explicação do câmbio"
                      >
                        !
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-xs">
                        Exemplo: se 1 BRL = 1,24 CNY, ao inserir 100 BRL o sistema considera 124 CNY.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <input
                id="cambio"
                type="number"
                step="0.01"
                {...register('cambio', { valueAsNumber: true })}
                className="w-full h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1.24"
              />
              {errors.cambio && (
                <p className="text-red-500 text-xs mt-1">{errors.cambio.message}</p>
              )}
            </div>
          </div>

          {/* Seção: Produto */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Produto
            </h3>
            <div className="h-px bg-gray-200 dark:bg-gray-800 mb-4" />

            <div className="space-y-4">
              <div>
                <label htmlFor="nomeProduto" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Nome do produto <span className="text-red-500">*</span>
                </label>
                <input
                  id="nomeProduto"
                  {...register('nomeProduto')}
                  className="w-full h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Camiseta Oversized"
                />
                {errors.nomeProduto && (
                  <p className="text-red-500 text-xs mt-1">{errors.nomeProduto.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Categoria
                </label>
                <Controller
                  control={control}
                  name="categoria"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ''}
                      onValueChange={(v) => field.onChange(v || undefined)}
                    >
                      <SelectTrigger className="w-full h-10">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ROUPAS">Roupas</SelectItem>
                        <SelectItem value="TENIS">Tênis</SelectItem>
                        <SelectItem value="ELETRONICO">Eletrônico</SelectItem>
                        <SelectItem value="OUTROS">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div>
                <label htmlFor="pesoGramas" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Peso em gramas <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="pesoGramas"
                    type="number"
                    {...register('pesoGramas', { valueAsNumber: true })}
                    className="w-full h-10 px-3 pr-8 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 350"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    g
                  </span>
                </div>
                {errors.pesoGramas && (
                  <p className="text-red-500 text-xs mt-1">{errors.pesoGramas.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Seção: Custos em Yuan */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Custos em Yuan (¥)
            </h3>
            <div className="h-px bg-gray-200 dark:bg-gray-800 mb-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <YuanInput id="custoYuan" register={register} label="Preço do produto *" />
              <YuanInput id="freteVendedorYuan" register={register} label="Frete vendedor → armazém" />
              <YuanInput
                id="freteInternacionalYuan"
                register={register}
                label="Frete internacional proporcional"
                tooltip="Informe o valor proporcional ao peso deste item no pacote"
              />
              <YuanInput
                id="taxaCssbuyYuan"
                register={register}
                label="Taxa CSSBuy proporcional"
                tooltip="CSSBuy cobra ¥30/pacote. Informe a proporção deste item"
              />
            </div>
            {errors.custoYuan && (
              <p className="text-red-500 text-xs mt-2">{errors.custoYuan.message}</p>
            )}
          </div>

          {/* Seção: Impostos */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Impostos
            </h3>
            <div className="h-px bg-gray-200 dark:bg-gray-800 mb-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="qtdItensNoPacote" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Quantidade de itens no pacote <span className="text-red-500">*</span>
                </label>
                <input
                  id="qtdItensNoPacote"
                  type="number"
                  step="1"
                  min="1"
                  {...register('qtdItensNoPacote', { valueAsNumber: true })}
                  className="w-full h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Quantos itens compõem o pacote (para dividir a taxa)
                </p>
                {errors.qtdItensNoPacote && (
                  <p className="text-red-500 text-xs mt-1">{errors.qtdItensNoPacote.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="estimativaTaxaReceita" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Estimativa de taxa da Receita (R$)
                </label>
                <input
                  id="estimativaTaxaReceita"
                  type="number"
                  step="0.01"
                  {...register('estimativaTaxaReceita', { valueAsNumber: true })}
                  className="w-full h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Valor total estimado que a Receita irá cobrar pelo pacote
                </p>
              </div>
            </div>

            {/* Taxa alfandegária calculada (readonly) */}
            <div className="mt-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-4 py-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Taxa alfandegária por item:
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3.5 h-3.5 text-amber-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-xs">Estimativa da taxa ÷ quantidade de itens no pacote</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
                  {formatBRL(resultado.taxaAlfandegariaBrl)}
                </span>
              </div>
            </div>
          </div>

          {/* Seção: Precificação */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Precificação (opcional)
            </h3>
            <div className="h-px bg-gray-200 dark:bg-gray-800 mb-4" />

            {/* Toggle de modo */}
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-4">
              <button
                type="button"
                onClick={() => {
                  setModoPreco('venda')
                  setValue('margemDesejada', 0)
                }}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  modoPreco === 'venda'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                Por valor de venda
              </button>
              <button
                type="button"
                onClick={() => {
                  setModoPreco('margem')
                  setValue('precoVendaBrl', 0)
                }}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  modoPreco === 'margem'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                Por margem desejada
              </button>
            </div>

            {modoPreco === 'venda' ? (
              <div>
                <label htmlFor="precoVendaBrl" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Preço de venda (R$)
                </label>
                <input
                  id="precoVendaBrl"
                  type="number"
                  step="0.01"
                  {...register('precoVendaBrl', { valueAsNumber: true })}
                  className="w-full h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Informe o preço que deseja cobrar"
                />
                <p className="text-xs text-gray-400 mt-1">
                  O sistema calculará a margem resultante
                </p>
              </div>
            ) : (
              <div>
                <label htmlFor="margemDesejada" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Margem desejada (%)
                </label>
                <input
                  id="margemDesejada"
                  type="number"
                  step="0.1"
                  {...register('margemDesejada', { valueAsNumber: true })}
                  className="w-full h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 25"
                />
                <p className="text-xs text-gray-400 mt-1">
                  O sistema calculará o preço de venda ideal
                </p>
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={limpar}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Limpar
            </Button>
            <Button
              type="submit"
              disabled={salvarMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {salvarMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar simulação
                </>
              )}
            </Button>
          </div>

          {apiError && (
            <p className="text-red-500 text-sm bg-red-50 dark:bg-red-950/30 p-3 rounded-lg">
              {apiError}
            </p>
          )}

          {/* ── HISTÓRICO ────────────────────────────────────── */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Histórico de simulações
              </h3>
              <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium px-2 py-1 rounded">
                {historicoRecente.length} simulações
              </span>
            </div>

            {historicoLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : historicoRecente.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                Nenhuma simulação salva ainda
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Custo Total</TableHead>
                      <TableHead>Margem (%)</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historicoRecente.map((sim) => (
                      <TableRow key={sim.id}>
                        <TableCell className="font-medium">{sim.nomeProduto}</TableCell>
                        <TableCell>
                          {sim.categoria ? (
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded ${
                                categoriaBadgeColors[sim.categoria] ?? categoriaBadgeColors.OUTROS
                              }`}
                            >
                              {sim.categoria}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>{formatBRL(sim.custoTotalBrl ?? 0)}</TableCell>
                        <TableCell>
                          <span className={getMargemColor(sim.margemPercentual ?? 0)}>
                            {(sim.margemPercentual ?? 0).toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {sim.dataCriacao ? formatDate(sim.dataCriacao) : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        {/* ── COLUNA DIREITA — Card de Resultado (sticky) ──── */}
        <div className="w-full lg:w-[340px]">
          <div className="sticky top-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Resultado</h3>
            </div>

            {!temDados ? (
              <div className="text-center py-12">
                <Calculator className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-sm text-gray-400">
                  Preencha os campos ao lado para ver o resultado
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Produto:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatBRL(resultado.custoProdutoBrl)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Frete vendedor:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatBRL(resultado.custeFreteVendedorBrl)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Frete internacional:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatBRL(resultado.custeFreteInternacionalBrl)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Taxa CSSBuy:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatBRL(resultado.custoCssbuyBrl)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Taxa alfandegária:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatBRL(resultado.taxaAlfandegariaBrl)}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-gray-200 dark:bg-gray-800" />

                <div className="bg-blue-50 dark:bg-blue-950 rounded-lg px-3 py-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-blue-900 dark:text-blue-100">
                      CUSTO TOTAL:
                    </span>
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                      {formatBRL(resultado.custoTotalBrl)}
                    </span>
                  </div>
                </div>

                {resultado.precoVendaBrl > 0 && (
                  <>
                    <div className="h-px bg-gray-200 dark:bg-gray-800" />

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Preço de venda:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatBRL(resultado.precoVendaBrl)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Lucro bruto:</span>
                      <span
                        className={`font-medium ${
                          resultado.lucroBrl >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {formatBRL(resultado.lucroBrl)}
                      </span>
                    </div>

                    <div className="h-px bg-gray-200 dark:bg-gray-800" />

                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-1">MARGEM</p>
                      <p
                        className={`text-2xl font-bold ${getMargemColor(resultado.margemPercentual)}`}
                      >
                        {resultado.margemPercentual.toFixed(1)}%
                      </p>
                    </div>
                  </>
                )}

                {/* Preços sugeridos */}
                {resultado.custoTotalBrl > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mt-4">
                    <p className="text-xs text-gray-400 font-semibold mb-2">
                      PREÇOS SUGERIDOS
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">
                          Para 20% de margem:
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatBRL(resultado.precoSugeridoMargem20)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">
                          Para 30% de margem:
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatBRL(resultado.precoSugeridoMargem30)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      custo / 0,80 | custo / 0,70
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
