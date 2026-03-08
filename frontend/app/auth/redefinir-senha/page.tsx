'use client'

import { useState, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Package, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordStrengthBar } from '@/components/shared/PasswordStrengthBar'
import { redefinirSenha } from '@/services/authService'

const schema = z
  .object({
    novaSenha: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Deve conter uma letra maiúscula')
      .regex(/[0-9]/, 'Deve conter um número')
      .regex(/[^A-Za-z0-9]/, 'Deve conter um caractere especial'),
    confirmarSenha: z.string(),
  })
  .refine((d) => d.novaSenha === d.confirmarSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmarSenha'],
  })

type RedefinirSenhaForm = z.infer<typeof schema>

function RedefinirSenhaContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RedefinirSenhaForm>({
    resolver: zodResolver(schema),
  })

  const novaSenhaValue = watch('novaSenha') || ''

  // No token → show invalid message
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-[420px] bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Package className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-semibold text-gray-900">IGN Shipping</span>
          </div>

          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Link inválido</h1>
            <p className="text-sm text-gray-500">
              Este link expirou ou já foi utilizado.
            </p>
          </div>

          <Link href="/auth/recuperar-senha">
            <Button className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
              Solicitar novo link
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const onSubmit = async (data: RedefinirSenhaForm) => {
    setApiError(null)
    try {
      await redefinirSenha({ token, novaSenha: data.novaSenha })
      setIsSuccess(true)
      // Redirect to login after 3s
      setTimeout(() => router.push('/auth/login'), 3000)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } }
      if (axiosErr?.response?.status === 422) {
        setApiError('Este link expirou ou já foi utilizado.')
      } else {
        setApiError(axiosErr?.response?.data?.message || 'Erro ao redefinir senha. Tente novamente.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Package className="w-6 h-6 text-blue-600" />
          <span className="text-xl font-semibold text-gray-900">IGN Shipping</span>
        </div>

        {isSuccess ? (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Senha redefinida com sucesso!</h1>
              <p className="text-sm text-gray-500">
                Agora você já pode fazer login com sua nova senha.
              </p>
            </div>

            <Link href="/auth/login">
              <Button className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                Ir para o login
              </Button>
            </Link>
          </>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Criar nova senha</h1>
              <p className="text-sm text-gray-500 mt-1">
                Escolha uma senha forte para proteger sua conta.
              </p>
            </div>

            {apiError && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Nova Senha */}
              <div className="space-y-2">
                <Label htmlFor="novaSenha">Nova senha*</Label>
                <div className="relative">
                  <Input
                    id="novaSenha"
                    type={showPassword ? 'text' : 'password'}
                    {...register('novaSenha')}
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
                {errors.novaSenha && (
                  <p className="text-xs text-red-500">{errors.novaSenha.message}</p>
                )}
              </div>

              <PasswordStrengthBar password={novaSenhaValue} />

              {/* Confirmar Senha */}
              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar nova senha*</Label>
                <div className="relative">
                  <Input
                    id="confirmarSenha"
                    type={showConfirm ? 'text' : 'password'}
                    {...register('confirmarSenha')}
                    className="h-10 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmarSenha && (
                  <p className="text-xs text-red-500">{errors.confirmarSenha.message}</p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Redefinir senha'
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={null}>
      <RedefinirSenhaContent />
    </Suspense>
  )
}
