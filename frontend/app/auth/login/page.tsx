'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Package, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha é obrigatória'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setApiError(null)
    try {
      const res = await login(data)
      if (res.accessToken && res.usuario) {
        setAuth(res.accessToken, {
          id: res.usuario.id!,
          nome: res.usuario.nome!,
          email: res.usuario.email!,
          role: res.usuario.role!,
          tenantId: res.usuario.tenantId ?? null,
        })

        switch (res.usuario.role) {
          case 'VENDEDOR':
            router.push('/vendedor/dashboard')
            break
          case 'COMPRADOR':
            router.push('/portal/meus-pedidos')
            break
          case 'ADMIN':
            router.push('/admin/overview')
            break
        }
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } }
      if (axiosErr?.response?.status === 401) {
        setApiError('Email ou senha incorretos.')
      } else {
        setApiError('Ocorreu um erro inesperado. Tente novamente.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Package className="w-6 h-6 text-blue-600" />
          <span className="text-xl font-semibold text-gray-900">IGN Shipping</span>
        </div>

        {/* Error Banner */}
        {apiError && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{apiError}</span>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Bem-vindo de volta</h1>
          <p className="text-sm text-gray-500 mt-1">Faça login na sua conta</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              {...register('email')}
              className="h-10 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <div className="relative">
              <Input
                id="senha"
                type={showPassword ? 'text' : 'password'}
                {...register('senha')}
                className="h-10 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.senha && (
              <p className="text-xs text-red-500">{errors.senha.message}</p>
            )}
          </div>

          {/* Forgot password */}
          <div className="flex items-center justify-end">
            <Link
              href="/auth/recuperar-senha"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Esqueci minha senha
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">ou</span>
            </div>
          </div>

          {/* Sign up link */}
          <div className="text-center text-sm text-gray-600">
            Não tem uma conta?{' '}
            <Link href="/auth/cadastro" className="text-blue-600 hover:text-blue-700 font-medium">
              Criar conta gratuita
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
