import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { useAuth } from './shared/hooks/useAuth'
import { useToast } from './shared/hooks/useToast'
import { Sidebar } from './shared/components/Sidebar'
import { TopBar } from './shared/components/TopBar'
import { ToastContainer } from './shared/components/Toast'
import { PageLoading } from './shared/components/LoadingSpinner'
import { AppRoutes } from './routes'
import type { AuthUser } from './shared/types'

// Dev-only mock auth để chạy không cần Supabase
function useMockAuth() {
  const stored = localStorage.getItem('nquoc-dev-user')
  if (stored) {
    try {
      return JSON.parse(stored) as AuthUser
    } catch {
      return null
    }
  }
  return null
}

export default function App() {
  const { user: supabaseUser, loading, switchRole } = useAuth()
  const { toasts, addToast, removeToast } = useToast()
  const mockUser = import.meta.env.DEV ? useMockAuth() : null

  const user = supabaseUser ?? mockUser

  // Expose addToast globally
  React.useEffect(() => {
    ;(window as unknown as Record<string, unknown>).__addToast = addToast
  }, [addToast])

  if (loading && !mockUser) return <PageLoading />

  if (!user) {
    const isVercelPreview = window.location.hostname.includes('vercel.app')
    const isDemoMode = new URLSearchParams(window.location.search).has('demo')

    if (import.meta.env.DEV || isVercelPreview || isDemoMode) {
      return <DevModeLogin />
    }
    window.location.href = 'https://nquoc.vn/login'
    return null
  }

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-nquoc-bg">
        <Sidebar user={user} />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar user={user} onSwitchRole={switchRole} />
          <main className="flex-1 overflow-auto">
            <AppRoutes user={user} />
          </main>
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </BrowserRouter>
  )
}

function DevModeLogin() {
  const handleLogin = (role: 'hr_manager' | 'leader' | 'member') => {
    localStorage.setItem('nquoc-dev-role', role)
    localStorage.setItem(
      'nquoc-dev-user',
      JSON.stringify({
        id: 'dev-user-id',
        email: `${role}@nquoc.vn`,
        name:
          role === 'hr_manager'
            ? 'Nguyễn HR Manager'
            : role === 'leader'
            ? 'Trần Thị Leader'
            : 'Lê Văn Thành Viên',
        role,
      })
    )
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-nquoc-bg flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-80">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-nquoc-blue rounded-xl flex items-center justify-center text-white font-bold text-xl font-header mx-auto mb-3">
            N
          </div>
          <h1 className="text-lg font-bold text-nquoc-text font-header">NhiLe HR Culture</h1>
          <p className="text-sm text-nquoc-muted mt-1">Dev Mode — Chọn role để vào</p>
        </div>
        <div className="space-y-2">
          <button
            onClick={() => handleLogin('hr_manager')}
            className="w-full py-2.5 px-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
          >
            HR Manager
          </button>
          <button
            onClick={() => handleLogin('leader')}
            className="w-full py-2.5 px-4 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            Leader
          </button>
          <button
            onClick={() => handleLogin('member')}
            className="w-full py-2.5 px-4 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors"
          >
            Thành viên
          </button>
        </div>
      </div>
    </div>
  )
}
