'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Package,
  LayoutGrid,
  Users,
  ShoppingBag,
  Calculator,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuthStore } from '@/store/authStore'
import { useTheme } from '@/components/theme-provider'
import { usePacotes } from '@/hooks/vendedor/usePacotes'

// ── Navigation config ────────────────────────────────────────────────────

type NavItem = {
  icon: typeof LayoutGrid
  label: string
  href: string
  badge?: string
}

type NavSection = {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: 'Principal',
    items: [
      { icon: LayoutGrid, label: 'Dashboard', href: '/vendedor/dashboard' },
      { icon: Package, label: 'Pacotes', href: '/vendedor/pacotes', badge: '3' },
      { icon: Users, label: 'Compradores', href: '/vendedor/compradores' },
      { icon: ShoppingBag, label: 'Produtos', href: '/vendedor/produtos' },
    ],
  },
  {
    title: 'Ferramentas',
    items: [
      { icon: Calculator, label: 'Simulador de Custo', href: '/vendedor/simulador' },
    ],
  },
]

// ── Route → page title mapping ──────────────────────────────────────────

const routeTitleMap: Record<string, string> = {
  '/vendedor/dashboard': 'Dashboard',
  '/vendedor/pacotes': 'Pacotes',
  '/vendedor/compradores': 'Compradores',
  '/vendedor/produtos': 'Produtos',
  '/vendedor/simulador': 'Simulador de Custo',
  '/vendedor/conta': 'Minha Conta',
}

// ── Sidebar collapse persistence ────────────────────────────────────────

function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('ign-sidebar-collapsed')
    if (stored === 'true') setCollapsed(true)
  }, [])

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('ign-sidebar-collapsed', String(next))
      return next
    })
  }

  return { collapsed, toggle }
}

// ── Component ────────────────────────────────────────────────────────────

type VendedorLayoutProps = {
  children: React.ReactNode
}

export function VendedorLayout({ children }: VendedorLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { collapsed, toggle } = useSidebarCollapsed()
  const { theme, setTheme } = useTheme()
  const { usuario, logout } = useAuthStore()
  const { data: pacotes } = usePacotes()

  const pacotesNaoFinalizados = useMemo(() => {
    return (pacotes ?? []).filter((pacote) => pacote.status !== 'FINALIZADO').length
  }, [pacotes])

  const pageTitle = routeTitleMap[pathname] || 'IGN Shipping'
  const sidebarWidth = collapsed ? 56 : 240

  // Initials for avatar
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
        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <aside
          className="fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-200 ease-in-out z-30 flex flex-col"
          style={{ width: `${sidebarWidth}px` }}
        >
          {/* Logo + collapse toggle */}
          <div className="h-14 flex items-center justify-between px-3 border-b border-gray-200 dark:border-gray-800">
            {!collapsed ? (
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <div className="flex items-baseline gap-1">
                  <span className="font-bold text-xl text-blue-600">IGN</span>
                  <span className="text-lg text-gray-900 dark:text-white">Shipping</span>
                </div>
              </div>
            ) : (
              <Package className="w-5 h-5 text-blue-600 mx-auto" />
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
            {navSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className={sectionIndex > 0 ? 'mt-6' : ''}>
                {!collapsed && (
                  <div className="px-3 mb-2">
                    <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                      {section.title}
                    </span>
                  </div>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    const badgeValue =
                      item.href === '/vendedor/pacotes'
                        ? (pacotesNaoFinalizados > 0 ? String(pacotesNaoFinalizados) : undefined)
                        : item.badge

                    const navLink = (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg text-sm transition cursor-pointer',
                          !collapsed ? 'px-3 py-2' : 'w-9 h-9 justify-center mx-auto',
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-medium border-l-2 border-blue-600'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border-l-2 border-transparent'
                        )}
                      >
                        <Icon className="w-[18px] h-[18px] shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="flex-1">{item.label}</span>
                            {badgeValue && (
                              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                                {badgeValue}
                              </span>
                            )}
                          </>
                        )}
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
              </div>
            ))}
          </nav>

          {/* User footer */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-3">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium shrink-0">
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

        {/* ── Topbar ──────────────────────────────────────────────── */}
        <header
          className="fixed top-0 right-0 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-20 flex items-center justify-between px-6 transition-all duration-200"
          style={{ left: `${sidebarWidth}px` }}
        >
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {pageTitle}
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 w-9 h-9 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <Sun className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </header>

        {/* ── Content ─────────────────────────────────────────────── */}
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
