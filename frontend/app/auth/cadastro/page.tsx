'use client'

import { useState, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Package, User, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { PasswordStrengthBar } from '@/components/shared/PasswordStrengthBar'
import { cadastrarVendedor, cadastrarComprador } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'

type AccountType = 'seller' | 'buyer' | null

// ── Schemas ──────────────────────────────────────────────────────────────

const vendedorSchema = z
  .object({
    nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    email: z.string().email('Email inválido'),
    senha: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Deve conter uma letra maiúscula')
      .regex(/[0-9]/, 'Deve conter um número')
      .regex(/[^A-Za-z0-9]/, 'Deve conter um caractere especial'),
    confirmarSenha: z.string(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'Você deve aceitar os termos de uso' }),
    }),
  })
  .refine((d) => d.senha === d.confirmarSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmarSenha'],
  })

const compradorSchema = z
  .object({
    nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    email: z.string().email('Email inválido'),
    senha: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Deve conter uma letra maiúscula')
      .regex(/[0-9]/, 'Deve conter um número')
      .regex(/[^A-Za-z0-9]/, 'Deve conter um caractere especial'),
    confirmarSenha: z.string(),
    codigoConvite: z.string().min(1, 'Código de convite obrigatório'),
  })
  .refine((d) => d.senha === d.confirmarSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmarSenha'],
  })

type VendedorForm = z.infer<typeof vendedorSchema>
type CompradorForm = z.infer<typeof compradorSchema>

// ── Page component ───────────────────────────────────────────────────────

function CadastroContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAuth = useAuthStore((s) => s.setAuth)

  const conviteFromUrl = searchParams.get('convite') || ''

  const [step, setStep] = useState<'select' | 'form'>(conviteFromUrl ? 'form' : 'select')
  const [accountType, setAccountType] = useState<AccountType>(conviteFromUrl ? 'buyer' : null)
  const [apiError, setApiError] = useState<string | null>(null)

  // ── Vendedor form ─────────────────────────────────────────────────────
  const vendedorForm = useForm<VendedorForm>({
    resolver: zodResolver(vendedorSchema),
    defaultValues: { nome: '', email: '', senha: '', confirmarSenha: '', acceptTerms: undefined as unknown as true },
  })

  // ── Comprador form ────────────────────────────────────────────────────
  const compradorForm = useForm<CompradorForm>({
    resolver: zodResolver(compradorSchema),
    defaultValues: { nome: '', email: '', senha: '', confirmarSenha: '', codigoConvite: conviteFromUrl },
  })

  const handleSelectAccountType = (type: AccountType) => {
    setAccountType(type)
    setStep('form')
    setApiError(null)
  }

  const handleBack = () => {
    setStep('select')
    setAccountType(null)
    setApiError(null)
  }

  // Helper to handle auth response and redirect by role
  const handleAuthSuccess = (res: { accessToken?: string; usuario?: { id?: number; nome?: string; email?: string; role?: string; tenantId?: number | null } }) => {
    if (res.accessToken && res.usuario) {
      setAuth(res.accessToken, {
        id: res.usuario.id!,
        nome: res.usuario.nome!,
        email: res.usuario.email!,
        role: res.usuario.role as 'VENDEDOR' | 'COMPRADOR' | 'ADMIN',
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
  }

  const onSubmitVendedor = async (data: VendedorForm) => {
    setApiError(null)
    try {
      const res = await cadastrarVendedor({
        nome: data.nome,
        email: data.email,
        senha: data.senha,
      })
      handleAuthSuccess(res)
    } catch (err: unknown) {
      const axiosErr = err as { validationErrors?: Record<string, string[]>; response?: { data?: { message?: string } } }
      if (axiosErr.validationErrors) {
        const msgs = Object.values(axiosErr.validationErrors).flat()
        setApiError(msgs.join('. '))
      } else {
        setApiError(axiosErr.response?.data?.message || 'Erro ao criar conta. Tente novamente.')
      }
    }
  }

  const onSubmitComprador = async (data: CompradorForm) => {
    setApiError(null)
    try {
      const res = await cadastrarComprador({
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        codigoConvite: data.codigoConvite,
      })
      handleAuthSuccess(res)
    } catch (err: unknown) {
      const axiosErr = err as { validationErrors?: Record<string, string[]>; response?: { data?: { message?: string } } }
      if (axiosErr.validationErrors) {
        const msgs = Object.values(axiosErr.validationErrors).flat()
        setApiError(msgs.join('. '))
      } else {
        setApiError(axiosErr.response?.data?.message || 'Erro ao criar conta. Tente novamente.')
      }
    }
  }

  // ── Step 1: Account type selection ────────────────────────────────────
  if (step === 'select') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-[420px] bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Package className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-semibold text-gray-900">IGN Shipping</span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Criar sua conta</h1>
            <p className="text-sm text-gray-500 mt-1">Como você vai usar o IGN Shipping?</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSelectAccountType('seller')}
              className="border-2 border-gray-200 rounded-xl p-5 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition text-left"
            >
              <Package className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Sou Revendedor</h3>
              <p className="text-xs text-gray-600 mb-3">Quero gerenciar minhas importações</p>
              <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                Trial de 14 dias grátis
              </span>
            </button>

            <button
              onClick={() => handleSelectAccountType('buyer')}
              className="border-2 border-gray-200 rounded-xl p-5 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition text-left"
            >
              <User className="w-8 h-8 text-gray-500 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Fui convidado</h3>
              <p className="text-xs text-gray-600">Tenho um código de convite de um revendedor</p>
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Fazer login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 2: Form ──────────────────────────────────────────────────────
  const isVendedor = accountType === 'seller'
  const currentForm = isVendedor ? vendedorForm : compradorForm
  const senhaValue = currentForm.watch('senha')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Package className="w-6 h-6 text-blue-600" />
          <span className="text-xl font-semibold text-gray-900">IGN Shipping</span>
        </div>

        <button
          onClick={handleBack}
          className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
        >
          ← Voltar
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {isVendedor ? 'Criar conta de revendedor' : 'Criar conta de comprador'}
          </h1>
        </div>

        {apiError && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{apiError}</span>
          </div>
        )}

        <form
          onSubmit={
            isVendedor
              ? vendedorForm.handleSubmit(onSubmitVendedor)
              : compradorForm.handleSubmit(onSubmitComprador)
          }
          className="space-y-4"
        >
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome completo*</Label>
            <Input
              id="nome"
              {...currentForm.register('nome')}
              className="h-10 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            {currentForm.formState.errors.nome && (
              <p className="text-xs text-red-500">{currentForm.formState.errors.nome.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email*</Label>
            <Input
              id="email"
              type="email"
              {...currentForm.register('email')}
              className="h-10 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            {currentForm.formState.errors.email && (
              <p className="text-xs text-red-500">{currentForm.formState.errors.email.message}</p>
            )}
          </div>

          {/* Código de convite (comprador only) */}
          {!isVendedor && (
            <div className="space-y-2">
              <Label htmlFor="codigoConvite">Código de convite*</Label>
              <Input
                id="codigoConvite"
                placeholder="XXXX-XXXX"
                {...compradorForm.register('codigoConvite')}
                className="h-10 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-mono"
              />
              {compradorForm.formState.errors.codigoConvite && (
                <p className="text-xs text-red-500">
                  {compradorForm.formState.errors.codigoConvite.message}
                </p>
              )}
              <p className="text-xs text-gray-400">
                Peça o código ao seu revendedor ou use o link que ele enviou
              </p>
            </div>
          )}

          {/* Senha */}
          <PasswordField
            id="senha"
            label="Senha*"
            registration={currentForm.register('senha')}
            error={currentForm.formState.errors.senha?.message}
          />

          {/* Strength bar */}
          <PasswordStrengthBar password={senhaValue || ''} />

          {/* Confirmar Senha */}
          <PasswordField
            id="confirmarSenha"
            label="Confirmar senha*"
            registration={currentForm.register('confirmarSenha')}
            error={currentForm.formState.errors.confirmarSenha?.message}
          />

          {/* Termos (vendedor only) */}
          {isVendedor && (
            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={vendedorForm.watch('acceptTerms') === true}
                onCheckedChange={(checked) =>
                  vendedorForm.setValue('acceptTerms', checked as true, { shouldValidate: true })
                }
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                Li e aceito os Termos de Uso e a Política de Privacidade
              </label>
            </div>
          )}
          {isVendedor && vendedorForm.formState.errors.acceptTerms && (
            <p className="text-xs text-red-500">{vendedorForm.formState.errors.acceptTerms.message}</p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={currentForm.formState.isSubmitting}
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            {currentForm.formState.isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando conta...
              </>
            ) : isVendedor ? (
              'Criar conta e iniciar trial de 14 dias'
            ) : (
              'Criar minha conta'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

// ── Reusable password field ──────────────────────────────────────────────
function PasswordField({
  id,
  label,
  registration,
  error,
}: {
  id: string
  label: string
  registration: ReturnType<ReturnType<typeof useForm>['register']>
  error?: string
}) {
  const [show, setShow] = useState(false)

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          {...registration}
          className="h-10 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 pr-10"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ── Default export with Suspense ─────────────────────────────────────────
export default function CadastroPage() {
  return (
    <Suspense fallback={null}>
      <CadastroContent />
    </Suspense>
  )
}
