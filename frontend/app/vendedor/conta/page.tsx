'use client'

import { useAuthStore } from '@/store/authStore'
import { useInfoPlano } from '@/hooks/vendedor/useConta'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { formatBRL } from '@/lib/utils'
import {
  User,
  Mail,
  Shield,
  Crown,
  BarChart3,
  AlertTriangle,
  Check,
  X,
  Package,
  Users,
  ShoppingBag,
} from 'lucide-react'

// ── Helpers ──────────────────────────────────────────────────────────────

const roleLabels: Record<string, string> = {
  VENDEDOR: 'Vendedor',
  COMPRADOR: 'Comprador',
  ADMIN: 'Administrador',
}

const planoColors: Record<string, { bg: string; text: string; badge: string }> = {
  GRATUITO: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-300',
    badge: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  },
  BASICO: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    badge: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
  },
  PRO: {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    badge: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
  },
  ENTERPRISE: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    badge: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300',
  },
}

function progressColor(pct: number) {
  if (pct > 80) return '[&>div]:bg-red-600'
  if (pct > 60) return '[&>div]:bg-amber-500'
  return '[&>div]:bg-blue-600'
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

// ── Skeleton ─────────────────────────────────────────────────────────────

function ContaSkeleton() {
  return (
    <div className="space-y-6">
      {/* Perfil skeleton */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-52" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-44" />
            </div>
          ))}
        </div>
      </div>

      {/* Plano skeleton */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function ContaPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const { data, isLoading, error } = useInfoPlano()

  if (isLoading) return <ContaSkeleton />

  const plano = data?.plano
  const uso = data?.uso
  const colors = planoColors[(plano?.nome as string) ?? ''] ?? planoColors.GRATUITO

  const pacotesMesPercent =
    uso?.pacotesMesLimite != null && uso.pacotesMesLimite > 0
      ? ((uso.pacotesMesUsados ?? 0) / uso.pacotesMesLimite) * 100
      : 0

  const compradoresPercent =
    uso?.compradoresLimite != null && uso.compradoresLimite > 0
      ? ((uso.compradoresUsados ?? 0) / uso.compradoresLimite) * 100
      : 0

  const produtosPercent =
    uso?.produtosLimite != null && uso.produtosLimite > 0
      ? ((uso.produtosUsados ?? 0) / uso.produtosLimite) * 100
      : 0

  return (
    <div className="space-y-6">
      {/* ── Perfil do Usuário ──────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 dark:bg-blue-950 rounded-lg p-2">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Perfil
          </h2>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white text-xl font-bold shrink-0">
            {usuario?.nome ? getInitials(usuario.nome) : '?'}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {usuario?.nome ?? '—'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {usuario?.email ?? '—'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Nome
              </span>
            </div>
            <p className="text-base text-gray-900 dark:text-white font-medium">
              {usuario?.nome ?? '—'}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                E-mail
              </span>
            </div>
            <p className="text-base text-gray-900 dark:text-white font-medium">
              {usuario?.email ?? '—'}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Shield className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Função
              </span>
            </div>
            <p className="text-base text-gray-900 dark:text-white font-medium">
              {usuario?.role ? roleLabels[usuario.role] ?? usuario.role : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Plano e Uso ────────────────────────────────────────────── */}
      {error ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <AlertTriangle className="w-10 h-10 text-red-400 mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              Erro ao carregar informações do plano.
            </p>
            <p className="text-gray-400 text-sm mt-1">Tente novamente mais tarde.</p>
          </div>
        </div>
      ) : !plano ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Crown className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              Nenhum plano ativo no momento.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6">
          {/* Header do plano */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 dark:bg-purple-950 rounded-lg p-2">
                <Crown className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Meu Plano
              </h2>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${colors.badge}`}
            >
              {plano.nome}
            </span>
          </div>

          {/* Preço */}
          <div className={`rounded-lg p-4 mb-6 ${colors.bg}`}>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold ${colors.text}`}>
                {plano.precoMensalBrl != null && plano.precoMensalBrl > 0
                  ? formatBRL(plano.precoMensalBrl)
                  : 'Grátis'}
              </span>
              {plano.precoMensalBrl != null && plano.precoMensalBrl > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">/mês</span>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            <div className="flex items-center gap-2">
              {plano.portalCompradorIncluido ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-gray-300 dark:text-gray-600" />
              )}
              <span
                className={`text-sm ${
                  plano.portalCompradorIncluido
                    ? 'text-gray-700 dark:text-gray-300'
                    : 'text-gray-400 dark:text-gray-600'
                }`}
              >
                Portal do comprador
              </span>
            </div>
            <div className="flex items-center gap-2">
              {plano.exportacaoIncluida ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-gray-300 dark:text-gray-600" />
              )}
              <span
                className={`text-sm ${
                  plano.exportacaoIncluida
                    ? 'text-gray-700 dark:text-gray-300'
                    : 'text-gray-400 dark:text-gray-600'
                }`}
              >
                Exportação de dados
              </span>
            </div>
          </div>

          {/* Uso dos limites */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-indigo-100 dark:bg-indigo-950 rounded-lg p-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                Uso do plano
              </h3>
            </div>

            <div className="space-y-5">
              {/* Pacotes este mês */}
              {uso?.pacotesMesLimite != null ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Pacotes este mês
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {uso.pacotesMesUsados ?? 0} / {uso.pacotesMesLimite}
                    </span>
                  </div>
                  <Progress
                    value={pacotesMesPercent}
                    className={`h-2 ${progressColor(pacotesMesPercent)}`}
                  />
                  {pacotesMesPercent >= 80 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Você está próximo do limite
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Pacotes este mês
                    </span>
                  </div>
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    Ilimitado
                  </span>
                </div>
              )}

              {/* Compradores */}
              {uso?.compradoresLimite != null ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Compradores
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {uso.compradoresUsados ?? 0} / {uso.compradoresLimite}
                    </span>
                  </div>
                  <Progress
                    value={compradoresPercent}
                    className={`h-2 ${progressColor(compradoresPercent)}`}
                  />
                  {compradoresPercent >= 80 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Você está próximo do limite
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Compradores
                    </span>
                  </div>
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    Ilimitado
                  </span>
                </div>
              )}

              {/* Produtos */}
              {uso?.produtosLimite != null ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Produtos
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {uso.produtosUsados ?? 0} / {uso.produtosLimite}
                    </span>
                  </div>
                  <Progress
                    value={produtosPercent}
                    className={`h-2 ${progressColor(produtosPercent)}`}
                  />
                  {produtosPercent >= 80 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Você está próximo do limite
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Produtos
                    </span>
                  </div>
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    Ilimitado
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
