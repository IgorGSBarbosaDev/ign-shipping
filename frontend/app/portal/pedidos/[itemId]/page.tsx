'use client'

import { use } from 'react'
import { PortalLayout } from '@/components/portal/portal-layout'
import { ArrowLeft, Check, PackageOpen, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { useDetalhePedido } from '@/hooks/portal/useMeusPedidos'
import { formatBRL, formatDate } from '@/lib/utils'
import type { components } from '@/src/types/api.generated'

type StatusPacote = components['schemas']['StatusPacote']
type StatusPagamento = components['schemas']['StatusPagamento']

// ── Helpers ─────────────────────────────────────────────────────────────

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

// Timeline steps
const timelineSteps = [
  { key: 'RASCUNHO', label: 'Pedido confirmado' },
  { key: 'AGUARDANDO_ENVIO', label: 'No armazém' },
  { key: 'EM_VIAGEM', label: 'Enviado para o Brasil' },
  { key: 'ALFANDEGA', label: 'Na alfândega' },
  { key: 'TRANSITO', label: 'A caminho de você' },
  { key: 'ENTREGUE', label: 'Entregue' },
]

const statusOrder: StatusPacote[] = [
  'RASCUNHO',
  'AGUARDANDO_ENVIO',
  'EM_VIAGEM',
  'ALFANDEGA',
  'TRANSITO',
  'ENTREGUE',
]

const getStepStatus = (
  stepKey: string,
  currentStatus: string,
): 'completed' | 'current' | 'future' => {
  // FINALIZADO means everything is done
  if (currentStatus === 'FINALIZADO') return 'completed'
  const stepIndex = statusOrder.indexOf(stepKey as StatusPacote)
  const currentIndex = statusOrder.indexOf(currentStatus as StatusPacote)
  if (stepIndex < 0 || currentIndex < 0) return 'future'
  if (stepIndex < currentIndex) return 'completed'
  if (stepIndex === currentIndex) return 'current'
  return 'future'
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function DetalhePedidoPage({
  params,
}: {
  params: Promise<{ itemId: string }>
}) {
  const { itemId: itemIdStr } = use(params)
  const itemId = parseInt(itemIdStr, 10)
  const router = useRouter()
  const { data: pedido, isLoading, isError } = useDetalhePedido(itemId)

  const pagamentoInfo =
    statusPagamentoBadge[pedido?.statusPagamento ?? 'PENDENTE'] ??
    statusPagamentoBadge.PENDENTE

  return (
    <PortalLayout>
      <div className="py-6 space-y-6">
        {/* Header com botão voltar */}
        <button
          onClick={() => router.push('/portal/meus-pedidos')}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Meus pedidos
        </button>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-56 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        ) : isError || !pedido ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Pedido não encontrado
            </h3>
            <p className="text-sm text-gray-500">
              Não foi possível carregar os detalhes deste pedido
            </p>
          </div>
        ) : (
          <>
            {/* Card Principal - Produto */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex flex-col sm:flex-row gap-5">
                {/* Foto */}
                {pedido.produto?.fotoUrl ? (
                  <img
                    src={pedido.produto.fotoUrl}
                    alt={pedido.produto.nome ?? 'Produto'}
                    className="w-full sm:w-60 h-60 rounded-xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-full sm:w-60 h-60 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <PackageOpen className="w-16 h-16 text-gray-300" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-gray-900 mb-2">
                    {pedido.produto?.nome ?? 'Produto'}
                  </h1>
                  <div className="flex items-center gap-2 mb-3">
                    {pedido.produto?.categoria && (
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          categoriaBadgeColors[pedido.produto.categoria] ??
                          categoriaBadgeColors.OUTROS
                        }`}
                      >
                        {pedido.produto.categoria}
                      </span>
                    )}
                  </div>
                  {pedido.nomeVendedor && (
                    <p className="text-sm text-gray-500 mb-2">
                      Vendido por {pedido.nomeVendedor}
                    </p>
                  )}
                  {pedido.produto?.descricao && (
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      {pedido.produto.descricao}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Card - Status do Pedido (Timeline Vertical) */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Status do pedido
              </h2>

              <div className="relative pl-8">
                {/* Linha vertical */}
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />

                {timelineSteps.map((step, index) => {
                  const status = getStepStatus(
                    step.key,
                    pedido.statusPacote ?? 'RASCUNHO',
                  )
                  const isLast = index === timelineSteps.length - 1

                  return (
                    <div key={step.key} className="relative pb-8 last:pb-0">
                      {/* Círculo */}
                      <div className="absolute left-[-1.75rem] top-1">
                        {status === 'completed' ? (
                          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        ) : status === 'current' ? (
                          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-gray-200 bg-white" />
                        )}
                      </div>

                      {/* Linha verde para passos concluídos */}
                      {status === 'completed' && !isLast && (
                        <div className="absolute left-[-1.38rem] top-7 bottom-0 w-0.5 bg-green-400" />
                      )}

                      {/* Texto */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            status === 'completed'
                              ? 'text-gray-700'
                              : status === 'current'
                                ? 'text-blue-700 font-semibold'
                                : 'text-gray-400'
                          }`}
                        >
                          {step.label}
                        </span>
                        {status === 'current' && (
                          <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded">
                            Atual
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Card - Detalhes da compra */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Detalhes da compra
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Quantidade</p>
                  <p className="text-sm font-medium text-gray-900">
                    {pedido.quantidade ?? 1}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Preço unitário</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatBRL(
                      (pedido.precoVendaBrl ?? 0) / (pedido.quantidade || 1),
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Total</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatBRL(pedido.precoVendaBrl ?? 0)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">
                    Status de pagamento
                  </p>
                  <span
                    className={`inline-block text-xs font-medium rounded-full px-2 py-1 ${pagamentoInfo.className}`}
                  >
                    {pagamentoInfo.label}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Vendedor</p>
                  <p className="text-sm font-medium text-gray-900">
                    {pedido.nomeVendedor ?? '—'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Data do pedido</p>
                  <p className="text-sm font-medium text-gray-900">
                    {pedido.dataPacote ? formatDate(pedido.dataPacote) : '—'}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </PortalLayout>
  )
}
