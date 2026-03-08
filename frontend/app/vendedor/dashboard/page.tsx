'use client'

import { useState } from 'react'
import { StatusChip } from '@/components/vendedor/status-chip'
import { MargemBar } from '@/components/vendedor/margem-bar'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DollarSign, TrendingUp, Package, Users, BarChart3, AlertTriangle } from 'lucide-react'
import { useDashboard } from '@/hooks/vendedor/useDashboard'
import { usePacoteDetalheModal } from '@/hooks/vendedor/usePacoteDetalheModal'
import { formatBRL, formatDate } from '@/lib/utils'
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

// ── Skeleton loader ─────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6"
          >
            <Skeleton className="h-10 w-10 rounded-lg mb-3" />
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-7 w-32 mb-1" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6">
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard()
  const { abrirPacote } = usePacoteDetalheModal()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('TODOS')

  if (isLoading) return <DashboardSkeleton />

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Erro ao carregar o dashboard.
        </p>
        <p className="text-gray-400 text-sm mt-1">Tente novamente mais tarde.</p>
      </div>
    )
  }

  const pacotesRecentes = data.pacotesRecentes ?? []
  const usoPlano = data.usoPlano

  const filteredPacotes =
    statusFilter === 'TODOS'
      ? pacotesRecentes
      : pacotesRecentes.filter((p) => p.status === statusFilter)

  const pacotesMesPercent =
    usoPlano?.pacotesMesLimite != null && usoPlano.pacotesMesLimite > 0
      ? ((usoPlano.pacotesMesUsados ?? 0) / usoPlano.pacotesMesLimite) * 100
      : 0

  const compradoresPercent =
    usoPlano?.compradoresLimite != null && usoPlano.compradoresLimite > 0
      ? ((usoPlano.compradoresUsados ?? 0) / usoPlano.compradoresLimite) * 100
      : 0

  const produtosPercent =
    usoPlano?.produtosLimite != null && usoPlano.produtosLimite > 0
      ? ((usoPlano.produtosUsados ?? 0) / usoPlano.produtosLimite) * 100
      : 0

  const hasLimits =
    usoPlano &&
    (usoPlano.pacotesMesLimite != null ||
      usoPlano.compradoresLimite != null ||
      usoPlano.produtosLimite != null)

  function progressColor(pct: number) {
    if (pct > 80) return '[&>div]:bg-red-600'
    if (pct > 60) return '[&>div]:bg-amber-500'
    return '[&>div]:bg-blue-600'
  }

  return (
    <div className="space-y-6">
      {/* ── KPI Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 — A Receber */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-red-100 dark:bg-red-950 rounded-lg p-2">
              <DollarSign className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-1">
            A Receber
          </p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
            {formatBRL(data.totalReceberBrl ?? 0)}
          </p>
          <p className="text-sm text-gray-400">
            {data.compradoresPendentes ?? 0} compradores pendentes
          </p>
        </div>

        {/* Card 2 — Lucro Total */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-green-100 dark:bg-green-950 rounded-lg p-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-1">
            Lucro Total
          </p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
            {formatBRL(data.lucroTotalBrl ?? 0)}
          </p>
          <p className="text-sm text-gray-400">Acumulado histórico</p>
        </div>

        {/* Card 3 — Pacotes */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-blue-100 dark:bg-blue-950 rounded-lg p-2">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-1">
            Pacotes
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {data.totalPacotes ?? 0}
          </p>
          <p className="text-sm text-gray-400">Desde o início</p>
        </div>

        {/* Card 4 — Compradores */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-purple-100 dark:bg-purple-950 rounded-lg p-2">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-1">
            Compradores
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {data.totalCompradoresUnicos ?? 0}
          </p>
          <p className="text-sm text-gray-400">
            Ticket médio {formatBRL(data.ticketMedioBrl ?? 0)}
          </p>
        </div>
      </div>

      {/* ── Uso do Plano ─────────────────────────────────────────── */}
      {hasLimits && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 dark:bg-purple-950 rounded-lg p-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Uso do plano
              </h2>
            </div>
          </div>

          <div className="space-y-5">
            {/* Pacotes este mês */}
            {usoPlano!.pacotesMesLimite != null && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Pacotes este mês
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {usoPlano!.pacotesMesUsados ?? 0} / {usoPlano!.pacotesMesLimite}
                  </span>
                </div>
                <Progress
                  value={pacotesMesPercent}
                  className={`h-2 ${progressColor(pacotesMesPercent)}`}
                />
                {pacotesMesPercent >= 80 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Você está próximo do limite
                  </p>
                )}
              </div>
            )}

            {/* Compradores */}
            {usoPlano!.compradoresLimite != null && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Compradores
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {usoPlano!.compradoresUsados ?? 0} / {usoPlano!.compradoresLimite}
                  </span>
                </div>
                <Progress
                  value={compradoresPercent}
                  className={`h-2 ${progressColor(compradoresPercent)}`}
                />
                {compradoresPercent >= 80 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Você está próximo do limite
                  </p>
                )}
              </div>
            )}

            {/* Produtos */}
            {usoPlano!.produtosLimite != null ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Produtos
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {usoPlano!.produtosUsados ?? 0} / {usoPlano!.produtosLimite}
                  </span>
                </div>
                <Progress
                  value={produtosPercent}
                  className={`h-2 ${progressColor(produtosPercent)}`}
                />
                {produtosPercent >= 80 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Você está próximo do limite
                  </p>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Produtos
                  </span>
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    Ilimitado
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tabela de Pacotes Recentes ───────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pacotes recentes
          </h2>

          {/* Status filter chips */}
          <div className="flex flex-wrap gap-2">
            {statusFilterKeys.map((key) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition-colors ${
                  statusFilter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {statusLabels[key]}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pacote</TableHead>
                <TableHead>Clientes</TableHead>
                <TableHead>Peso</TableHead>
                <TableHead>Custo</TableHead>
                <TableHead>Receita</TableHead>
                <TableHead>Margem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPacotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                    Nenhum pacote encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredPacotes.map((pacote) => (
                  <TableRow
                    key={pacote.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => pacote.id && abrirPacote(pacote.id)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {pacote.nome}
                        </p>
                        <p className="text-xs text-gray-400">#{`PKG-${pacote.id}`}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {pacote.totalCompradores ?? 0} cliente{(pacote.totalCompradores ?? 0) !== 1 ? 's' : ''}
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
                      <span className="text-sm text-gray-900 dark:text-white">
                        {formatBRL(pacote.custoTotalBrl ?? 0)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {formatBRL(pacote.receitaTotalBrl ?? 0)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <MargemBar margem={pacote.margemPercentual ?? 0} />
                    </TableCell>
                    <TableCell>
                      {pacote.status && <StatusChip status={pacote.status} />}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-gray-400">
                        {pacote.dataCriacao ? formatDate(pacote.dataCriacao) : '—'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
