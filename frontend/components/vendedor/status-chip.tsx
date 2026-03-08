import { cn } from '@/lib/utils'

type Status =
  | 'RASCUNHO'
  | 'AGUARDANDO_ENVIO'
  | 'EM_VIAGEM'
  | 'ALFANDEGA'
  | 'TRANSITO'
  | 'ENTREGUE'
  | 'FINALIZADO'
  | 'PENDENTE'
  | 'PAGO'
  | 'PARCIAL'

type StatusChipProps = {
  status: Status
  size?: 'sm' | 'md'
}

const statusConfig: Record<
  Status,
  { label: string; className: string }
> = {
  RASCUNHO: {
    label: 'Rascunho',
    className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
  AGUARDANDO_ENVIO: {
    label: 'Aguardando envio',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  },
  EM_VIAGEM: {
    label: 'Em viagem',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  },
  ALFANDEGA: {
    label: 'Alfândega',
    className: 'bg-orange-100 text-orange-700',
  },
  TRANSITO: {
    label: 'Em trânsito',
    className: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
  },
  ENTREGUE: {
    label: 'Entregue',
    className: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  },
  FINALIZADO: {
    label: 'Finalizado',
    className: 'bg-emerald-100 text-emerald-800',
  },
  PENDENTE: {
    label: 'Pendente',
    className: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400',
  },
  PAGO: {
    label: 'Pago',
    className: 'bg-green-100 text-green-700',
  },
  PARCIAL: {
    label: 'Parcial',
    className: 'bg-amber-100 text-amber-700',
  },
}

export function StatusChip({ status, size = 'md' }: StatusChipProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full',
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1',
        config.className
      )}
    >
      <span className="w-1 h-1 rounded-full bg-current" />
      {config.label}
    </span>
  )
}
