import api from '@/lib/api'
import type { components } from '@/src/types/api.generated'

// ── Types ───────────────────────────────────────────────────────────────
export type PlanoResponse = components['schemas']['PlanoResponse']
export type UsoPlanoPorcentagem = components['schemas']['UsoPlanoPorcentagem']

export type InfoPlanoResponse = {
  plano?: PlanoResponse
  uso?: UsoPlanoPorcentagem
}

// ── Service ─────────────────────────────────────────────────────────────
export async function getInfoPlano(): Promise<InfoPlanoResponse> {
  const res = await api.get<InfoPlanoResponse>('/vendedor/conta/plano')
  return res.data
}
