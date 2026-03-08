import api from '@/lib/api'
import type { paths } from '@/src/types/api.generated'

// ── Types ────────────────────────────────────────────────────────────────

export type DashboardAdminResponse =
  paths['/admin/dashboard']['get']['responses']['200']['content']['application/json']

export type TenantAdminResponse =
  paths['/admin/tenants']['get']['responses']['200']['content']['application/json'][number]

export type NomePlano = NonNullable<TenantAdminResponse['plano']>
export type StatusConta = NonNullable<TenantAdminResponse['statusConta']>

export interface ListarTenantsParams {
  plano?: NomePlano
  status?: StatusConta
}

// ── API calls ────────────────────────────────────────────────────────────

export async function getDashboard(): Promise<DashboardAdminResponse> {
  const { data } = await api.get<DashboardAdminResponse>('/admin/dashboard')
  return data
}

export async function listarTenants(
  params?: ListarTenantsParams,
): Promise<TenantAdminResponse[]> {
  const { data } = await api.get<TenantAdminResponse[]>('/admin/tenants', { params })
  return data
}

export async function buscarTenant(id: number): Promise<TenantAdminResponse> {
  const { data } = await api.get<TenantAdminResponse>(`/admin/tenants/${id}`)
  return data
}

export async function suspenderTenant(id: number): Promise<void> {
  await api.patch(`/admin/tenants/${id}/suspender`)
}

export async function reativarTenant(id: number): Promise<void> {
  await api.patch(`/admin/tenants/${id}/reativar`)
}

export async function alterarPlano(id: number, plano: NomePlano): Promise<void> {
  await api.patch(`/admin/tenants/${id}/plano`, { plano })
}
