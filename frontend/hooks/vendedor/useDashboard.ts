import { useQuery } from '@tanstack/react-query'
import { getResumo, type DashboardVendedorResponse } from '@/services/dashboardService'

export function useDashboard() {
  return useQuery<DashboardVendedorResponse>({
    queryKey: ['vendedor', 'dashboard'],
    queryFn: getResumo,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}
