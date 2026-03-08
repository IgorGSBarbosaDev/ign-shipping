import { cn } from '@/lib/utils'

type MargemBarProps = {
  margem: number
  showLabel?: boolean
}

export function MargemBar({ margem, showLabel = true }: MargemBarProps) {
  const clampedMargem = Math.max(0, Math.min(100, margem))
  
  const getColor = () => {
    if (clampedMargem < 15) return 'bg-red-500'
    if (clampedMargem <= 25) return 'bg-amber-400'
    return 'bg-green-500'
  }

  const getTextColor = () => {
    if (clampedMargem < 15) return 'text-red-500'
    if (clampedMargem <= 25) return 'text-amber-400'
    return 'text-green-500'
  }

  const barColor = getColor()
  const textColor = getTextColor()

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
        <div
          className={cn('h-full transition-all duration-300', barColor)}
          style={{ width: `${clampedMargem}%` }}
        />
      </div>
      {showLabel && (
        <span className={cn('text-xs font-medium whitespace-nowrap', textColor)}>
          {clampedMargem.toFixed(1)}%
        </span>
      )}
    </div>
  )
}
