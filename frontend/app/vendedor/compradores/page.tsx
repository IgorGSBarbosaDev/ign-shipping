'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  UserPlus,
  Users,
  Phone,
  Pencil,
  Trash2,
  Link2,
  Copy,
  Check,
  Loader2,
  MoreVertical,
  AlertTriangle,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useCompradores,
  useCriarComprador,
  useAtualizarComprador,
  useDeletarComprador,
  useGerarConvite,
} from '@/hooks/vendedor/useCompradores'
import { formatBRL } from '@/lib/utils'
import type { CompradorResponse } from '@/services/compradorService'

// ── Zod schema ──────────────────────────────────────────────────────────

const compradorSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').or(z.literal('')).optional(),
  telefone: z.string().optional(),
})

type CompradorForm = z.infer<typeof compradorSchema>

// ── Helpers ─────────────────────────────────────────────────────────────

function getAvatarColor(nome: string) {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-teal-500',
  ]
  const hash = nome.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

function getInitials(nome: string) {
  const parts = nome.split(' ')
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return nome.slice(0, 2).toUpperCase()
}

// ── Skeleton ────────────────────────────────────────────────────────────

function CompradoresSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-9 w-44" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-5"
          >
            <div className="flex items-start gap-3 mb-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <Skeleton className="h-px w-full my-3" />
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function CompradoresPage() {
  const router = useRouter()
  const { data: compradores, isLoading, error } = useCompradores()
  const criarMutation = useCriarComprador()
  const atualizarMutation = useAtualizarComprador()
  const deletarMutation = useDeletarComprador()
  const conviteMutation = useGerarConvite()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isInviteLinkModalOpen, setIsInviteLinkModalOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [selectedComprador, setSelectedComprador] = useState<CompradorResponse | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const [conviteLink, setConviteLink] = useState('')
  const [apiError, setApiError] = useState('')

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompradorForm>({ resolver: zodResolver(compradorSchema) })

  // ── Handlers ──────────────────────────────────────────────────────

  const handleCreateComprador = () => {
    reset({ nome: '', email: '', telefone: '' })
    setApiError('')
    setIsCreateModalOpen(true)
  }

  const handleEditComprador = (comprador: CompradorResponse) => {
    setSelectedComprador(comprador)
    reset({
      nome: comprador.nome ?? '',
      email: comprador.email ?? '',
      telefone: comprador.telefone ?? '',
    })
    setApiError('')
    setIsEditModalOpen(true)
  }

  const handleDeleteComprador = (comprador: CompradorResponse) => {
    setSelectedComprador(comprador)
    setIsDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (!selectedComprador?.id) return
    deletarMutation.mutate(selectedComprador.id, {
      onSuccess: () => setIsDeleteConfirmOpen(false),
    })
  }

  const handleGenerateInviteLink = (comprador: CompradorResponse) => {
    setSelectedComprador(comprador)
    setLinkCopied(false)
    setConviteLink('')
    setIsInviteLinkModalOpen(true)

    conviteMutation.mutate(comprador.id!, {
      onSuccess: (res) => {
        setConviteLink(res.linkConvite ?? '')
      },
    })
  }

  const onSubmitCreate = (formData: CompradorForm) => {
    setApiError('')
    criarMutation.mutate(
      {
        nome: formData.nome,
        email: formData.email || undefined,
        telefone: formData.telefone || undefined,
      },
      {
        onSuccess: () => setIsCreateModalOpen(false),
        onError: (err: any) => {
          setApiError(err?.response?.data?.message || 'Erro ao criar comprador')
        },
      }
    )
  }

  const onSubmitEdit = (formData: CompradorForm) => {
    if (!selectedComprador?.id) return
    setApiError('')
    atualizarMutation.mutate(
      {
        id: selectedComprador.id,
        data: {
          nome: formData.nome,
          email: formData.email || undefined,
          telefone: formData.telefone || undefined,
        },
      },
      {
        onSuccess: () => setIsEditModalOpen(false),
        onError: (err: any) => {
          setApiError(err?.response?.data?.message || 'Erro ao atualizar comprador')
        },
      }
    )
  }

  const handleCopyLink = () => {
    if (!conviteLink) return
    navigator.clipboard.writeText(conviteLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const handleAbrirHistorico = (compradorId?: number) => {
    if (!compradorId) return
    router.push(`/vendedor/compradores/${compradorId}`)
  }

  // ── Render ────────────────────────────────────────────────────────

  if (isLoading) return <CompradoresSkeleton />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Erro ao carregar compradores.
        </p>
      </div>
    )
  }

  const list = compradores ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Compradores</h1>
        <Button
          onClick={handleCreateComprador}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 h-9"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Novo comprador
        </Button>
      </div>

      {/* Grid de cards */}
      {list.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">Nenhum comprador ainda</p>
          <Button
            onClick={handleCreateComprador}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Adicionar primeiro comprador
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {list.map((comprador) => (
            <div
              key={comprador.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-5 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleAbrirHistorico(comprador.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  handleAbrirHistorico(comprador.id)
                }
              }}
            >
              {/* Header do card */}
              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-full ${getAvatarColor(
                    comprador.nome ?? ''
                  )} flex items-center justify-center text-white font-semibold text-sm shrink-0`}
                >
                  {getInitials(comprador.nome ?? '')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {comprador.nome}
                  </p>
                  <p className="text-sm text-gray-400 truncate">{comprador.email || '—'}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
                    <DropdownMenuItem onClick={() => handleEditComprador(comprador)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Editar comprador
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleGenerateInviteLink(comprador)}>
                      <Link2 className="w-4 h-4 mr-2" />
                      Gerar link de convite
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-500"
                      onClick={() => handleDeleteComprador(comprador)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Telefone */}
              {comprador.telefone && (
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                  <Phone className="w-3 h-3" />
                  {comprador.telefone}
                </div>
              )}

              <div className="border-t border-gray-100 dark:border-gray-800 my-3" />

              {/* Métricas */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pedidos</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {comprador.totalPedidos ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total gasto</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {formatBRL(comprador.totalGastoBrl ?? 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Lucro gerado</p>
                  <p className="font-semibold text-green-600 dark:text-green-400 text-sm">
                    {formatBRL(comprador.lucroGeradoBrl ?? 0)}
                  </p>
                </div>
              </div>

              {/* Badge pendente */}
              {(comprador.totalPendenteBrl ?? 0) > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 text-xs font-medium px-2 py-1 rounded-full">
                    {formatBRL(comprador.totalPendenteBrl ?? 0)} pendente
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Modal Criar Comprador ──────────────────────────────── */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo comprador</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitCreate)}>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('nome')}
                  className="w-full h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome completo"
                />
                {errors.nome && (
                  <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@exemplo.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Telefone
                </label>
                <input
                  {...register('telefone')}
                  className="w-full h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(11) 99999-9999"
                />
              </div>
              {apiError && (
                <p className="text-red-500 text-sm bg-red-50 dark:bg-red-950/30 p-2 rounded">
                  {apiError}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={criarMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {criarMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Modal Editar Comprador ─────────────────────────────── */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar comprador</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitEdit)}>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('nome')}
                  className="w-full h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome completo"
                />
                {errors.nome && (
                  <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@exemplo.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Telefone
                </label>
                <input
                  {...register('telefone')}
                  className="w-full h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(11) 99999-9999"
                />
              </div>
              {apiError && (
                <p className="text-red-500 text-sm bg-red-50 dark:bg-red-950/30 p-2 rounded">
                  {apiError}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={atualizarMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {atualizarMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Modal Confirmar Exclusão ───────────────────────────── */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir comprador</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 dark:text-gray-400 py-2">
            Tem certeza que deseja excluir <strong>{selectedComprador?.nome}</strong>? Esta ação
            não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={deletarMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deletarMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal Link de Convite ──────────────────────────────── */}
      <Dialog open={isInviteLinkModalOpen} onOpenChange={setIsInviteLinkModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5" />
              Link de convite
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Compartilhe este link com <strong>{selectedComprador?.nome}</strong> para que ele
              crie uma conta no portal.
            </p>

            {conviteMutation.isPending ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-sm text-gray-500">Gerando link...</span>
              </div>
            ) : conviteMutation.isError ? (
              <p className="text-red-500 text-sm bg-red-50 dark:bg-red-950/30 p-3 rounded">
                Erro ao gerar convite. Tente novamente.
              </p>
            ) : (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={conviteLink}
                    className="flex-1 bg-transparent text-sm text-gray-600 dark:text-gray-400 truncate focus:outline-none"
                  />
                  <Button
                    onClick={handleCopyLink}
                    size="sm"
                    variant={linkCopied ? 'default' : 'outline'}
                    className={
                      linkCopied ? 'bg-green-600 hover:bg-green-700 text-white' : ''
                    }
                  >
                    {linkCopied ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-400 mt-3">
              Compartilhe este link com seu cliente para que ele crie uma conta no portal.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsInviteLinkModalOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
