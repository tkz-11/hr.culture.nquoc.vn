import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { useAuth } from './shared/hooks/useAuth'
import { useToast } from './shared/hooks/useToast'
import { Sidebar } from './shared/components/Sidebar'
import { TopBar } from './shared/components/TopBar'
import { ToastContainer } from './shared/components/Toast'
import { PageLoading } from './shared/components/LoadingSpinner'
import { NBotCoach } from './shared/components/NBotCoach'
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
  const isVercelPreview = window.location.hostname.includes('vercel.app')
  const isDemoMode = new URLSearchParams(window.location.search).has('demo')
  const mockUser = (import.meta.env.DEV || isVercelPreview || isDemoMode) ? useMockAuth() : null

  const user = supabaseUser ?? mockUser

  // Expose addToast globally
  React.useEffect(() => {
    ;(window as unknown as Record<string, unknown>).__addToast = addToast
  }, [addToast])

  if (loading && !mockUser) return <PageLoading />

  if (!user) {
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
      <NBotCoach user={user} />
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
    <div className="min-h-screen bg-nquoc-bg flex items-center justify-center p-6">
      <div className="bg-white rounded-[32px] shadow-xl p-10 w-full max-w-sm border border-nquoc-border transition-all duration-300 hover:shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-nquoc-blue rounded-3xl flex items-center justify-center text-white font-bold text-2xl font-header mx-auto mb-4 shadow-lg shadow-blue-100">
            N
          </div>
          <h1 className="text-2xl font-bold text-nquoc-text font-header tracking-tight">NhiLe HR Culture</h1>
          <p className="text-sm text-nquoc-muted mt-2 leading-relaxed">
            Thấu hiểu đội ngũ, kiến tạo nội lực.<br/>
            <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400 mt-2 inline-block">Demo Mode</span>
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-wider mb-2 px-1">Chọn vai trò để bắt đầu</p>
          <button
            onClick={() => handleLogin('hr_manager')}
            className="w-full group py-3.5 px-5 bg-red-50 text-red-700 border border-red-100 rounded-2xl text-sm font-semibold hover:bg-red-100 hover:border-red-200 transition-all duration-200 flex items-center justify-between"
          >
            <span>HR Manager</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </button>
          <button
            onClick={() => handleLogin('leader')}
            className="w-full group py-3.5 px-5 bg-blue-50 text-blue-700 border border-blue-100 rounded-2xl text-sm font-semibold hover:bg-blue-100 hover:border-blue-200 transition-all duration-200 flex items-center justify-between"
          >
            <span>Team Leader</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </button>
          <button
            onClick={() => handleLogin('member')}
            className="w-full group py-3.5 px-5 bg-slate-50 text-slate-700 border border-slate-100 rounded-2xl text-sm font-semibold hover:bg-slate-100 hover:border-slate-200 transition-all duration-200 flex items-center justify-between"
          >
            <span>Thành viên</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </button>
        </div>

        <p className="text-center text-[10px] text-nquoc-muted mt-8 italic">
          Giao diện demo tối ưu cho trải nghiệm người dùng Millennial & Gen Z.
        </p>
      </div>
    </div>
  )
}
