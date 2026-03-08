import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { VendedorLayout } from '@/components/vendedor/vendedor-layout'
import { PacoteDetalheProvider } from '@/hooks/vendedor/usePacoteDetalheModal'
import { PacoteDetalheModalGlobal } from '@/components/vendedor/pacote-detalhe-modal'

export default function VendedorRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['VENDEDOR']}>
      <PacoteDetalheProvider>
        <VendedorLayout>{children}</VendedorLayout>
        <PacoteDetalheModalGlobal />
      </PacoteDetalheProvider>
    </ProtectedRoute>
  )
}
