import { useMemo } from 'react'

interface PasswordChecks {
  minLength: boolean
  hasUppercase: boolean
  hasNumber: boolean
  hasSpecial: boolean
}

type StrengthLabel = 'Muito fraca' | 'Fraca' | 'Média' | 'Forte' | 'Muito forte'

interface PasswordStrength {
  score: number          // 0-4
  label: StrengthLabel
  color: string          // CSS color
  checks: PasswordChecks
}

const labels: StrengthLabel[] = ['Muito fraca', 'Fraca', 'Média', 'Forte', 'Muito forte']
const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a']

export function usePasswordStrength(password: string): PasswordStrength {
  return useMemo(() => {
    const checks: PasswordChecks = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
    }

    const score = Object.values(checks).filter(Boolean).length

    return {
      score,
      label: labels[score],
      color: colors[score],
      checks,
    }
  }, [password])
}
