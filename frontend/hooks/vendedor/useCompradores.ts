import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listar,
  criar,
  atualizar,
  deletar,
  gerarConvite,
  type CompradorResponse,
  type CompradorRequest,
  type ConviteResponse,
} from '@/services/compradorService'

const QUERY_KEY = ['vendedor', 'compradores'] as const

export function useCompradores() {
  return useQuery<CompradorResponse[]>({
    queryKey: QUERY_KEY,
    queryFn: listar,
  })
}

export function useCriarComprador() {
  const queryClient = useQueryClient()
  return useMutation<CompradorResponse, Error, CompradorRequest>({
    mutationFn: criar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useAtualizarComprador() {
  const queryClient = useQueryClient()
  return useMutation<CompradorResponse, Error, { id: number; data: CompradorRequest }>({
    mutationFn: ({ id, data }) => atualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useDeletarComprador() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, number>({
    mutationFn: deletar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useGerarConvite() {
  return useMutation<ConviteResponse, Error, number>({
    mutationFn: gerarConvite,
  })
}
