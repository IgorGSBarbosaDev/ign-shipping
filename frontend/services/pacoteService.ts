import api from '@/lib/api'
import type { components } from '@/src/types/api.generated'

// ── Types ───────────────────────────────────────────────────────────────
export type PacoteRequest = components['schemas']['PacoteRequest']
export type PacoteResumoResponse = components['schemas']['PacoteResumoResponse']
export type PacoteDetalheResponse = components['schemas']['PacoteDetalheResponse']
export type AtualizarStatusRequest = components['schemas']['AtualizarStatusRequest']
export type ResumoFinanceiroResponse = components['schemas']['ResumoFinanceiroResponse']
export type ItensPorCompradorResponse = components['schemas']['ItensPorCompradorResponse']
export type StatusPacote = components['schemas']['StatusPacote']
export type TipoEnvio = components['schemas']['TipoEnvio']

// ── Service ─────────────────────────────────────────────────────────────
export async function listar(status?: StatusPacote): Promise<PacoteResumoResponse[]> {
  const params = status ? { status } : undefined
  const res = await api.get<PacoteResumoResponse[]>('/vendedor/pacotes', { params })
  return res.data
}

export async function buscarDetalhe(id: number): Promise<PacoteDetalheResponse> {
  const res = await api.get<PacoteDetalheResponse>(`/vendedor/pacotes/${id}`)
  return res.data
}

export async function criar(data: PacoteRequest): Promise<PacoteResumoResponse> {
  const res = await api.post<PacoteResumoResponse>('/vendedor/pacotes', data)
  return res.data
}

export async function atualizar(id: number, data: PacoteRequest): Promise<PacoteResumoResponse> {
  const res = await api.put<PacoteResumoResponse>(`/vendedor/pacotes/${id}`, data)
  return res.data
}

export async function atualizarStatus(id: number, status: StatusPacote): Promise<PacoteResumoResponse> {
  const res = await api.patch<PacoteResumoResponse>(`/vendedor/pacotes/${id}/status`, { status } satisfies AtualizarStatusRequest)
  return res.data
}

export async function getResumoFinanceiro(id: number): Promise<ResumoFinanceiroResponse> {
  const res = await api.get<ResumoFinanceiroResponse>(`/vendedor/pacotes/${id}/resumo-financeiro`)
  return res.data
}
