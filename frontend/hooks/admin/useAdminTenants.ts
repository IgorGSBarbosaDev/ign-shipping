import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listarTenants,
  buscarTenant,
  suspenderTenant,
  reativarTenant,
  alterarPlano,
  type ListarTenantsParams,
  type NomePlano,
} from '@/services/adminService'

// ── List ─────────────────────────────────────────────────────────────────

export function useAdminTenants(params?: ListarTenantsParams) {
  return useQuery({
    queryKey: ['admin', 'tenants', params],
    queryFn: () => listarTenants(params),
  })
}

// ── Detalhe ──────────────────────────────────────────────────────────────

export function useAdminTenant(id: number) {
  return useQuery({
    queryKey: ['admin', 'tenants', id],
    queryFn: () => buscarTenant(id),
    enabled: id > 0,
  })
}

// ── Mutations ────────────────────────────────────────────────────────────

export function useSuspenderTenant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => suspenderTenant(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'tenants'] })
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
    },
  })
}

export function useReativarTenant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => reativarTenant(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'tenants'] })
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
    },
  })
}

export function useAlterarPlano() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, plano }: { id: number; plano: NomePlano }) =>
      alterarPlano(id, plano),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'tenants'] })
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
    },
  })
}
