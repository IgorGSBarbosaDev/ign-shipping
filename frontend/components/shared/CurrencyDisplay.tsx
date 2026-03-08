import { formatBRL, formatYuan, cn } from '@/lib/utils'

type CurrencyDisplayProps = {
  value: number
  currency?: 'BRL' | 'Yuan'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses: Record<string, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg font-semibold',
}

export function CurrencyDisplay({
  value,
  currency = 'BRL',
  size = 'md',
  className,
}: CurrencyDisplayProps) {
  const formatted = currency === 'BRL' ? formatBRL(value) : formatYuan(value)

  return (
    <span className={cn(sizeClasses[size], className)}>
      {formatted}
    </span>
  )
}
