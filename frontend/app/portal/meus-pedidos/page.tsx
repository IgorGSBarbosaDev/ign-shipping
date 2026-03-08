'use client'

import { useState, useMemo } from 'react'
import { PortalLayout } from '@/components/portal/portal-layout'
import { Package, PackageOpen, PackageSearch, Truck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { useMeusPedidos } from '@/hooks/portal/useMeusPedidos'
import { formatBRL, formatDate } from '@/lib/utils'
import type { components } from '@/src/types/api.generated'

type StatusPacote = components['schemas']['StatusPacote']
type StatusPagamento = components['schemas']['StatusPagamento']
type Categoria = components['schemas']['Categoria']

// ── Status maps (textos amigáveis) ──────────────────────────────────────

const categoriaBadgeColors: Record<string, string> = {
  ROUPAS: 'bg-pink-100 text-pink-700',
  TENIS: 'bg-orange-100 text-orange-700',
  ELETRONICO: 'bg-blue-100 text-blue-700',
  OUTROS: 'bg-gray-100 text-gray-700',
}

const statusPagamentoBadge: Record<string, { label: string; className: string }> = {
  PAGO: { label: '✓ Pago', className: 'bg-green-100 text-green-700' },
  PENDENTE: { label: 'Pendente', className: 'bg-red-100 text-red-600' },
  PARCIAL: { label: 'Parcial', className: 'bg-amber-100 text-amber-700' },
}

const statusPacoteInfo: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  RASCUNHO: {
    label: 'Aguardando confirmação',
    color: 'text-gray-600',
    icon: <Package className="w-4 h-4" />,
  },
  AGUARDANDO_ENVIO: {
    label: 'Comprado, aguardando envio',
    color: 'text-amber-600',
    icon: <Package className="w-4 h-4" />,
  },
  EM_VIAGEM: {
    label: 'A caminho do Brasil 🚢',
    color: 'text-blue-600',
    icon: <Truck className="w-4 h-4" />,
  },
  ALFANDEGA: {
    label: 'Na alfândega',
    color: 'text-orange-600',
    icon: <Package className="w-4 h-4" />,
  },
  TRANSITO: {
    label: 'Em entrega no Brasil',
    color: 'text-purple-600',
    icon: <Truck className="w-4 h-4" />,
  },
  ENTREGUE: {
    label: 'Entregue ✓',
    color: 'text-green-600',
    icon: <Package className="w-4 h-4" />,
  },
  FINALIZADO: {
    label: 'Concluído',
    color: 'text-emerald-600',
    icon: <Package className="w-4 h-4" />,
  },
}

type FiltroStatus = 'TODOS' | 'EM_ANDAMENTO' | 'ENTREGUES' | 'PENDENTES'

// ── Page ─────────────────────────────────────────────────────────────────

export default function MeusPedidosPage() {
  const router = useRouter()
  const { data, isLoading, isError } = useMeusPedidos()
  const [filtro, setFiltro] = useState<FiltroStatus>('TODOS')

  const pedidos = data?.pedidos ?? []

  const pedidosFiltrados = useMemo(
    () =>
      pedidos.filter((p) => {
        if (filtro === 'TODOS') return true
        if (filtro === 'EM_ANDAMENTO')
          return ['AGUARDANDO_ENVIO', 'EM_VIAGEM', 'ALFANDEGA', 'TRANSITO'].includes(
            p.statusPacote ?? '',
          )
        if (filtro === 'ENTREGUES')
          return ['ENTREGUE', 'FINALIZADO'].includes(p.statusPacote ?? '')
        if (filtro === 'PENDENTES') return p.statusPagamento === 'PENDENTE'
        return true
      }),
    [pedidos, filtro],
  )

  return (
    <PortalLayout>
      <div className="py-6 space-y-6">
        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-900">Meus Pedidos</h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500 mb-1">Total de pedidos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data?.totalPedidos ?? 0}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500 mb-1">Total pago</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatBRL(data?.totalPagoBrl ?? 0)}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500 mb-1">Pendente</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatBRL(data?.totalPendenteBrl ?? 0)}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(
            [
              { value: 'TODOS', label: 'Todos' },
              { value: 'EM_ANDAMENTO', label: 'Em andamento' },
              { value: 'ENTREGUES', label: 'Entregues' },
              { value: 'PENDENTES', label: 'Pendentes de pagamento' },
            ] as const
          ).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFiltro(value)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                filtro === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Grid de Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <PackageSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Erro ao carregar pedidos
            </h3>
            <p className="text-sm text-gray-500">
              Tente recarregar a página
            </p>
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <PackageSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum pedido encontrado
            </h3>
            <p className="text-sm text-gray-500">
              {filtro !== 'TODOS'
                ? 'Tente ajustar os filtros'
                : 'Seus pedidos aparecerão aqui'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pedidosFiltrados.map((pedido) => {
              const statusInfo =
                statusPacoteInfo[pedido.statusPacote ?? 'RASCUNHO'] ??
                statusPacoteInfo.RASCUNHO
              const pagamentoInfo =
                statusPagamentoBadge[pedido.statusPagamento ?? 'PENDENTE'] ??
                statusPagamentoBadge.PENDENTE

              return (
                <div
                  key={pedido.itemId}
                  onClick={() => router.push(`/portal/pedidos/${pedido.itemId}`)}
                  className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
                >
                  {/* Row topo: thumbnail + info */}
                  <div className="flex gap-3 mb-3">
                    {/* Thumbnail */}
                    {pedido.produto?.fotoUrl ? (
                      <img
                        src={pedido.produto.fotoUrl}
                        alt={pedido.produto.nome ?? 'Produto'}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <PackageOpen className="w-8 h-8 text-gray-300" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                        {pedido.produto?.nome ?? 'Produto'}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        {pedido.produto?.categoria && (
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded ${
                              categoriaBadgeColors[pedido.produto.categoria] ??
                              categoriaBadgeColors.OUTROS
                            }`}
                          >
                            {pedido.produto.categoria}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          x{pedido.quantidade ?? 1}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Row meio: preço + pagamento */}
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-lg font-bold text-gray-900">
                      {formatBRL(pedido.precoVendaBrl ?? 0)}
                    </p>
                    <span
                      className={`text-xs font-medium rounded-full px-2 py-0.5 ${pagamentoInfo.className}`}
                    >
                      {pagamentoInfo.label}
                    </span>
                  </div>

                  {/* Row status */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={statusInfo.color}>{statusInfo.icon}</span>
                      <span className={`text-sm font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {pedido.dataPacote ? formatDate(pedido.dataPacote) : ''}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PortalLayout>
  )
}
