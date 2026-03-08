'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
  Building2,
  CreditCard,
  DollarSign,
  Package,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAdminDashboard } from '@/hooks/admin/useAdminDashboard'
import { useAdminTenants } from '@/hooks/admin/useAdminTenants'
import { formatBRL, formatDate } from '@/lib/utils'
import type { StatusConta, NomePlano } from '@/services/adminService'

// ── Helpers ──────────────────────────────────────────────────────────────

const statusColor: Record<string, string> = {
  TRIAL: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  ATIVO: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  SUSPENSO: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  CANCELADO: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
}

const planoColor: Record<string, string> = {
  GRATUITO: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  BASICO: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  PRO: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  ENTERPRISE: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function AdminOverviewPage() {
  const { data: dashboard, isLoading: loadingDash } = useAdminDashboard()
  const { data: tenants, isLoading: loadingTenants } = useAdminTenants()

  const recentTenants = useMemo(() => {
    if (!tenants) return []
    return [...tenants]
      .sort((a, b) => {
        const dA = a.dataCadastro ? new Date(a.dataCadastro).getTime() : 0
        const dB = b.dataCadastro ? new Date(b.dataCadastro).getTime() : 0
        return dB - dA
      })
      .slice(0, 10)
  }, [tenants])

  const kpis = [
    {
      label: 'Total Vendedores',
      value: dashboard?.totalTenants ?? 0,
      icon: Building2,
      color: 'text-slate-600',
    },
    {
      label: 'Pagantes',
      value: dashboard?.tenantsPagantes ?? 0,
      icon: CreditCard,
      color: 'text-green-600',
    },
    {
      label: 'MRR',
      value: formatBRL(dashboard?.mrrBrl ?? 0),
      icon: DollarSign,
      color: 'text-emerald-600',
    },
    {
      label: 'Novos (30 dias)',
      value: dashboard?.novosCadastros30Dias ?? 0,
      icon: TrendingUp,
      color: 'text-blue-600',
    },
    {
      label: 'Compradores',
      value: dashboard?.totalCompradores ?? 0,
      icon: Users,
      color: 'text-amber-600',
    },
    {
      label: 'Pacotes',
      value: dashboard?.totalPacotesPlataforma ?? 0,
      icon: Package,
      color: 'text-purple-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {kpi.label}
                  </p>
                  {loadingDash ? (
                    <Skeleton className="h-7 w-20 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {kpi.value}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent tenants table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Últimos Vendedores Cadastrados</CardTitle>
          <Link
            href="/admin/tenants"
            className="text-sm text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
          >
            Ver todos →
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {loadingTenants ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">MRR</TableHead>
                  <TableHead>Cadastro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTenants.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <Link
                        href={`/admin/tenants/${t.id}`}
                        className="font-medium text-slate-700 dark:text-slate-300 hover:underline"
                      >
                        {t.nomeVendedor}
                      </Link>
                      <p className="text-xs text-gray-400">{t.email}</p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={planoColor[t.plano ?? 'GRATUITO']}
                      >
                        {t.plano}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusColor[t.statusConta ?? 'ATIVO']}
                      >
                        {t.statusConta}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatBRL(t.mrrBrl ?? 0)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {t.dataCadastro ? formatDate(t.dataCadastro) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
                {recentTenants.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                      Nenhum vendedor cadastrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
