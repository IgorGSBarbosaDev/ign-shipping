'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface UsuarioResumoResponse {
  id: number
  nome: string
  email: string
  role: 'VENDEDOR' | 'COMPRADOR' | 'ADMIN'
  tenantId: number | null
}

interface AuthState {
  token: string | null
  usuario: UsuarioResumoResponse | null
  setAuth: (token: string, usuario: UsuarioResumoResponse) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      usuario: null,

      setAuth: (token, usuario) => set({ token, usuario }),

      logout: () => set({ token: null, usuario: null }),

      isAuthenticated: () => {
        const { token, usuario } = get()
        return !!token && !!usuario
      },
    }),
    {
      name: 'ign-auth',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          // SSR: return a no-op storage
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          }
        }
        return localStorage
      }),
      skipHydration: true,
    }
  )
)
