'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  Building2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuthStore } from '@/store/authStore'

// ── Navigation config ────────────────────────────────────────────────────

const navItems = [
  { icon: BarChart3, label: 'Overview', href: '/admin/overview' },
  { icon: Building2, label: 'Vendedores', href: '/admin/tenants' },
]

const routeTitleMap: Record<string, string> = {
  '/admin/overview': 'Overview',
  '/admin/tenants': 'Vendedores',
}

// ── Sidebar collapse persistence ────────────────────────────────────────

function useAdminSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('ign-admin-sidebar-collapsed')
    if (stored === 'true') setCollapsed(true)
  }, [])

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('ign-admin-sidebar-collapsed', String(next))
      return next
    })
  }

  return { collapsed, toggle }
}

// ── Component ────────────────────────────────────────────────────────────

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { collapsed, toggle } = useAdminSidebarCollapsed()
  const { usuario, logout } = useAuthStore()

  const pageTitle =
    routeTitleMap[pathname] ||
    (pathname.startsWith('/admin/tenants/') ? 'Detalhe do Vendedor' : 'Admin')
  const sidebarWidth = collapsed ? 56 : 220

  const initials = usuario
    ? usuario.nome
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '??'

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* ── Sidebar ─────────────────────────────────────────── */}
        <aside
          className="fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-200 ease-in-out z-30 flex flex-col"
          style={{ width: `${sidebarWidth}px` }}
        >
          {/* Logo + collapse toggle */}
          <div className="h-14 flex items-center justify-between px-3 border-b border-gray-200 dark:border-gray-800">
            {!collapsed ? (
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <div className="flex items-baseline gap-1">
                  <span className="font-bold text-lg text-slate-700 dark:text-slate-300">
                    Admin
                  </span>
                </div>
              </div>
            ) : (
              <Shield className="w-5 h-5 text-slate-600 dark:text-slate-400 mx-auto" />
            )}

            <button
              onClick={toggle}
              className="bg-gray-100 dark:bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              {!collapsed ? (
                <ChevronLeft className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-2">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive =
                  pathname === item.href ||
                  (item.href === '/admin/tenants' &&
                    pathname.startsWith('/admin/tenants'))

                const navLink = (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg text-sm transition cursor-pointer',
                      !collapsed ? 'px-3 py-2' : 'w-9 h-9 justify-center mx-auto',
                      isActive
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 font-medium border-l-2 border-slate-600'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border-l-2 border-transparent',
                    )}
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" />
                    {!collapsed && <span className="flex-1">{item.label}</span>}
                  </Link>
                )

                if (collapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>{navLink}</TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                }

                return navLink
              })}
            </div>
          </nav>

          {/* User footer */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-3">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 text-red-700 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium shrink-0">
                {initials}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {usuario?.nome || '—'}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {usuario?.email || '—'}
                  </div>
                </div>
              )}
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleLogout}
                      className="text-gray-400 hover:text-red-500 transition shrink-0"
                    >
                      <LogOut className="w-[18px] h-[18px]" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Sair</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-500 transition shrink-0"
                >
                  <LogOut className="w-[18px] h-[18px]" />
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* ── Topbar ──────────────────────────────────────────── */}
        <header
          className="fixed top-0 right-0 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-20 flex items-center justify-between px-6 transition-all duration-200"
          style={{ left: `${sidebarWidth}px` }}
        >
          <div className="flex items-center gap-3">
            <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              Admin
            </span>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {pageTitle}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {usuario?.nome}
          </div>
        </header>

        {/* ── Content ─────────────────────────────────────────── */}
        <main
          className="pt-14 min-h-screen transition-all duration-200"
          style={{ marginLeft: `${sidebarWidth}px` }}
        >
          <div className="p-6">{children}</div>
        </main>
      </div>
    </TooltipProvider>
  )
}
