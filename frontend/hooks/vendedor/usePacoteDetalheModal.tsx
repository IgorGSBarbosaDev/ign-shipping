'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type PacoteDetalheCtx = {
  pacoteIdAberto: number | null
  abrirPacote: (id: number) => void
  fecharPacote: () => void
}

const Ctx = createContext<PacoteDetalheCtx>({
  pacoteIdAberto: null,
  abrirPacote: () => {},
  fecharPacote: () => {},
})

export function usePacoteDetalheModal() {
  return useContext(Ctx)
}

export function PacoteDetalheProvider({ children }: { children: ReactNode }) {
  const [pacoteIdAberto, setPacoteIdAberto] = useState<number | null>(null)

  const abrirPacote = useCallback((id: number) => setPacoteIdAberto(id), [])
  const fecharPacote = useCallback(() => setPacoteIdAberto(null), [])

  return (
    <Ctx.Provider value={{ pacoteIdAberto, abrirPacote, fecharPacote }}>
      {children}
    </Ctx.Provider>
  )
}
