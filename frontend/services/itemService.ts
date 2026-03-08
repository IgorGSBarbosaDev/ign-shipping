import api from '@/lib/api'
import type { components } from '@/src/types/api.generated'

// ── Types ───────────────────────────────────────────────────────────────
export type OrderItemRequest = components['schemas']['OrderItemRequest']
export type OrderItemUpdateRequest = components['schemas']['OrderItemUpdateRequest']
export type OrderItemResponse = components['schemas']['OrderItemResponse']
export type ItensPorCompradorResponse = components['schemas']['ItensPorCompradorResponse']
export type StatusPagamento = components['schemas']['StatusPagamento']

// ── Service ─────────────────────────────────────────────────────────────
export async function listar(pacoteId: number): Promise<ItensPorCompradorResponse[]> {
  const res = await api.get<ItensPorCompradorResponse[]>(`/vendedor/pacotes/${pacoteId}/itens`)
  return res.data
}

export async function adicionar(pacoteId: number, data: OrderItemRequest): Promise<OrderItemResponse> {
  const res = await api.post<OrderItemResponse>(`/vendedor/pacotes/${pacoteId}/itens`, data)
  return res.data
}

export async function atualizar(
  pacoteId: number,
  itemId: number,
  data: OrderItemUpdateRequest,
): Promise<OrderItemResponse> {
  const res = await api.put<OrderItemResponse>(`/vendedor/pacotes/${pacoteId}/itens/${itemId}`, data)
  return res.data
}

export async function remover(pacoteId: number, itemId: number): Promise<void> {
  await api.delete(`/vendedor/pacotes/${pacoteId}/itens/${itemId}`)
}
