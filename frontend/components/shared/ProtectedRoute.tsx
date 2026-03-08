'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, type UsuarioResumoResponse } from '@/store/authStore'

type Role = UsuarioResumoResponse['role']

const roleRedirectMap: Record<Role, string> = {
  VENDEDOR: '/vendedor/dashboard',
  COMPRADOR: '/portal/meus-pedidos',
  ADMIN: '/admin/overview',
}

interface ProtectedRouteProps {
  allowedRoles: Role[]
  children: React.ReactNode
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const router = useRouter()
  const { token, usuario } = useAuthStore()

  useEffect(() => {
    useAuthStore.persist.rehydrate()
  }, [])

  useEffect(() => {
    if (!token || !usuario) {
      router.replace('/auth/login')
      return
    }

    if (!allowedRoles.includes(usuario.role)) {
      router.replace(roleRedirectMap[usuario.role])
    }
  }, [token, usuario, allowedRoles, router])

  if (!token || !usuario) {
    return null
  }

  if (!allowedRoles.includes(usuario.role)) {
    return null
  }

  return <>{children}</>
}
