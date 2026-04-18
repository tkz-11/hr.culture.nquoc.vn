import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@shared/config/query-client'
import { useAuthStore } from '@modules/auth/stores/auth.store'
import { useToast } from './shared/hooks/useToast'
import { Sidebar } from './shared/components/Sidebar'
import { TopBar } from './shared/components/TopBar'
import { ToastContainer } from './shared/components/Toast'
import { PageLoading } from './shared/components/LoadingSpinner'
import { NBotCoach } from './shared/components/NBotCoach'
import { AuthPage } from '@modules/auth/pages/AuthPage'
import { AuthCallbackPage } from '@modules/auth/pages/AuthCallbackPage'
import type { UserRole } from './shared/types'

const HomePage = React.lazy(() =>
  import('./features/home/pages/HomePage').then((m) => ({ default: m.HomePage }))
)
const RetentionPage = React.lazy(() =>
  import('./features/retention/pages/RetentionPage').then((m) => ({ default: m.RetentionPage }))
)
const PassportPage = React.lazy(() =>
  import('./features/passport/pages/PassportPage').then((m) => ({ default: m.PassportPage }))
)
const CulturePage = React.lazy(() =>
  import('./features/culture/pages/CulturePage').then((m) => ({ default: m.CulturePage }))
)

const SuspenseFallback = () => (
  <div className="flex-1 flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-[3px] border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
      <p className="text-sm text-nquoc-muted font-medium">Đang tải...</p>
    </div>
  </div>
)

function AppShell() {
  const { user, loading, initialize, switchRole } = useAuthStore()
  const { toasts, addToast, removeToast } = useToast()

  React.useEffect(() => {
    initialize()
  }, [initialize])

  React.useEffect(() => {
    ;(window as unknown as Record<string, unknown>).__addToast = addToast
  }, [addToast])

  if (loading) return <PageLoading />

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/auth-callback" element={<AuthCallbackPage />} />

      {/* Protected routes */}
      {user ? (
        <Route
          path="/*"
          element={
            <div className="flex min-h-screen bg-nquoc-bg">
              <Sidebar user={user} />
              <div className="flex-1 flex flex-col min-w-0">
                <TopBar
                  user={user}
                  onSwitchRole={(role: UserRole) => switchRole(role)}
                />
                <main className="flex-1 overflow-auto">
                  <React.Suspense fallback={<SuspenseFallback />}>
                    <Routes>
                      <Route path="/" element={<HomePage user={user} />} />
                      <Route path="/retention" element={<RetentionPage user={user} />} />
                      <Route path="/passport" element={<PassportPage user={user} />} />
                      <Route path="/culture" element={<CulturePage user={user} />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </React.Suspense>
                </main>
              </div>
              <NBotCoach user={user} />
            </div>
          }
        />
      ) : (
        <Route path="*" element={<Navigate to="/auth" replace />} />
      )}
    </Routes>
  )
}

export default function App() {
  const { toasts, removeToast } = useToast()

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppShell />
        <ToastContainerWrapper />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

function ToastContainerWrapper() {
  const { toasts, removeToast } = useToast()
  return <ToastContainer toasts={toasts} onRemove={removeToast} />
}
