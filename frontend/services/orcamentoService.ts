import api from '@/lib/api'
import type { components } from '@/src/types/api.generated'

// ── Types ───────────────────────────────────────────────────────────────
export type OrcamentoRequest = components['schemas']['OrcamentoRequest']
export type OrcamentoResultadoResponse = components['schemas']['OrcamentoResultadoResponse']
export type OrcamentoResponse = components['schemas']['OrcamentoResponse']
export type Categoria = components['schemas']['Categoria']

// ── Service ─────────────────────────────────────────────────────────────

/** POST /vendedor/orcamentos/simular — calcula sem salvar */
export async function simular(data: OrcamentoRequest): Promise<OrcamentoResultadoResponse> {
  const res = await api.post<OrcamentoResultadoResponse>('/vendedor/orcamentos/simular', data)
  return res.data
}

/** POST /vendedor/orcamentos — salva orçamento */
export async function salvar(data: OrcamentoRequest): Promise<OrcamentoResponse> {
  const res = await api.post<OrcamentoResponse>('/vendedor/orcamentos', data)
  return res.data
}

/** GET /vendedor/orcamentos — histórico */
export async function listar(): Promise<OrcamentoResponse[]> {
  const res = await api.get<OrcamentoResponse[]>('/vendedor/orcamentos')
  return res.data
}
