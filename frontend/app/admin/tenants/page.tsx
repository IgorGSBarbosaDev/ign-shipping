'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Eye,
  MoreHorizontal,
  Pause,
  Play,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  useAdminTenants,
  useSuspenderTenant,
  useReativarTenant,
  useAlterarPlano,
} from '@/hooks/admin/useAdminTenants'
import { formatBRL, formatDate, formatDateTime } from '@/lib/utils'
import type { NomePlano, StatusConta } from '@/services/adminService'
import type { TenantAdminResponse } from '@/services/adminService'
import { toast } from 'sonner'

// ── Constants ────────────────────────────────────────────────────────────

const planos: NomePlano[] = ['GRATUITO', 'BASICO', 'PRO', 'ENTERPRISE']
const statuses: StatusConta[] = ['TRIAL', 'ATIVO', 'SUSPENSO', 'CANCELADO']

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

export default function TenantsPage() {
  // Filters
  const [planoFilter, setPlanoFilter] = useState<NomePlano | 'ALL'>('ALL')
  const [statusFilter, setStatusFilter] = useState<StatusConta | 'ALL'>('ALL')
  const [search, setSearch] = useState('')

  // Dialogs
  const [planDialogTenant, setPlanDialogTenant] = useState<TenantAdminResponse | null>(null)
  const [newPlano, setNewPlano] = useState<NomePlano>('GRATUITO')
  const [suspendTarget, setSuspendTarget] = useState<TenantAdminResponse | null>(null)
  const [reactivateTarget, setReactivateTarget] = useState<TenantAdminResponse | null>(null)

  // Queries & mutations
  const queryParams = {
    ...(planoFilter !== 'ALL' && { plano: planoFilter }),
    ...(statusFilter !== 'ALL' && { status: statusFilter }),
  }
  const { data: tenants, isLoading, refetch } = useAdminTenants(
    Object.keys(queryParams).length > 0 ? queryParams : undefined,
  )
  const suspender = useSuspenderTenant()
  const reativar = useReativarTenant()
  const alterar = useAlterarPlano()

  // Client-side search filter
  const filtered = useMemo(() => {
    if (!tenants) return []
    if (!search.trim()) return tenants
    const q = search.toLowerCase()
    return tenants.filter(
      (t) =>
        t.nomeVendedor?.toLowerCase().includes(q) ||
        t.email?.toLowerCase().includes(q),
    )
  }, [tenants, search])

  // Actions
  const handleSuspend = () => {
    if (!suspendTarget?.id) return
    suspender.mutate(suspendTarget.id, {
      onSuccess: () => {
        toast.success(`${suspendTarget.nomeVendedor} foi suspenso.`)
        setSuspendTarget(null)
      },
      onError: () => toast.error('Erro ao suspender vendedor.'),
    })
  }

  const handleReactivate = () => {
    if (!reactivateTarget?.id) return
    reativar.mutate(reactivateTarget.id, {
      onSuccess: () => {
        toast.success(`${reactivateTarget.nomeVendedor} foi reativado.`)
        setReactivateTarget(null)
      },
      onError: () => toast.error('Erro ao reativar vendedor.'),
    })
  }

  const handleChangePlan = () => {
    if (!planDialogTenant?.id) return
    alterar.mutate(
      { id: planDialogTenant.id, plano: newPlano },
      {
        onSuccess: () => {
          toast.success(`Plano alterado para ${newPlano}.`)
          setPlanDialogTenant(null)
        },
        onError: () => toast.error('Erro ao alterar plano.'),
      },
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters bar */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou e-mail…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={planoFilter}
            onValueChange={(v) => setPlanoFilter(v as NomePlano | 'ALL')}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Plano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os planos</SelectItem>
              {planos.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusConta | 'ALL')}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os status</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
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
                  <TableHead className="text-right">Pacotes</TableHead>
                  <TableHead className="text-right">Compradores</TableHead>
                  <TableHead className="text-right">MRR</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
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
                      {t.totalPacotes ?? 0}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {t.totalCompradores ?? 0}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatBRL(t.mrrBrl ?? 0)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {t.dataCadastro ? formatDate(t.dataCadastro) : '—'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/tenants/${t.id}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver detalhes
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setPlanDialogTenant(t)
                              setNewPlano(t.plano ?? 'GRATUITO')
                            }}
                          >
                            <SlidersHorizontal className="w-4 h-4 mr-2" />
                            Alterar plano
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {t.statusConta !== 'SUSPENSO' ? (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => setSuspendTarget(t)}
                            >
                              <Pause className="w-4 h-4 mr-2" />
                              Suspender
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-green-600"
                              onClick={() => setReactivateTarget(t)}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Reativar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                      Nenhum vendedor encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Plan change dialog ─────────────────────────────────── */}
      <Dialog
        open={!!planDialogTenant}
        onOpenChange={(open) => !open && setPlanDialogTenant(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Plano</DialogTitle>
            <DialogDescription>
              Alterar plano de <strong>{planDialogTenant?.nomeVendedor}</strong> (
              {planDialogTenant?.plano}).
            </DialogDescription>
          </DialogHeader>
          <Select
            value={newPlano}
            onValueChange={(v) => setNewPlano(v as NomePlano)}
          >
            <SelectTrigger>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialogTenant(null)}>
              Cancelar
            </Button>
            <Button onClick={handleChangePlan} disabled={alterar.isPending}>
              {alterar.isPending ? 'Salvando…' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Suspend alert dialog ───────────────────────────────── */}
      <AlertDialog
        open={!!suspendTarget}
        onOpenChange={(open) => !open && setSuspendTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspender vendedor?</AlertDialogTitle>
            <AlertDialogDescription>
              O vendedor <strong>{suspendTarget?.nomeVendedor}</strong> perderá acesso
              à plataforma até ser reativado.
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

      {/* ── Reactivate alert dialog ────────────────────────────── */}
      <AlertDialog
        open={!!reactivateTarget}
        onOpenChange={(open) => !open && setReactivateTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reativar vendedor?</AlertDialogTitle>
            <AlertDialogDescription>
              O vendedor <strong>{reactivateTarget?.nomeVendedor}</strong> terá acesso
              restaurado à plataforma.
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
