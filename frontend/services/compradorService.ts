import api from '@/lib/api'
import type { components } from '@/src/types/api.generated'

// ── Types ───────────────────────────────────────────────────────────────
export type CompradorResponse = components['schemas']['CompradorResponse']
export type CompradorRequest = components['schemas']['CompradorRequest']

export type ConviteResponse = {
  codigoConvite?: string
  linkConvite?: string
}

// ── Service ─────────────────────────────────────────────────────────────
export async function listar(): Promise<CompradorResponse[]> {
  const res = await api.get<CompradorResponse[]>('/vendedor/compradores')
  return res.data
}

export async function criar(data: CompradorRequest): Promise<CompradorResponse> {
  const res = await api.post<CompradorResponse>('/vendedor/compradores', data)
  return res.data
}

export async function atualizar(id: number, data: CompradorRequest): Promise<CompradorResponse> {
  const res = await api.put<CompradorResponse>(`/vendedor/compradores/${id}`, data)
  return res.data
}

export async function deletar(id: number): Promise<void> {
  await api.delete(`/vendedor/compradores/${id}`)
}

export async function gerarConvite(id: number): Promise<ConviteResponse> {
  const res = await api.post<ConviteResponse>(`/vendedor/compradores/${id}/convite`)
  return res.data
}
