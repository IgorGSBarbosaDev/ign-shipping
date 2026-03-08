'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { usuario, logout } = useAuthStore()
  const nome = usuario?.nome ?? 'Usuário'

  const getInitials = (n: string) => {
    const parts = n.split(' ')
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return n.slice(0, 2).toUpperCase()
  }

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar fixa no topo */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-gray-200 shadow-sm">
        <div className="h-full px-4 flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <button
            onClick={() => router.push('/portal/meus-pedidos')}
            className="flex items-center gap-1"
          >
            <span className="text-blue-600 font-bold text-lg">IGN</span>
            <span className="text-gray-700 font-normal text-lg">Shipping</span>
          </button>

          {/* User info */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-700">{nome}</span>
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-medium flex items-center justify-center">
              {getInitials(nome)}
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Conteúdo */}
      <main className="pt-14 pb-8">
        <div className="max-w-3xl mx-auto px-4">{children}</div>
      </main>
    </div>
  )
}
