import api from '@/lib/api'
import type { components } from '@/src/types/api.generated'

// ── Types ───────────────────────────────────────────────────────────────
export type FaixaFreteRequest = components['schemas']['FaixaFreteRequest']
export type FaixaFreteResponse = components['schemas']['FaixaFreteResponse']
export type CalcularFreteRequest = components['schemas']['CalcularFreteRequest']
export type CalcularFreteResponse = components['schemas']['CalcularFreteResponse']
export type TipoEnvio = components['schemas']['TipoEnvio']

// ── Service ─────────────────────────────────────────────────────────────

/** GET /vendedor/frete/tabela — lista faixas */
export async function listarFaixas(): Promise<FaixaFreteResponse[]> {
  const res = await api.get<FaixaFreteResponse[]>('/vendedor/frete/tabela')
  return res.data
}

/** POST /vendedor/frete/tabela — cria faixa */
export async function criarFaixa(data: FaixaFreteRequest): Promise<FaixaFreteResponse> {
  const res = await api.post<FaixaFreteResponse>('/vendedor/frete/tabela', data)
  return res.data
}

/** POST /vendedor/frete/calcular — calcula frete */
export async function calcularFrete(data: CalcularFreteRequest): Promise<CalcularFreteResponse> {
  const res = await api.post<CalcularFreteResponse>('/vendedor/frete/calcular', data)
  return res.data
}
