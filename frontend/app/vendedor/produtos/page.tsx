'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Package, Pencil, Trash2, ShoppingBag, Loader2, AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useProdutos,
  useCriarProduto,
  useAtualizarProduto,
  useDeletarProduto,
} from '@/hooks/vendedor/useProdutos'
import type { ProdutoResponse, Categoria } from '@/services/produtoService'

// ── Zod schema ──────────────────────────────────────────────────────────

const produtoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  categoria: z.enum(['ROUPAS', 'TENIS', 'ELETRONICO', 'OUTROS'], {
    required_error: 'Categoria é obrigatória',
  }),
  pesoGramas: z.coerce.number().positive('Peso deve ser maior que zero'),
  custoYuan: z.coerce.number().positive('Custo deve ser maior que zero'),
  freteVendedorYuan: z.coerce.number().min(0).default(0),
  descricao: z.string().optional(),
})

type ProdutoForm = z.infer<typeof produtoSchema>

// ── Helpers ─────────────────────────────────────────────────────────────

const categoriaLabels: Record<Categoria, string> = {
  ROUPAS: '👕 Roupas',
  TENIS: '👟 Tênis',
  ELETRONICO: '💻 Eletrônico',
  OUTROS: '📦 Outros',
}

const categoriaColors: Record<Categoria, string> = {
  ROUPAS: 'bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-400',
  TENIS: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400',
  ELETRONICO: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400',
  OUTROS: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
}

const CAMBIO_ESTIMADO = 0.75

const categoriaFilterKeys: { key: Categoria | 'TODOS'; label: string }[] = [
  { key: 'TODOS', label: 'Todos' },
  { key: 'ROUPAS', label: 'Roupas' },
  { key: 'TENIS', label: 'Tênis' },
  { key: 'ELETRONICO', label: 'Eletrônico' },
  { key: 'OUTROS', label: 'Outros' },
]

// ── Skeleton ────────────────────────────────────────────────────────────

function ProdutosSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-full" />
        ))}
      </div>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="space-y-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-800">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-5 w-20 rounded-full ml-auto" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function ProdutosPage() {
  const [categoriaFilter, setCategoriaFilter] = useState<Categoria | 'TODOS'>('TODOS')
  const apiCategoria = categoriaFilter === 'TODOS' ? undefined : categoriaFilter

  const { data: produtos, isLoading, error } = useProdutos(apiCategoria)
  const criarMutation = useCriarProduto()
  const atualizarMutation = useAtualizarProduto()
  const deletarMutation = useDeletarProduto()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [selectedProduto, setSelectedProduto] = useState<ProdutoResponse | null>(null)
  const [apiError, setApiError] = useState('')

  // React Hook Form
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProdutoForm>({ resolver: zodResolver(produtoSchema) })

  const watchCustoYuan = watch('custoYuan') || 0
  const watchFreteYuan = watch('freteVendedorYuan') || 0
  const custoTotalYuan = Number(watchCustoYuan) + Number(watchFreteYuan)
  const custoEstimadoBrl = custoTotalYuan * CAMBIO_ESTIMADO

  // ── Handlers ──────────────────────────────────────────────────────

  const handleCreateProduto = () => {
    reset({ nome: '', categoria: undefined, pesoGramas: undefined, custoYuan: undefined, freteVendedorYuan: 0, descricao: '' })
    setApiError('')
    setIsCreateModalOpen(true)
  }

  const handleEditProduto = (produto: ProdutoResponse) => {
    setSelectedProduto(produto)
    reset({
      nome: produto.nome ?? '',
      categoria: (produto.categoria as Categoria) ?? undefined,
      pesoGramas: produto.pesoGramas ?? 0,
      custoYuan: produto.custoYuan ?? 0,
      freteVendedorYuan: produto.freteVendedorYuan ?? 0,
      descricao: produto.descricao ?? '',
    })
    setApiError('')
    setIsEditModalOpen(true)
  }

  const handleDeleteProduto = (produto: ProdutoResponse) => {
    setSelectedProduto(produto)
    setIsDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (!selectedProduto?.id) return
    deletarMutation.mutate(selectedProduto.id, {
      onSuccess: () => setIsDeleteConfirmOpen(false),
    })
  }

  const onSubmitCreate = (formData: ProdutoForm) => {
    setApiError('')
    criarMutation.mutate(
      {
        nome: formData.nome,
        categoria: formData.categoria,
        pesoGramas: formData.pesoGramas,
        custoYuan: formData.custoYuan,
        freteVendedorYuan: formData.freteVendedorYuan ?? 0,
        descricao: formData.descricao || undefined,
      },
      {
        onSuccess: () => setIsCreateModalOpen(false),
        onError: (err: any) => {
          setApiError(err?.response?.data?.message || 'Erro ao criar produto')
        },
      },
    )
  }

  const onSubmitEdit = (formData: ProdutoForm) => {
    if (!selectedProduto?.id) return
    setApiError('')
    atualizarMutation.mutate(
      {
        id: selectedProduto.id,
        data: {
          nome: formData.nome,
          categoria: formData.categoria,
          pesoGramas: formData.pesoGramas,
          custoYuan: formData.custoYuan,
          freteVendedorYuan: formData.freteVendedorYuan ?? 0,
          descricao: formData.descricao || undefined,
        },
      },
      {
        onSuccess: () => setIsEditModalOpen(false),
        onError: (err: any) => {
          setApiError(err?.response?.data?.message || 'Erro ao atualizar produto')
        },
      },
    )
  }

  // ── Render ────────────────────────────────────────────────────────

  if (isLoading) return <ProdutosSkeleton />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Erro ao carregar produtos.
        </p>
      </div>
    )
  }

  const list = produtos ?? []

  // ── Form fields (shared between create & edit) ────────────────────

  const renderFormFields = () => (
    <div className="space-y-4 py-4">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
          Nome <span className="text-red-500">*</span>
        </label>
        <input
          {...register('nome')}
          className="w-full h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ex: Camiseta Oversized Básica"
        />
        {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
          Categoria <span className="text-red-500">*</span>
        </label>
        <Controller
          control={control}
          name="categoria"
          render={({ field }) => (
            <Select value={field.value ?? ''} onValueChange={field.onChange}>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ROUPAS">👕 Roupas</SelectItem>
                <SelectItem value="TENIS">👟 Tênis</SelectItem>
                <SelectItem value="ELETRONICO">💻 Eletrônico</SelectItem>
                <SelectItem value="OUTROS">📦 Outros</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.categoria && (
          <p className="text-red-500 text-xs mt-1">{errors.categoria.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            Peso em gramas <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            {...register('pesoGramas')}
            className="w-full h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: 350"
          />
          {errors.pesoGramas && (
            <p className="text-red-500 text-xs mt-1">{errors.pesoGramas.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            Custo em Yuan <span className="text-red-500">*</span>
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 bg-gray-50 dark:bg-gray-800 border border-r-0 border-gray-200 dark:border-gray-700 rounded-l-lg text-gray-500 text-sm">
              ¥
            </span>
            <input
              type="number"
              step="0.01"
              {...register('custoYuan')}
              className="flex-1 h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-r-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0,00"
            />
          </div>
          {errors.custoYuan && (
            <p className="text-red-500 text-xs mt-1">{errors.custoYuan.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
          Frete vendedor → armazém
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 bg-gray-50 dark:bg-gray-800 border border-r-0 border-gray-200 dark:border-gray-700 rounded-l-lg text-gray-500 text-sm">
            ¥
          </span>
          <input
            type="number"
            step="0.01"
            {...register('freteVendedorYuan')}
            className="flex-1 h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-r-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0,00"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
          Descrição
        </label>
        <textarea
          {...register('descricao')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Descrição opcional do produto"
        />
      </div>

      {/* Preview */}
      {custoTotalYuan > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 border border-blue-200 dark:border-blue-900">
          <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
            Custo estimado: R$ {custoEstimadoBrl.toFixed(2)}
          </p>
          <p className="text-xs text-blue-400 dark:text-blue-500 mt-1">
            (câmbio estimado: ¥1 = R${CAMBIO_ESTIMADO.toFixed(2)})
          </p>
        </div>
      )}

      {apiError && (
        <p className="text-red-500 text-sm bg-red-50 dark:bg-red-950/30 p-2 rounded">
          {apiError}
        </p>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Produtos</h1>
        <Button
          onClick={handleCreateProduto}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 h-9"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo produto
        </Button>
      </div>

      {/* Filtros de categoria */}
      <div className="flex flex-wrap gap-2">
        {categoriaFilterKeys.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setCategoriaFilter(key)}
            className={`rounded-full px-3 py-1 text-sm font-medium cursor-pointer transition-colors ${
              categoriaFilter === key
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border border-gray-200 dark:border-gray-700 hover:border-blue-500 text-gray-700 dark:text-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tabela */}
      {list.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-12 text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">Nenhum produto cadastrado</p>
          <Button
            onClick={handleCreateProduto}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Adicionar produto
          </Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead>Custo</TableHead>
                  <TableHead>Custo est. (R$)</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((produto) => {
                  const custoTotal =
                    (produto.custoYuan ?? 0) + (produto.freteVendedorYuan ?? 0)
                  const custoEstBrl = custoTotal * CAMBIO_ESTIMADO
                  return (
                    <TableRow
                      key={produto.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {produto.nome}
                            </p>
                            {produto.descricao && (
                              <p className="text-xs text-gray-400 truncate max-w-xs">
                                {produto.descricao}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            categoriaColors[produto.categoria as Categoria] ?? ''
                          }`}
                        >
                          {categoriaLabels[produto.categoria as Categoria] ?? produto.categoria}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {produto.pesoGramas ?? 0}g
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm text-gray-900 dark:text-white">
                            ¥ {(produto.custoYuan ?? 0).toFixed(2)}
                          </p>
                          {(produto.freteVendedorYuan ?? 0) > 0 && (
                            <p className="text-xs text-gray-400">
                              + ¥{(produto.freteVendedorYuan ?? 0).toFixed(2)} frete
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-900 dark:text-white">
                          R$ {custoEstBrl.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditProduto(produto)}
                            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduto(produto)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ── Modal Criar Produto ────────────────────────────────── */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo produto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitCreate)}>
            {renderFormFields()}
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

      {/* ── Modal Editar Produto ───────────────────────────────── */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar produto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitEdit)}>
            {renderFormFields()}
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
            <DialogTitle>Excluir produto</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 dark:text-gray-400 py-2">
            Tem certeza que deseja excluir <strong>{selectedProduto?.nome}</strong>? Esta ação
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
    </div>
  )
}
