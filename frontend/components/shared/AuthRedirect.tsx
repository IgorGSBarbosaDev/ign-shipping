'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export function AuthRedirect() {
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

    switch (usuario.role) {
      case 'VENDEDOR':
        router.replace('/vendedor/dashboard')
        break
      case 'COMPRADOR':
        router.replace('/portal/meus-pedidos')
        break
      case 'ADMIN':
        router.replace('/admin/overview')
        break
      default:
        router.replace('/auth/login')
    }
  }, [token, usuario, router])

  return null
}
