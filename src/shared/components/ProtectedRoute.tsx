import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@modules/auth/stores/auth.store'
import { PageLoading } from './LoadingSpinner'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore()
  if (loading) return <PageLoading />
  if (!user) return <Navigate to="/auth" replace />
  return <>{children}</>
}
