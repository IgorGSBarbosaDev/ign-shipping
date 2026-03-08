import api from '@/lib/api'
import type { components } from '@/src/types/api.generated'

// ── Types ───────────────────────────────────────────────────────────────
export type MeusPedidosResponse = components['schemas']['MeusPedidosResponse']
export type PedidoCompradorResponse = components['schemas']['PedidoCompradorResponse']
export type ProdutoResponse = components['schemas']['ProdutoResponse']
export type StatusPacote = components['schemas']['StatusPacote']
export type StatusPagamento = components['schemas']['StatusPagamento']

// ── Service ─────────────────────────────────────────────────────────────
export async function getMeusPedidos(): Promise<MeusPedidosResponse> {
  const res = await api.get<MeusPedidosResponse>('/portal/meus-pedidos')
  return res.data
}

export async function getDetalhePedido(itemId: number): Promise<PedidoCompradorResponse> {
  const res = await api.get<PedidoCompradorResponse>(`/portal/meus-pedidos/${itemId}`)
  return res.data
}
