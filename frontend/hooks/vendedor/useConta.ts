import { useQuery } from '@tanstack/react-query'
import { getInfoPlano, type InfoPlanoResponse } from '@/services/contaService'

export function useInfoPlano() {
  return useQuery<InfoPlanoResponse>({
    queryKey: ['vendedor', 'conta', 'plano'],
    queryFn: getInfoPlano,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}
