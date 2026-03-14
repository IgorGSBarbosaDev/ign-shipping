'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { StatusChip } from '@/components/vendedor/status-chip'
import { MargemBar } from '@/components/vendedor/margem-bar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, AlertTriangle, Loader2 } from 'lucide-react'
import { usePacotes, useCriarPacote } from '@/hooks/vendedor/usePacotes'
import { usePacoteDetalheModal } from '@/hooks/vendedor/usePacoteDetalheModal'
import { formatBRL } from '@/lib/utils'
import type { components } from '@/src/types/api.generated'

type StatusPacote = components['schemas']['StatusPacote']
type StatusFilter = 'TODOS' | StatusPacote

const statusLabels: Record<string, string> = {
  TODOS: 'Todos',
  RASCUNHO: 'Rascunho',
  AGUARDANDO_ENVIO: 'Aguardando',
  EM_VIAGEM: 'Em viagem',
  ALFANDEGA: 'Alfândega',
  TRANSITO: 'Trânsito',
  ENTREGUE: 'Entregue',
  FINALIZADO: 'Finalizado',
}

const statusFilterKeys: StatusFilter[] = [
  'TODOS',
  'RASCUNHO',
  'AGUARDANDO_ENVIO',
  'EM_VIAGEM',
  'ALFANDEGA',
  'TRANSITO',
  'ENTREGUE',
  'FINALIZADO',
]

// ── Zod schema ──────────────────────────────────────────────────────────

const novoPacoteSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipoEnvio: z.enum(['EXPRESSA', 'ECONOMICA']).optional(),
  cambio: z.coerce.number().positive().optional().or(z.literal(0)).or(z.literal(undefined as unknown as number)),
  dataEnvio: z.string().optional(),
  taxaAlfandegariaBrl: z.coerce.number().min(0).default(0),
  observacoes: z.string().optional(),
})

type NovoPacoteForm = z.infer<typeof novoPacoteSchema>

// ── Skeleton ────────────────────────────────────────────────────────────

function PacotesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-full" />
        ))}
      </div>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden p-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-12 w-32" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function PacotesPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('TODOS')
  const apiStatus = statusFilter === 'TODOS' ? undefined : statusFilter

  const { data: pacotes, isLoading, error } = usePacotes(apiStatus)
  const criarMutation = useCriarPacote()
  const { abrirPacote } = usePacoteDetalheModal()

  const [novoPacoteOpen, setNovoPacoteOpen] = useState(false)
  const [apiError, setApiError] = useState('')

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<NovoPacoteForm>({ resolver: zodResolver(novoPacoteSchema) })

  const handleOpenCreate = () => {
    reset({
      nome: '',
      tipoEnvio: undefined,
      cambio: undefined,
      dataEnvio: '',
      taxaAlfandegariaBrl: 0,
      observacoes: '',
    })
    setApiError('')
    setNovoPacoteOpen(true)
  }

  const onSubmitCreate = (formData: NovoPacoteForm) => {
    setApiError('')
    criarMutation.mutate(
      {
        nome: formData.nome,
        tipoEnvio: formData.tipoEnvio || undefined,
        cambio: formData.cambio || undefined,
        dataEnvio: formData.dataEnvio || undefined,
        taxaAlfandegariaBrl: formData.taxaAlfandegariaBrl ?? 0,
        observacoes: formData.observacoes || undefined,
      },
      {
        onSuccess: (created) => {
          setNovoPacoteOpen(false)
          if (created.id) abrirPacote(created.id)
        },
        onError: (err: any) => {
          setApiError(err?.response?.data?.message || 'Erro ao criar pacote')
        },
      },
    )
  }

  // ── Render ────────────────────────────────────────────────────────

  if (isLoading) return <PacotesSkeleton />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400 text-lg">Erro ao carregar pacotes.</p>
      </div>
    )
  }

  const list = pacotes ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Pacotes</h1>
        <Button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo pacote
        </Button>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        {statusFilterKeys.map((key) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`rounded-full px-3 py-1 text-sm font-medium cursor-pointer transition-colors ${
              statusFilter === key
                ? 'bg-blue-600 text-white border border-blue-600'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-600'
            }`}
          >
            {statusLabels[key]}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pacote</TableHead>
                <TableHead>Clientes</TableHead>
                <TableHead>Peso</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Câmbio</TableHead>
                <TableHead>Custo</TableHead>
                <TableHead className="w-[120px]">Margem</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                    Nenhum pacote encontrado
                  </TableCell>
                </TableRow>
              ) : (
                list.map((pacote) => (
                  <TableRow
                    key={pacote.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => pacote.id && abrirPacote(pacote.id)}
                  >
                    <TableCell>
                      <div>
                        <p className="text-xs text-gray-400">#{`PKG-${pacote.id}`}</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {pacote.nome}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {pacote.totalCompradores ?? 0} cliente
                        {(pacote.totalCompradores ?? 0) !== 1 ? 's' : ''}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {(pacote.pesoTotalGramas ?? 0) >= 1000
                          ? `${((pacote.pesoTotalGramas ?? 0) / 1000).toFixed(1)}kg`
                          : `${pacote.pesoTotalGramas ?? 0}g`}
                      </span>
                    </TableCell>
                    <TableCell>
                      {pacote.tipoEnvio ? (
                        <span
                          className={`inline-flex items-center rounded-full text-xs px-2 py-0.5 ${
                            pacote.tipoEnvio === 'EXPRESSA'
                              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                              : 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}
                        >
                          {pacote.tipoEnvio === 'EXPRESSA' ? 'Expressa' : 'Econômica'}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {pacote.cambio ? (
                        <span className="text-sm text-gray-900 dark:text-white">
                          R$1 = ¥{pacote.cambio.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {formatBRL(pacote.custoTotalBrl ?? 0)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="w-[120px]">
                        <MargemBar margem={pacote.margemPercentual ?? 0} />
                      </div>
                    </TableCell>
                    <TableCell>
                      {pacote.status && <StatusChip status={pacote.status} />}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── Modal Novo Pacote ─────────────────────────────────── */}
      <Dialog open={novoPacoteOpen} onOpenChange={setNovoPacoteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo pacote</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitCreate)}>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Nome do pacote <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('nome')}
                  className="w-full h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Pacote Janeiro #1"
                />
                {errors.nome && (
                  <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Tipo de envio
                </label>
                <Controller
                  control={control}
                  name="tipoEnvio"
                  render={({ field }) => (
                    <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v || undefined)}>
                      <SelectTrigger className="w-full h-10">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EXPRESSA">Expressa</SelectItem>
                        <SelectItem value="ECONOMICA">Econômica</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Câmbio atual (R$1 = ¥X)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('cambio')}
                  className="w-full h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 1.24"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Apenas &apos;Nome&apos; é obrigatório. Os demais campos podem ser preenchidos depois.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Data de envio esperada
                </label>
                <input
                  type="date"
                  {...register('dataEnvio')}
                  className="w-full h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Taxa alfandegária R$
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('taxaAlfandegariaBrl')}
                  className="w-full h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Observações
                </label>
                <textarea
                  {...register('observacoes')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Notas adicionais..."
                />
              </div>

              {apiError && (
                <p className="text-red-500 text-sm bg-red-50 dark:bg-red-950/30 p-2 rounded">
                  {apiError}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNovoPacoteOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={criarMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {criarMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar pacote'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
