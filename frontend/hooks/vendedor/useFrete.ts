import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listarFaixas,
  criarFaixa,
  calcularFrete,
  type FaixaFreteRequest,
  type FaixaFreteResponse,
  type CalcularFreteRequest,
  type CalcularFreteResponse,
} from '@/services/freteService'

const QUERY_KEY = ['vendedor', 'frete', 'tabela'] as const

export function useFaixasFrete() {
  return useQuery<FaixaFreteResponse[]>({
    queryKey: QUERY_KEY,
    queryFn: listarFaixas,
  })
}

export function useCriarFaixa() {
  const queryClient = useQueryClient()
  return useMutation<FaixaFreteResponse, Error, FaixaFreteRequest>({
    mutationFn: criarFaixa,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useCalcularFrete() {
  return useMutation<CalcularFreteResponse, Error, CalcularFreteRequest>({
    mutationFn: calcularFrete,
  })
}
