'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, ReceiptText, AlertTriangle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useCompradorHistorico } from '@/hooks/vendedor/useCompradores'
import { formatBRL, formatDateTime, formatYuan } from '@/lib/utils'

export default function CompradorHistoricoPage() {
  const params = useParams<{ buyerId: string }>()
  const compradorId = Number(params?.buyerId)

  const { data, isLoading, isError } = useCompradorHistorico(compradorId)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="space-y-4">
        <Link
          href="/vendedor/compradores"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para compradores
        </Link>
        <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 p-10 text-center">
          <AlertTriangle className="mb-3 h-10 w-10 text-red-500" />
          <p className="text-sm text-red-700">Nao foi possivel carregar o historico do comprador.</p>
        </div>
      </div>
    )
  }

  const comprador = data.comprador
  const pedidos = data.pedidos ?? []

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Link
          href="/vendedor/compradores"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para compradores
        </Link>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {comprador?.nome || 'Comprador'}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{comprador?.email || '-'}</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{comprador?.telefone || '-'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total de pedidos</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
            {data.totalPedidos ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total pago</p>
          <p className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">
            {formatBRL(data.totalPagoBrl ?? 0)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total pendente</p>
          <p className="mt-1 text-2xl font-semibold text-red-600 dark:text-red-400">
            {formatBRL(data.totalPendenteBrl ?? 0)}
          </p>
        </div>
      </div>

      {pedidos.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-gray-900">
          <ReceiptText className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Este comprador ainda nao possui pedidos.</p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:block">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-left dark:border-gray-800 dark:bg-gray-950/40">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Produto</th>
                  <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Valor real</th>
                  <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Valor pago</th>
                  <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Data do pedido</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido) => (
                  <tr key={pedido.itemId} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{pedido.produto?.nome || '-'}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                      {formatYuan(pedido.produto?.custoYuan ?? 0)}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {formatBRL(pedido.precoVendaBrl ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                      {pedido.dataPacote ? formatDateTime(pedido.dataPacote) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 lg:hidden">
            {pedidos.map((pedido) => (
              <div
                key={pedido.itemId}
                className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{pedido.produto?.nome || '-'}</p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Valor real</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatYuan(pedido.produto?.custoYuan ?? 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Valor pago</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatBRL(pedido.precoVendaBrl ?? 0)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
                  Data do pedido: {pedido.dataPacote ? formatDateTime(pedido.dataPacote) : '-'}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
