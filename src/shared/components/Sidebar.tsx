import { NavLink, useLocation } from 'react-router-dom'
import type { AuthUser } from '../types'
import { Badge } from './Badge'

interface SidebarProps {
  user: AuthUser
}

const roleLabels: Record<string, string> = {
  hr_manager: 'HR Manager',
  leader: 'Leader',
  member: 'Thành viên',
}

const roleBadgeVariant: Record<string, 'red' | 'blue' | 'slate'> = {
  hr_manager: 'red',
  leader: 'blue',
  member: 'slate',
}

const roleAvatarGradient: Record<string, string> = {
  hr_manager: 'from-rose-500 to-pink-600',
  leader:     'from-violet-500 to-purple-600',
  member:     'from-indigo-500 to-blue-600',
}

const MOCK_XP = 1240

export function Sidebar({ user }: SidebarProps) {
  const location = useLocation()

  const navItemClass = (path: string) => {
    const active = path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path)
    return `flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 group ${
      active
        ? 'bg-nquoc-active text-nquoc-blue font-bold shadow-sm border border-indigo-100'
        : 'text-nquoc-muted hover:bg-slate-50 hover:text-nquoc-text'
    }`
  }

  const navIconClass = (path: string) => {
    const active = path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path)
    return `w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all duration-200 flex-shrink-0 ${
      active
        ? 'bg-nquoc-blue text-white shadow-nquoc'
        : 'bg-slate-100 group-hover:bg-indigo-50 text-slate-500 group-hover:text-indigo-500'
    }`
  }

  return (
    <aside className="w-[268px] min-h-screen bg-nquoc-sidebar border-r border-nquoc-border flex flex-col flex-shrink-0">
      
      {/* ── Logo ── */}
      <div className="px-5 pt-5 pb-4 border-b border-nquoc-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-indigo rounded-2xl flex items-center justify-center text-white font-bold text-base font-header shadow-nquoc glow-indigo flex-shrink-0">
            N
          </div>
          <div>
            <div className="text-sm font-bold text-nquoc-text font-header leading-tight">NhiLe HR Culture</div>
            <div className="text-[10px] text-nquoc-muted font-medium">hr.culture.nquoc.vn</div>
          </div>
        </div>

        {/* XP Progress mini */}
        <div className="mt-4 bg-nquoc-active rounded-2xl px-3 py-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Culture XP</p>
            <p className="text-xs font-bold text-nquoc-text">{MOCK_XP}</p>
          </div>
          <div className="progress-track h-1.5">
            <div className="progress-fill bg-gradient-indigo" style={{ width: `${MOCK_XP % 100}%` }} />
          </div>
          <p className="text-[10px] text-nquoc-muted mt-1">{MOCK_XP % 100}/100 XP → cấp tiếp theo</p>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">

        {/* Overview */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
            Tổng quan
          </p>
          <NavLink to="/" className={navItemClass('/')} end>
            <div className={navIconClass('/')}>🏠</div>
            <span>Trang chủ</span>
          </NavLink>
        </div>

        {/* HR Tools */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
            HR Tools
          </p>
          <div className="space-y-1">
            <NavLink to="/retention" className={navItemClass('/retention')}>
              <div className={navIconClass('/retention')}>📡</div>
              <div className="flex-1">
                <span className="block">Retention Radar</span>
                <span className="text-[10px] text-nquoc-muted font-normal">Bản đồ rủi ro nhân sự</span>
              </div>
            </NavLink>
            <NavLink to="/passport" className={navItemClass('/passport')}>
              <div className={navIconClass('/passport')}>🗂️</div>
              <div className="flex-1">
                <span className="block">Comm Passport</span>
                <span className="text-[10px] text-nquoc-muted font-normal">Giao tiếp thẳng thắn</span>
              </div>
            </NavLink>
            <NavLink to="/culture" className={navItemClass('/culture')}>
              <div className={navIconClass('/culture')}>🌱</div>
              <div className="flex-1">
                <span className="block">Culture OS</span>
                <span className="text-[10px] text-nquoc-muted font-normal">Hệ điều hành văn hóa</span>
              </div>
            </NavLink>
          </div>
        </div>

        {/* Culture Pillars */}
        <div className="px-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-3">
            Trụ cột văn hóa
          </p>
          <div className="space-y-2">
            {[
              { icon: '⚡', label: 'Dám Làm', color: 'text-indigo-600 bg-indigo-50' },
              { icon: '💥', label: 'Dám Sai', color: 'text-rose-600 bg-rose-50' },
              { icon: '🎯', label: 'Nói Thẳng', color: 'text-emerald-600 bg-emerald-50' },
            ].map((p) => (
              <div key={p.label} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${p.color} border border-current/10`}>
                <span className="text-sm">{p.icon}</span>
                <span className="text-xs font-bold">{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* ── User Card ── */}
      <div className="px-3 py-4 border-t border-nquoc-border">
        <div className="bg-nquoc-bg rounded-2xl p-3 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${roleAvatarGradient[user.role] ?? 'from-indigo-500 to-blue-600'} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm`}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-nquoc-text truncate">{user.name}</p>
            <Badge variant={roleBadgeVariant[user.role] ?? 'slate'} size="sm">
              {roleLabels[user.role] ?? user.role}
            </Badge>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" title="Online" />
        </div>
      </div>
    </aside>
  )
}
