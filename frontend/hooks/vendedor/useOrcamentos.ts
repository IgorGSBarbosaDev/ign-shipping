import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listar,
  salvar,
  type OrcamentoRequest,
  type OrcamentoResponse,
} from '@/services/orcamentoService'

const QUERY_KEY = ['vendedor', 'orcamentos'] as const

export function useOrcamentos() {
  return useQuery<OrcamentoResponse[]>({
    queryKey: QUERY_KEY,
    queryFn: listar,
  })
}

export function useSalvarOrcamento() {
  const queryClient = useQueryClient()
  return useMutation<OrcamentoResponse, Error, OrcamentoRequest>({
    mutationFn: salvar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
