'use client'

import { useState, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Calculator, Plus, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useFaixasFrete, useCriarFaixa, useCalcularFrete } from '@/hooks/vendedor/useFrete'
import { formatBRL } from '@/lib/utils'
import type { CalcularFreteResponse } from '@/services/freteService'

// ── Zod schemas ─────────────────────────────────────────────────────────

const faixaSchema = z
  .object({
    tipoEnvio: z.enum(['EXPRESSA', 'ECONOMICA'], { required_error: 'Selecione o tipo' }),
    pesoMinGramas: z.coerce.number().int().min(0, 'Mínimo ≥ 0'),
    pesoMaxGramas: z.coerce.number().int().positive('Máximo obrigatório'),
    custoYuan: z.coerce.number().positive('Custo obrigatório'),
  })
  .refine((d) => d.pesoMaxGramas > d.pesoMinGramas, {
    message: 'Peso máximo deve ser maior que mínimo',
    path: ['pesoMaxGramas'],
  })

type FaixaForm = z.infer<typeof faixaSchema>

const CAMBIO_REF = 0.75

const formatBRLFromYuan = (yuan: number) => formatBRL(yuan * CAMBIO_REF)

// ── Faixa Table Component ────────────────────────────────────────────────

function FaixaTable({
  faixas,
  isLoading,
}: {
  faixas: { id?: number; pesoMinGramas: number; pesoMaxGramas: number; custoYuan: number }[]
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <div className="space-y-3 py-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (faixas.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">
        Nenhuma faixa cadastrada para este tipo de envio
      </p>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Peso mínimo</TableHead>
              <TableHead>Peso máximo</TableHead>
              <TableHead>Custo (¥)</TableHead>
              <TableHead>Custo est. (R$)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faixas.map((faixa) => (
              <TableRow key={faixa.id}>
                <TableCell>{faixa.pesoMinGramas}g</TableCell>
                <TableCell>{faixa.pesoMaxGramas}g</TableCell>
                <TableCell>¥ {faixa.custoYuan.toFixed(2)}</TableCell>
                <TableCell>{formatBRLFromYuan(faixa.custoYuan)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-gray-400 mt-3">
        * Custo estimado usa câmbio referência de R$0,75
      </p>
    </>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function TabelaFretePage() {
  const { data: faixas, isLoading, isError } = useFaixasFrete()
  const criarMutation = useCriarFaixa()
  const calcularMutation = useCalcularFrete()

  const [modalOpen, setModalOpen] = useState(false)
  const [calcResultado, setCalcResultado] = useState<CalcularFreteResponse | null>(null)
  const [calcPeso, setCalcPeso] = useState('')
  const [calcTipo, setCalcTipo] = useState<'EXPRESSA' | 'ECONOMICA' | ''>('')
  const [apiError, setApiError] = useState('')

  // Filter faixas by type client-side
  const faixasExpressa = useMemo(
    () =>
      (faixas ?? [])
        .filter((f) => f.tipoEnvio === 'EXPRESSA')
        .sort((a, b) => a.pesoMinGramas - b.pesoMinGramas),
    [faixas],
  )
  const faixasEconomica = useMemo(
    () =>
      (faixas ?? [])
        .filter((f) => f.tipoEnvio === 'ECONOMICA')
        .sort((a, b) => a.pesoMinGramas - b.pesoMinGramas),
    [faixas],
  )

  // Modal form
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<FaixaForm>({
    resolver: zodResolver(faixaSchema),
    defaultValues: {
      tipoEnvio: undefined,
      pesoMinGramas: undefined as unknown as number,
      pesoMaxGramas: undefined as unknown as number,
      custoYuan: undefined as unknown as number,
    },
  })

  const watchedPesoMin = watch('pesoMinGramas')
  const watchedPesoMax = watch('pesoMaxGramas')
  const watchedCusto = watch('custoYuan')
  const previewValido =
    watchedPesoMin >= 0 && watchedPesoMax > watchedPesoMin && watchedCusto > 0

  const onCriarFaixa = (data: FaixaForm) => {
    setApiError('')
    criarMutation.mutate(data, {
      onSuccess: () => {
        reset()
        setModalOpen(false)
      },
      onError: (err: any) =>
        setApiError(err?.response?.data?.message || 'Erro ao criar faixa'),
    })
  }

  const onCalcular = () => {
    if (!calcPeso || !calcTipo) return
    calcularMutation.mutate(
      { tipoEnvio: calcTipo, pesoGramas: parseInt(calcPeso) },
      {
        onSuccess: (data) => setCalcResultado(data),
        onError: () => setCalcResultado(null),
      },
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* ── COLUNA PRINCIPAL ──────────────────────────────── */}
      <div className="flex-1">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tabela de Frete
            </h2>
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar faixa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Nova faixa de frete</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onCriarFaixa)} className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Tipo de envio <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      control={control}
                      name="tipoEnvio"
                      render={({ field }) => (
                        <Select
                          value={field.value ?? ''}
                          onValueChange={(v) => field.onChange(v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EXPRESSA">Expressa</SelectItem>
                            <SelectItem value="ECONOMICA">Econômica</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.tipoEnvio && (
                      <p className="text-red-500 text-xs mt-1">{errors.tipoEnvio.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="pesoMinGramas" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                        Peso mín. (g) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="pesoMinGramas"
                        type="number"
                        min={0}
                        {...register('pesoMinGramas')}
                        className="w-full h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.pesoMinGramas && (
                        <p className="text-red-500 text-xs mt-1">{errors.pesoMinGramas.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="pesoMaxGramas" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                        Peso máx. (g) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="pesoMaxGramas"
                        type="number"
                        min={1}
                        {...register('pesoMaxGramas')}
                        className="w-full h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.pesoMaxGramas && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.pesoMaxGramas.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="custoYuan" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Custo em Yuan <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-0 top-0 h-full flex items-center bg-gray-50 dark:bg-gray-800 text-gray-500 px-3 rounded-l-md border-r border-gray-200 dark:border-gray-700">
                        ¥
                      </span>
                      <input
                        id="custoYuan"
                        type="number"
                        step="0.01"
                        min={0.01}
                        {...register('custoYuan')}
                        className="w-full h-10 pl-12 pr-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {errors.custoYuan && (
                      <p className="text-red-500 text-xs mt-1">{errors.custoYuan.message}</p>
                    )}
                  </div>

                  {previewValido && (
                    <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Esta faixa cobrirá {watchedPesoMin}g a {watchedPesoMax}g por ¥
                        {watchedCusto.toFixed(2)} (≈ {formatBRLFromYuan(watchedCusto)})
                      </p>
                    </div>
                  )}

                  {apiError && (
                    <p className="text-red-500 text-xs bg-red-50 dark:bg-red-950/30 p-2 rounded">
                      {apiError}
                    </p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        reset()
                        setModalOpen(false)
                        setApiError('')
                      }}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={criarMutation.isPending}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {criarMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Adicionar faixa'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isError ? (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
              <p className="text-sm">Erro ao carregar faixas de frete</p>
            </div>
          ) : (
            <Tabs defaultValue="expressa">
              <TabsList className="mb-4">
                <TabsTrigger value="expressa">Expressa</TabsTrigger>
                <TabsTrigger value="economica">Econômica</TabsTrigger>
              </TabsList>

              <TabsContent value="expressa">
                <FaixaTable faixas={faixasExpressa} isLoading={isLoading} />
              </TabsContent>

              <TabsContent value="economica">
                <FaixaTable faixas={faixasEconomica} isLoading={isLoading} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {/* ── SIDEBAR DIREITA — Calculadora ─────────────────── */}
      <div className="w-full lg:w-72">
        <div className="sticky top-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Calculadora rápida</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="calcPeso" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Peso total do pacote
              </label>
              <div className="relative">
                <input
                  id="calcPeso"
                  type="number"
                  placeholder="Ex: 2500"
                  value={calcPeso}
                  onChange={(e) => {
                    setCalcPeso(e.target.value)
                    setCalcResultado(null)
                  }}
                  className="w-full h-10 px-3 pr-8 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  g
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="calcTipo" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Tipo de envio
              </label>
              <Select
                value={calcTipo}
                onValueChange={(v) => {
                  setCalcTipo(v as 'EXPRESSA' | 'ECONOMICA')
                  setCalcResultado(null)
                }}
              >
                <SelectTrigger id="calcTipo">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPRESSA">Expressa</SelectItem>
                  <SelectItem value="ECONOMICA">Econômica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={onCalcular}
              disabled={!calcPeso || !calcTipo || calcularMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {calcularMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Calcular frete
            </Button>

            {calcResultado && (
              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 mt-3">
                <p className="text-sm text-blue-900 dark:text-blue-100 mb-2">
                  Para {calcPeso}g via {calcTipo === 'EXPRESSA' ? 'Expressa' : 'Econômica'}:
                </p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-1">
                  ¥ {(calcResultado.custoYuan ?? 0).toFixed(2)}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                  ≈ {formatBRLFromYuan(calcResultado.custoYuan ?? 0)}
                </p>
                {calcResultado.faixaAplicada && (
                  <p className="text-xs text-blue-400">
                    Faixa: {calcResultado.faixaAplicada.pesoMinGramas}g a{' '}
                    {calcResultado.faixaAplicada.pesoMaxGramas}g
                  </p>
                )}
              </div>
            )}

            {calcularMutation.isError && (
              <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 p-2 rounded">
                Nenhuma faixa encontrada para este peso
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
