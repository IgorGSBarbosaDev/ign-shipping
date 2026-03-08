'use client'

import { Check } from 'lucide-react'
import { usePasswordStrength } from '@/hooks/usePasswordStrength'
import { cn } from '@/lib/utils'

const segmentColors = [
  'bg-red-400',
  'bg-orange-400',
  'bg-yellow-400',
  'bg-green-500',
]

interface PasswordStrengthBarProps {
  password: string
}

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const { score, label, checks } = usePasswordStrength(password)

  if (!password) return null

  const items: { key: keyof typeof checks; label: string }[] = [
    { key: 'minLength', label: '8+ caracteres' },
    { key: 'hasUppercase', label: 'Uma letra maiúscula' },
    { key: 'hasNumber', label: 'Um número' },
    { key: 'hasSpecial', label: 'Um caractere especial' },
  ]

  return (
    <div className="space-y-2">
      {/* Segments */}
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              i < score ? segmentColors[score - 1] : 'bg-gray-200'
            )}
          />
        ))}
      </div>

      {/* Label */}
      <p className="text-xs text-gray-600">{label}</p>

      {/* Checklist */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {items.map(({ key, label: text }) => (
          <div
            key={key}
            className={cn(
              'flex items-center gap-1',
              checks[key] ? 'text-green-600' : 'text-gray-400'
            )}
          >
            {checks[key] ? (
              <Check className="w-3 h-3" />
            ) : (
              <span className="w-3 h-3 flex items-center justify-center">●</span>
            )}
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
