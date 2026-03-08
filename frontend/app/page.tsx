import Link from 'next/link'
import { Package, ArrowRight, UserPlus, LogIn, KeyRound, LayoutDashboard } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-600">
              <Package className="size-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">IGN Shipping</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Bem-vindo ao IGN Shipping
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Plataforma completa de gestão logística e envios para vendedores e compradores
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Authentication Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Autenticação</h2>
            <div className="space-y-4">
              <Link
                href="/auth/login"
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 group-hover:bg-blue-600 transition-colors">
                    <LogIn className="size-5 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Login</div>
                    <div className="text-sm text-gray-600">Acessar sua conta</div>
                  </div>
                </div>
                <ArrowRight className="size-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </Link>

              <Link
                href="/auth/cadastro"
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-green-100 group-hover:bg-blue-600 transition-colors">
                    <UserPlus className="size-5 text-green-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Cadastro</div>
                    <div className="text-sm text-gray-600">Criar nova conta</div>
                  </div>
                </div>
                <ArrowRight className="size-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </Link>

              <Link
                href="/auth/recuperar-senha"
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 group-hover:bg-blue-600 transition-colors">
                    <KeyRound className="size-5 text-amber-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Recuperar Senha</div>
                    <div className="text-sm text-gray-600">Redefinir acesso</div>
                  </div>
                </div>
                <ArrowRight className="size-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </Link>
            </div>
          </div>

          {/* Dashboard Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Área do Vendedor</h2>
            <div className="space-y-4">
              <Link
                href="/vendedor/dashboard"
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100 group-hover:bg-blue-600 transition-colors">
                    <LayoutDashboard className="size-5 text-purple-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Dashboard</div>
                    <div className="text-sm text-gray-600">Painel administrativo</div>
                  </div>
                </div>
                <ArrowRight className="size-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </Link>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div className="text-sm font-medium text-gray-900 mb-2">Recursos incluídos:</div>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Layout com sidebar colapsável</li>
                  <li>• Dark mode completo</li>
                  <li>• Componentes StatusChip</li>
                  <li>• Componentes MargemBar</li>
                  <li>• Componentes AvatarStack</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
            <Package className="size-4" />
            <span>Sistema de autenticação e dashboard vendedor implementados</span>
          </div>
        </div>
      </main>
    </div>
  )
}
