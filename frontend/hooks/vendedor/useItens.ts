import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  adicionar,
  atualizar,
  remover,
  type OrderItemRequest,
  type OrderItemUpdateRequest,
  type OrderItemResponse,
} from '@/services/itemService'

function useInvalidatePacote() {
  const queryClient = useQueryClient()
  return (pacoteId: number) => {
    queryClient.invalidateQueries({ queryKey: ['vendedor', 'pacote', pacoteId] })
    queryClient.invalidateQueries({ queryKey: ['vendedor', 'pacotes'] })
    queryClient.invalidateQueries({ queryKey: ['vendedor', 'dashboard'] })
  }
}

export function useAdicionarItem(pacoteId: number) {
  const invalidate = useInvalidatePacote()
  return useMutation<OrderItemResponse, Error, OrderItemRequest>({
    mutationFn: (data) => adicionar(pacoteId, data),
    onSuccess: () => invalidate(pacoteId),
  })
}

export function useAtualizarItem(pacoteId: number) {
  const invalidate = useInvalidatePacote()
  return useMutation<
    OrderItemResponse,
    Error,
    { itemId: number; data: OrderItemUpdateRequest }
  >({
    mutationFn: ({ itemId, data }) => atualizar(pacoteId, itemId, data),
    onSuccess: () => invalidate(pacoteId),
  })
}

export function useRemoverItem(pacoteId: number) {
  const invalidate = useInvalidatePacote()
  return useMutation<void, Error, number>({
    mutationFn: (itemId) => remover(pacoteId, itemId),
    onSuccess: () => invalidate(pacoteId),
  })
}
