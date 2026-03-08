import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { AdminLayout } from '@/components/admin/admin-layout'

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  )
}
