import api from '@/lib/api'
import type { components } from '@/src/types/api.generated'

// ── Types ───────────────────────────────────────────────────────────────
export type ProdutoResponse = components['schemas']['ProdutoResponse']
export type ProdutoRequest = components['schemas']['ProdutoRequest']
export type Categoria = components['schemas']['Categoria']

// ── Service ─────────────────────────────────────────────────────────────
export async function listar(categoria?: Categoria): Promise<ProdutoResponse[]> {
  const res = await api.get<ProdutoResponse[]>('/vendedor/produtos', {
    params: categoria ? { categoria } : undefined,
  })
  return res.data
}

export async function criar(data: ProdutoRequest): Promise<ProdutoResponse> {
  const res = await api.post<ProdutoResponse>('/vendedor/produtos', data)
  return res.data
}

export async function atualizar(id: number, data: ProdutoRequest): Promise<ProdutoResponse> {
  const res = await api.put<ProdutoResponse>(`/vendedor/produtos/${id}`, data)
  return res.data
}

export async function deletar(id: number): Promise<void> {
  await api.delete(`/vendedor/produtos/${id}`)
}
