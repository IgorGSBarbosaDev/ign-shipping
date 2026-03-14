'use client'

import { useState, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusChip } from './status-chip'
import { cn, formatBRL, formatDate, formatYuan } from '@/lib/utils'
import { X, Check, ChevronRight, Pencil, Plus, Loader2, AlertTriangle } from 'lucide-react'
import { usePacoteDetalheModal } from '@/hooks/vendedor/usePacoteDetalheModal'
import { usePacoteDetalhe } from '@/hooks/vendedor/usePacoteDetalhe'
import { useAtualizarStatusPacote } from '@/hooks/vendedor/usePacotes'
import { useAdicionarItem, useAtualizarItem } from '@/hooks/vendedor/useItens'
import { useCompradores } from '@/hooks/vendedor/useCompradores'
import { useProdutos } from '@/hooks/vendedor/useProdutos'
import type { components } from '@/src/types/api.generated'

// ── Types ───────────────────────────────────────────────────────────────

type StatusPacote = components['schemas']['StatusPacote']
type StatusPagamento = components['schemas']['StatusPagamento']
type ItensPorCompradorResponse = components['schemas']['ItensPorCompradorResponse']
type OrderItemResponse = components['schemas']['OrderItemResponse']

const statusFlow: StatusPacote[] = [
  'RASCUNHO',
  'AGUARDANDO_ENVIO',
  'EM_VIAGEM',
  'ALFANDEGA',
  'TRANSITO',
  'ENTREGUE',
  'FINALIZADO',
]

const statusLabels: Record<StatusPacote, string> = {
  RASCUNHO: 'Pedidos',
  AGUARDANDO_ENVIO: 'Armazém',
  EM_VIAGEM: 'Em viagem',
  ALFANDEGA: 'Alfândega',
  TRANSITO: 'Trânsito',
  ENTREGUE: 'Entregue',
  FINALIZADO: 'Finalizado',
}

// ── Add-item form ───────────────────────────────────────────────────────

const addItemSchema = z.object({
  compradorId: z.coerce.number().int().positive('Selecione um comprador'),
  produtoId: z.coerce.number().int().positive('Selecione um produto'),
  quantidade: z.coerce.number().int().min(1).default(1),
  precoVendaBrl: z.coerce.number().positive('Informe o preço de venda'),
  statusPagamento: z.enum(['PENDENTE', 'PAGO', 'PARCIAL']).optional(),
})

type AddItemForm = z.infer<typeof addItemSchema>

// ── Skeletons ───────────────────────────────────────────────────────────

