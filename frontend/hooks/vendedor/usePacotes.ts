import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listar,
  criar,
  atualizar,
  atualizarStatus,
  type PacoteResumoResponse,
  type PacoteRequest,
  type StatusPacote,
} from '@/services/pacoteService'

const QUERY_KEY = ['vendedor', 'pacotes'] as const

export function usePacotes(status?: StatusPacote) {
  return useQuery<PacoteResumoResponse[]>({
    queryKey: [...QUERY_KEY, status ?? 'all'],
    queryFn: () => listar(status),
  })
}

export function useCriarPacote() {
  const queryClient = useQueryClient()
  return useMutation<PacoteResumoResponse, Error, PacoteRequest>({
    mutationFn: criar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['vendedor', 'dashboard'] })
    },
  })
}

export function useAtualizarPacote() {
  const queryClient = useQueryClient()
  return useMutation<PacoteResumoResponse, Error, { id: number; data: PacoteRequest }>({
    mutationFn: ({ id, data }) => atualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useAtualizarStatusPacote() {
  const queryClient = useQueryClient()
  return useMutation<PacoteResumoResponse, Error, { id: number; status: StatusPacote }>({
    mutationFn: ({ id, status }) => atualizarStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['vendedor', 'pacote', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['vendedor', 'dashboard'] })
    },
  })
}
