import api from '@/lib/api'
import type { components } from '@/src/types/api.generated'

// ── Types ───────────────────────────────────────────────────────────────
export type DashboardVendedorResponse = components['schemas']['DashboardVendedorResponse']
export type PacoteResumoResponse = components['schemas']['PacoteResumoResponse']
export type UsoPlanoPorcentagem = components['schemas']['UsoPlanoPorcentagem']

// ── Service ─────────────────────────────────────────────────────────────
export async function getResumo(): Promise<DashboardVendedorResponse> {
  const res = await api.get<DashboardVendedorResponse>('/vendedor/dashboard')
  return res.data
}
