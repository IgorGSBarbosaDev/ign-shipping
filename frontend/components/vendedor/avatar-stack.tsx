import { cn } from '@/lib/utils'

type AvatarStackProps = {
  nomes: string[]
  maxVisible?: number
}

function getInitials(nome: string): string {
  const parts = nome.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return nome.slice(0, 2).toUpperCase()
}

export function AvatarStack({ nomes, maxVisible = 3 }: AvatarStackProps) {
  const visibleNames = nomes.slice(0, maxVisible)
  const remainingCount = nomes.length - maxVisible

  return (
    <div className="flex items-center">
      {visibleNames.map((nome, index) => (
        <div
          key={index}
          className={cn(
            'w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold ring-2 ring-white dark:ring-gray-900',
            index > 0 && '-ml-2'
          )}
          title={nome}
        >
          {getInitials(nome)}
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'w-7 h-7 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-semibold ring-2 ring-white dark:ring-gray-900',
            '-ml-2'
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  )
}
