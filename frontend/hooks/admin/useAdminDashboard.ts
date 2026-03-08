import { useQuery } from '@tanstack/react-query'
import { getDashboard } from '@/services/adminService'

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: getDashboard,
    refetchInterval: 60_000,
  })
}
