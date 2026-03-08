import { useQuery } from '@tanstack/react-query'
import {
  buscarDetalhe,
  getResumoFinanceiro,
  type PacoteDetalheResponse,
  type ResumoFinanceiroResponse,
} from '@/services/pacoteService'
import {
  listar as listarItens,
  type ItensPorCompradorResponse,
} from '@/services/itemService'

/**
 * 3 queries paralelas para o modal de detalhe do pacote.
 * Todas são "lazy" — só disparam quando `pacoteId` é fornecido (não null).
 */
export function usePacoteDetalhe(pacoteId: number | null) {
  const enabled = pacoteId != null

  const detalhe = useQuery<PacoteDetalheResponse>({
    queryKey: ['vendedor', 'pacote', pacoteId, 'detalhe'],
    queryFn: () => buscarDetalhe(pacoteId!),
    enabled,
  })

  const itens = useQuery<ItensPorCompradorResponse[]>({
    queryKey: ['vendedor', 'pacote', pacoteId, 'itens'],
    queryFn: () => listarItens(pacoteId!),
    enabled,
  })

  const resumoFinanceiro = useQuery<ResumoFinanceiroResponse>({
    queryKey: ['vendedor', 'pacote', pacoteId, 'resumo-financeiro'],
    queryFn: () => getResumoFinanceiro(pacoteId!),
    enabled,
  })

  return { detalhe, itens, resumoFinanceiro }
}
