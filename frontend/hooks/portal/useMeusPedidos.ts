import { useQuery } from '@tanstack/react-query'
import {
  getMeusPedidos,
  getDetalhePedido,
  type MeusPedidosResponse,
  type PedidoCompradorResponse,
} from '@/services/portalService'

export function useMeusPedidos() {
  return useQuery<MeusPedidosResponse>({
    queryKey: ['portal', 'meus-pedidos'],
    queryFn: getMeusPedidos,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  })
}

export function useDetalhePedido(itemId: number) {
  return useQuery<PedidoCompradorResponse>({
    queryKey: ['portal', 'pedido', itemId],
    queryFn: () => getDetalhePedido(itemId),
    enabled: itemId > 0,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  })
}