function ModalSkeleton() {
  return (
    <div className="space-y-6 py-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-6 w-60" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex items-center gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center flex-1">
            <Skeleton className="w-8 h-8 rounded-full" />
            {i < 6 && <Skeleton className="h-0.5 flex-1 mx-1" />}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

// ── Global component that reads from context ────────────────────────────

export function PacoteDetalheModalGlobal() {
  const { pacoteIdAberto, fecharPacote } = usePacoteDetalheModal()

  return (
    <PacoteDetalheModalInner
      pacoteId={pacoteIdAberto}
      open={pacoteIdAberto != null}
      onClose={fecharPacote}
    />
  )
}

// ── Inner modal ─────────────────────────────────────────────────────────

function PacoteDetalheModalInner({
  pacoteId,
  open,
  onClose,
}: {
  pacoteId: number | null
  open: boolean
  onClose: () => void
}) {
  const { detalhe, itens, resumoFinanceiro } = usePacoteDetalhe(pacoteId)
  const advanceStatusMutation = useAtualizarStatusPacote()

  const [showAdvanceDialog, setShowAdvanceDialog] = useState(false)
  const [addItemOpen, setAddItemOpen] = useState(false)

  const pacote = detalhe.data
  const fin = resumoFinanceiro.data
  const clientesList = itens.data ?? []

  const isLoadingModal =
    detalhe.isLoading || itens.isLoading || resumoFinanceiro.isLoading
  const isError = detalhe.isError || itens.isError || resumoFinanceiro.isError

  // Timeline helpers
  const currentStatus = pacote?.status
  const currentStatusIndex = currentStatus ? statusFlow.indexOf(currentStatus) : -1
  const nextStatus =
    currentStatusIndex >= 0 && currentStatusIndex < statusFlow.length - 1
      ? statusFlow[currentStatusIndex + 1]
      : null
  const isFinalized = currentStatus === 'FINALIZADO'

  const handleAdvanceStatus = () => {
    if (!pacoteId || !nextStatus) return
    advanceStatusMutation.mutate(
      { id: pacoteId, status: nextStatus },
      { onSuccess: () => setShowAdvanceDialog(false) },
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {isLoadingModal ? (
            <ModalSkeleton />
          ) : isError || !pacote ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertTriangle className="w-10 h-10 text-red-400 mb-3" />
              <p className="text-gray-600 dark:text-gray-400">Erro ao carregar detalhes do pacote.</p>
              <Button variant="outline" className="mt-4" onClick={onClose}>
                Fechar
              </Button>
            </div>
          ) : (
            <>
              {/* ── HEADER ────────────────────────────────────── */}
              <div className="sticky top-0 bg-white dark:bg-gray-900 pb-4 border-b border-gray-200 dark:border-gray-800 z-10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 mb-1">
                      #{`PKG-${pacote.id}`} · {pacote.totalItens ?? 0} itens ·{' '}
                      {(pacote.pesoTotalGramas ?? 0) >= 1000
                        ? `${((pacote.pesoTotalGramas ?? 0) / 1000).toFixed(1)}kg`
                        : `${pacote.pesoTotalGramas ?? 0}g`}
                    </p>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {pacote.nome}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentStatus && <StatusChip status={currentStatus} />}
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* ── SEÇÃO 1 — Timeline ────────────────────────── */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Progresso do envio
                  </h3>
                  {!isFinalized && nextStatus && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                      onClick={() => setShowAdvanceDialog(true)}
                    >
                      Avançar status
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>

                <div className="flex items-center">
                  {statusFlow.map((status, index) => {
                    const isCompleted = index < currentStatusIndex
                    const isCurrent = index === currentStatusIndex
                    const isFuture = index > currentStatusIndex
                    const isLast = index === statusFlow.length - 1

                    return (
                      <div key={status} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                              isCompleted && 'bg-green-500',
                              isCurrent && 'bg-blue-600 animate-pulse',
                              isFuture &&
                                'border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900',
                            )}
                          >
                            {isCompleted && <Check className="w-4 h-4 text-white" />}
                            {isCurrent && (
                              <span className="text-xs font-bold text-white">{index + 1}</span>
                            )}
                            {isFuture && (
                              <span className="text-xs text-gray-400">{index + 1}</span>
                            )}
                          </div>
                          <p
                            className={cn(
                              'text-xs mt-2 text-center whitespace-nowrap',
                              isCompleted && 'text-green-600 dark:text-green-400 font-medium',
                              isCurrent && 'text-blue-600 dark:text-blue-400 font-semibold',
                              isFuture && 'text-gray-400',
                            )}
                          >
                            {statusLabels[status]}
                          </p>
                        </div>
                        {!isLast && (
                          <div
                            className={cn(
                              'h-0.5 flex-1 mx-1 transition-all',
                              index < currentStatusIndex
                                ? 'bg-green-400'
                                : 'bg-gray-200 dark:bg-gray-700',
                            )}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* ── SEÇÃO 2 — Resumo Financeiro ────────────── */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Resumo financeiro
                </h3>

                {resumoFinanceiro.isLoading ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20" />
                      ))}
                    </div>
                  </div>
                ) : fin ? (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
                        <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Custo total</p>
                        <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                          {formatBRL(fin.custoTotalBrl ?? 0)}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Receita total</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatBRL(fin.receitaTotalBrl ?? 0)}
                        </p>
                      </div>
                      <div
                        className={cn(
                          'rounded-lg p-3',
                          (fin.lucroBrl ?? 0) >= 0
                            ? 'bg-green-50 dark:bg-green-950'
                            : 'bg-red-50 dark:bg-red-950',
                        )}
                      >
                        <p
                          className={cn(
                            'text-xs mb-1',
                            (fin.lucroBrl ?? 0) >= 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400',
                          )}
                        >
                          Lucro
                        </p>
                        <p
                          className={cn(
                            'text-xl font-bold',
                            (fin.lucroBrl ?? 0) >= 0
                              ? 'text-green-700 dark:text-green-300'
                              : 'text-red-700 dark:text-red-300',
                          )}
                        >
                          {formatBRL(fin.lucroBrl ?? 0)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Frete inter.</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatYuan(fin.freteInternacionalYuan ?? 0)} →{' '}
                          {formatBRL(fin.freteInternacionalBrl ?? 0)}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Taxa alfandeg.</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatBRL(fin.taxaAlfandegariaBrl ?? 0)}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Margem</p>
                        <p
                          className={cn(
                            'text-sm font-medium',
                            (fin.margemPercentual ?? 0) < 15
                              ? 'text-red-500'
                              : (fin.margemPercentual ?? 0) <= 25
                                ? 'text-amber-500'
                                : 'text-green-500',
                          )}
                        >
                          {(fin.margemPercentual ?? 0).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>

              {/* ── SEÇÃO 3 — Detalhes do Pacote ────────────── */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Detalhes do pacote
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Tipo de envio</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {pacote.tipoEnvio === 'EXPRESSA'
                        ? 'Expressa'
                        : pacote.tipoEnvio === 'ECONOMICA'
                          ? 'Econômica'
                          : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Peso total</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {(pacote.pesoTotalGramas ?? 0) >= 1000
                        ? `${((pacote.pesoTotalGramas ?? 0) / 1000).toFixed(1)}kg`
                        : `${pacote.pesoTotalGramas ?? 0}g`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Câmbio utilizado</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {pacote.cambio ? `R$1 = ¥${pacote.cambio.toFixed(2)}` : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Taxa CSSBuy</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {pacote.taxaCssbuyYuan != null
                        ? formatYuan(pacote.taxaCssbuyYuan)
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Data criação</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {pacote.dataCriacao ? formatDate(pacote.dataCriacao) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Data de envio</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {pacote.dataEnvio ? formatDate(pacote.dataEnvio) : '—'}
                    </p>
                  </div>
                </div>
                {pacote.observacoes && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Observações</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      {pacote.observacoes}
                    </p>
                  </div>
                )}
              </div>

              {/* ── SEÇÃO 4 — Clientes no Pacote ────────────── */}
              <ClientesSection
                clientesList={clientesList}
                pacoteId={pacoteId!}
                addItemOpen={addItemOpen}
                setAddItemOpen={setAddItemOpen}
                cambio={pacote.cambio}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Advance Status Alert Dialog ──────────────────────── */}
      <AlertDialog open={showAdvanceDialog} onOpenChange={setShowAdvanceDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Avançar para {nextStatus && statusLabels[nextStatus]}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a mudar o status do pacote de &quot;
              {currentStatus && statusLabels[currentStatus]}&quot; para &quot;
              {nextStatus && statusLabels[nextStatus]}&quot;. Esta ação atualizará o progresso
              do envio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAdvanceStatus}
              disabled={advanceStatusMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {advanceStatusMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Avançando...
                </>
              ) : (
                'Confirmar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ── Clientes Section ────────────────────────────────────────────────────

function ClientesSection({
  clientesList,
  pacoteId,
  addItemOpen,
  setAddItemOpen,
  cambio,
}: {
  clientesList: ItensPorCompradorResponse[]
  pacoteId: number
  addItemOpen: boolean
  setAddItemOpen: (v: boolean) => void
  cambio?: number
}) {
  const atualizarItemMutation = useAtualizarItem(pacoteId)

  const handleUpdatePaymentStatus = (itemId: number, newStatus: StatusPagamento) => {
    atualizarItemMutation.mutate({ itemId, data: { statusPagamento: newStatus } })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Clientes neste pacote
        </h3>
        <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-xs font-medium px-2 py-0.5 rounded-full">
          {clientesList.length} cliente{clientesList.length !== 1 ? 's' : ''}
        </span>
      </div>

      {clientesList.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">
          Nenhum item adicionado a este pacote.
        </p>
      ) : (
        <Accordion type="multiple" className="space-y-3">
          {clientesList.map((cliente) => {
            const initials = (cliente.compradorNome ?? '')
              .split(' ')
              .map((w) => w.charAt(0))
              .join('')
              .slice(0, 2)
              .toUpperCase()

            return (
              <AccordionItem
                key={cliente.compradorId}
                value={`cliente-${cliente.compradorId}`}
                className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center text-xs font-semibold">
                        {initials}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {cliente.compradorNome}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded">
                        Custo {formatBRL(cliente.subtotalCustoBrl ?? 0)}
                      </span>
                      <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded">
                        Venda {formatBRL(cliente.subtotalVendaBrl ?? 0)}
                      </span>
                      <span
                        className={cn(
                          'text-xs px-2 py-1 rounded font-medium',
                          (cliente.margemPercentual ?? 0) < 15
                            ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
                            : (cliente.margemPercentual ?? 0) <= 25
                              ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                              : 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400',
                        )}
                      >
                        Margem {(cliente.margemPercentual ?? 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-0 pb-0">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg m-3">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-0">
                          <TableHead className="text-xs">Produto</TableHead>
                          <TableHead className="text-xs">Qtd</TableHead>
                          <TableHead className="text-xs">Custo</TableHead>
                          <TableHead className="text-xs">Venda</TableHead>
                          <TableHead className="text-xs">Lucro</TableHead>
                          <TableHead className="text-xs">Pago?</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(cliente.itens ?? []).map((item: OrderItemResponse) => (
                          <TableRow key={item.id} className="border-0">
                            <TableCell>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {item.produto?.nome}
                                </p>
                                {item.produto?.categoria && (
                                  <span className="inline-block bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-1.5 py-0.5 rounded mt-1">
                                    {item.produto.categoria}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {item.quantidade ?? 1}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-900 dark:text-white">
                                {formatBRL(item.custoRateadoBrl ?? 0)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-900 dark:text-white">
                                {formatBRL(item.precoVendaBrl ?? 0)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span
                                className={cn(
                                  'text-sm font-medium',
                                  (item.lucroItemBrl ?? 0) >= 0
                                    ? 'text-green-600'
                                    : 'text-red-600',
                                )}
                              >
                                {formatBRL(item.lucroItemBrl ?? 0)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {item.statusPagamento && (
                                  <StatusChip status={item.statusPagamento} size="sm" />
                                )}
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <button className="text-gray-400 hover:text-blue-600">
                                      <Pencil className="w-3 h-3" />
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-48 p-2" align="end">
                                    <div className="space-y-1">
                                      {(['PENDENTE', 'PARCIAL', 'PAGO'] as StatusPagamento[]).map(
                                        (s) => (
                                          <button
                                            key={s}
                                            className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                            onClick={() =>
                                              item.id && handleUpdatePaymentStatus(item.id, s)
                                            }
                                          >
                                            {s === 'PENDENTE'
                                              ? 'Pendente'
                                              : s === 'PARCIAL'
                                                ? 'Parcial'
                                                : 'Pago'}
                                          </button>
                                        ),
                                      )}
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Subtotal:{' '}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatBRL(cliente.subtotalVendaBrl ?? 0)}
                        </span>{' '}
                        | Pendente:{' '}
                        <span className="font-medium text-red-600">
                          {formatBRL(cliente.totalPendenteBrl ?? 0)}
                        </span>
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      )}

      <button
        onClick={() => setAddItemOpen(true)}
        className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl py-3 text-sm text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Adicionar item
      </button>

      {/* ── Add Item Modal ────────────────────────────────────── */}
      <AddItemModal
        pacoteId={pacoteId}
        open={addItemOpen}
        onClose={() => setAddItemOpen(false)}
        cambio={cambio}
      />
    </div>
  )
}

// ── Add Item Modal ──────────────────────────────────────────────────────

function AddItemModal({
  pacoteId,
  open,
  onClose,
  cambio,
}: {
  pacoteId: number
  open: boolean
  onClose: () => void
  cambio?: number
}) {
  const addMutation = useAdicionarItem(pacoteId)
  const { data: compradores } = useCompradores()
  const { data: produtos } = useProdutos()

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<AddItemForm>({
    resolver: zodResolver(addItemSchema),
    defaultValues: { quantidade: 1, statusPagamento: 'PENDENTE' },
  })

  const [apiError, setApiError] = useState('')

  const selectedProdutoId = watch('produtoId')
  const selectedProduto = useMemo(
    () => produtos?.find((p) => p.id === selectedProdutoId),
    [produtos, selectedProdutoId],
  )

  const handleClose = () => {
    reset({ compradorId: undefined as unknown as number, produtoId: undefined as unknown as number, quantidade: 1, precoVendaBrl: undefined as unknown as number, statusPagamento: 'PENDENTE' })
    setApiError('')
    onClose()
  }

  const onSubmit = (data: AddItemForm) => {
    setApiError('')
    addMutation.mutate(
      {
        compradorId: data.compradorId,
        produtoId: data.produtoId,
        quantidade: data.quantidade,
        precoVendaBrl: data.precoVendaBrl,
        statusPagamento: data.statusPagamento,
      },
      {
        onSuccess: () => handleClose(),
        onError: (err: any) =>
          setApiError(err?.response?.data?.message || 'Erro ao adicionar item'),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Adicionar item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            {/* Comprador */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Comprador <span className="text-red-500">*</span>
              </label>
              <Controller
                control={control}
                name="compradorId"
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(compradores ?? []).map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.compradorId && (
                <p className="text-red-500 text-xs mt-1">{errors.compradorId.message}</p>
              )}
            </div>

            {/* Produto */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Produto <span className="text-red-500">*</span>
              </label>
              <Controller
                control={control}
                name="produtoId"
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(produtos ?? []).map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.nome} — {p.categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.produtoId && (
                <p className="text-red-500 text-xs mt-1">{errors.produtoId.message}</p>
              )}
              {selectedProduto && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-1 mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Custo: {formatYuan(selectedProduto.custoYuan ?? 0)}
                    {cambio
                      ? ` → ~${formatBRL((selectedProduto.custoYuan ?? 0) / cambio)}`
                      : ''}
                  </p>
                  <p className="text-xs text-gray-400">
                    Peso: {selectedProduto.pesoGramas ?? 0}g
                  </p>
                </div>
              )}
            </div>

            {/* Quantidade */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Quantidade <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                {...register('quantidade')}
                className="w-full h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              />
            </div>

            {/* Preço de venda */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Preço de venda R$ <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                {...register('precoVendaBrl')}
                className="w-full h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
              {errors.precoVendaBrl && (
                <p className="text-red-500 text-xs mt-1">{errors.precoVendaBrl.message}</p>
              )}
            </div>

            {/* Status Pagamento */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Status de pagamento
              </label>
              <Controller
                control={control}
                name="statusPagamento"
                render={({ field }) => (
                  <Select value={field.value ?? 'PENDENTE'} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDENTE">Pendente</SelectItem>
                      <SelectItem value="PAGO">Pago</SelectItem>
                      <SelectItem value="PARCIAL">Parcial</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {apiError && (
              <p className="text-red-500 text-sm bg-red-50 dark:bg-red-950/30 p-2 rounded">
                {apiError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={addMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {addMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adicionando...
                </>
              ) : (
                'Adicionar item'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
