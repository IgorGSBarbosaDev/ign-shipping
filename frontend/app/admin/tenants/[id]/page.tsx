'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Mail,
  Package,
  Pause,
  Play,
  SlidersHorizontal,
  Users,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  useAdminTenant,
  useSuspenderTenant,
  useReativarTenant,
  useAlterarPlano,
} from '@/hooks/admin/useAdminTenants'
import { formatBRL, formatDate, formatDateTime } from '@/lib/utils'
import type { NomePlano } from '@/services/adminService'
import { toast } from 'sonner'

// ── Constants ────────────────────────────────────────────────────────────

const planos: NomePlano[] = ['GRATUITO', 'BASICO', 'PRO', 'ENTERPRISE']

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

export default function TenantDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: idStr } = use(params)
  const tenantId = Number(idStr)

  const { data: tenant, isLoading } = useAdminTenant(tenantId)
  const suspender = useSuspenderTenant()
  const reativar = useReativarTenant()
  const alterar = useAlterarPlano()

  const [selectedPlano, setSelectedPlano] = useState<NomePlano | null>(null)
  const [showSuspend, setShowSuspend] = useState(false)
  const [showReactivate, setShowReactivate] = useState(false)

  const handleSuspend = () => {
    suspender.mutate(tenantId, {
      onSuccess: () => {
        toast.success('Vendedor suspenso.')
        setShowSuspend(false)
      },
      onError: () => toast.error('Erro ao suspender.'),
    })
  }

  const handleReactivate = () => {
    reativar.mutate(tenantId, {
      onSuccess: () => {
        toast.success('Vendedor reativado.')
        setShowReactivate(false)
      },
      onError: () => toast.error('Erro ao reativar.'),
    })
  }

  const handleChangePlan = (plano: NomePlano) => {
    alterar.mutate(
      { id: tenantId, plano },
      {
        onSuccess: () => toast.success(`Plano alterado para ${plano}.`),
        onError: () => toast.error('Erro ao alterar plano.'),
      },
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
        <Skeleton className="h-40" />
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
        <Building2 className="w-12 h-12 mb-4" />
        <p>Vendedor não encontrado.</p>
        <Link
          href="/admin/tenants"
          className="mt-2 text-sm text-slate-600 hover:underline"
        >
          ← Voltar à lista
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/overview">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/tenants">Vendedores</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{tenant.nomeVendedor}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/tenants"
            className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {tenant.nomeVendedor}
            </h2>
            <p className="text-sm text-gray-500">{tenant.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={planoColor[tenant.plano ?? 'GRATUITO']}
          >
            {tenant.plano}
          </Badge>
          <Badge
            variant="secondary"
            className={statusColor[tenant.statusConta ?? 'ATIVO']}
          >
            {tenant.statusConta}
          </Badge>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Info card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow
              icon={Mail}
              label="E-mail"
              value={tenant.email ?? '—'}
            />
            <InfoRow
              icon={Building2}
              label="Plano"
              value={tenant.plano ?? '—'}
            />
            <InfoRow
              icon={Calendar}
              label="Data de cadastro"
              value={tenant.dataCadastro ? formatDate(tenant.dataCadastro) : '—'}
            />
            <InfoRow
              icon={Clock}
              label="Último acesso"
              value={
                tenant.ultimoAcesso ? formatDateTime(tenant.ultimoAcesso) : '—'
              }
            />
          </CardContent>
        </Card>

        {/* Usage card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Uso da Plataforma</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow
              icon={Package}
              label="Total de pacotes"
              value={String(tenant.totalPacotes ?? 0)}
            />
            <InfoRow
              icon={Users}
              label="Total de compradores"
              value={String(tenant.totalCompradores ?? 0)}
            />
            <InfoRow
              icon={SlidersHorizontal}
              label="MRR"
              value={formatBRL(tenant.mrrBrl ?? 0)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Management actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ações de Gerenciamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Plan change */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[120px]">
              Alterar plano:
            </label>
            <Select
              value={selectedPlano ?? tenant.plano ?? 'GRATUITO'}
              onValueChange={(v) => setSelectedPlano(v as NomePlano)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {planos.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              disabled={
                alterar.isPending ||
                (selectedPlano ?? tenant.plano) === tenant.plano
              }
              onClick={() =>
                handleChangePlan(selectedPlano ?? (tenant.plano as NomePlano))
              }
            >
              {alterar.isPending ? 'Salvando…' : 'Salvar plano'}
            </Button>
          </div>

          {/* Suspend / Reactivate */}
          <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            {tenant.statusConta !== 'SUSPENSO' ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowSuspend(true)}
              >
                <Pause className="w-4 h-4 mr-2" />
                Suspender vendedor
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowReactivate(true)}
              >
                <Play className="w-4 h-4 mr-2" />
                Reativar vendedor
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Suspend alert dialog ────────────────────────────── */}
      <AlertDialog open={showSuspend} onOpenChange={setShowSuspend}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspender vendedor?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{tenant.nomeVendedor}</strong> perderá acesso à plataforma
              até ser reativado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspend}
              className="bg-red-600 hover:bg-red-700"
            >
              {suspender.isPending ? 'Suspendendo…' : 'Suspender'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Reactivate alert dialog ─────────────────────────── */}
      <AlertDialog open={showReactivate} onOpenChange={setShowReactivate}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reativar vendedor?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{tenant.nomeVendedor}</strong> terá acesso restaurado à
              plataforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReactivate}
              className="bg-green-600 hover:bg-green-700"
            >
              {reativar.isPending ? 'Reativando…' : 'Reativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ── Info row helper ──────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-gray-400 shrink-0" />
      <span className="text-sm text-gray-500 min-w-[120px]">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        {value}
      </span>
    </div>
  )
}
