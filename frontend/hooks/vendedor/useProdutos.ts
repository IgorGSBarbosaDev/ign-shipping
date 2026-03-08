import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listar,
  criar,
  atualizar,
  deletar,
  type ProdutoResponse,
  type ProdutoRequest,
  type Categoria,
} from '@/services/produtoService'

const QUERY_KEY = ['vendedor', 'produtos'] as const

export function useProdutos(categoria?: Categoria) {
  return useQuery<ProdutoResponse[]>({
    queryKey: [...QUERY_KEY, categoria ?? 'all'],
    queryFn: () => listar(categoria),
  })
}

export function useCriarProduto() {
  const queryClient = useQueryClient()
  return useMutation<ProdutoResponse, Error, ProdutoRequest>({
    mutationFn: criar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useAtualizarProduto() {
  const queryClient = useQueryClient()
  return useMutation<ProdutoResponse, Error, { id: number; data: ProdutoRequest }>({
    mutationFn: ({ id, data }) => atualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useDeletarProduto() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, number>({
    mutationFn: deletar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
