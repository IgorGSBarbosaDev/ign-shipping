'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Package, Mail, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { recuperarSenha } from '@/services/authService'

const schema = z.object({
  email: z.string().email('Email inválido'),
})

type RecuperarSenhaForm = z.infer<typeof schema>

export default function RecuperarSenhaPage() {
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecuperarSenhaForm>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: RecuperarSenhaForm) => {
    try {
      await recuperarSenha({ email: data.email })
    } catch {
      // Silently succeed — never reveal if email exists
    }
    setIsSuccess(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Package className="w-6 h-6 text-blue-600" />
          <span className="text-xl font-semibold text-gray-900">IGN Shipping</span>
        </div>

        {!isSuccess ? (
          <>
            {/* Back link */}
            <Link
              href="/auth/login"
              className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-flex items-center gap-1"
            >
              ← Voltar para o login
            </Link>

            {/* Icon */}
            <div className="flex justify-center mb-6 mt-6">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                <Mail className="w-10 h-10 text-blue-600" />
              </div>
            </div>

            {/* Header */}
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-semibold text-gray-900">Recuperar senha</h1>
              <p className="text-sm text-gray-500 mt-2">
                Digite seu email e enviaremos um link para redefinir sua senha.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar instruções'
                )}
              </Button>
            </form>
          </>
        ) : (
          <>
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Verifique seu email</h1>
              <p className="text-sm text-gray-500">
                Se este email estiver cadastrado, você receberá as instruções em breve.
                Verifique também sua caixa de spam.
              </p>
            </div>

            {/* Back to login link */}
            <Link href="/auth/login">
              <Button className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                Voltar para o login
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
