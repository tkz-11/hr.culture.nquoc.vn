import { NavLink, useLocation } from 'react-router-dom'
import type { AuthUser } from '../types'

interface SidebarProps {
  user: AuthUser
}

const roleLabels: Record<string, string> = {
  hr_manager: 'HR Manager',
  leader: 'Leader',
  member: 'Thành viên',
}

const roleAvatarBg: Record<string, string> = {
  hr_manager: 'bg-red-700',
  leader:     'bg-violet-700',
  member:     'bg-blue-700',
}

const MOCK_XP = 1240

const NAV_ITEMS = [
  { to: '/retention', icon: '📡', label: 'Radar Giữ Chân Nhân Sự', sub: 'Bản đồ rủi ro nhân sự' },
  { to: '/passport',  icon: '🗂️', label: 'Hộ Chiếu Giao Tiếp',    sub: 'Giao tiếp thẳng thắn' },
  { to: '/culture',   icon: '🌱', label: 'Văn Hóa Đội Nhóm',       sub: 'Hệ điều hành văn hóa' },
]

export function Sidebar({ user }: SidebarProps) {
  const location = useLocation()

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  const linkClass = (path: string) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
      isActive(path)
        ? 'bg-[#1d4ed8] text-white shadow-md'
        : 'text-[#94a3b8] hover:bg-[#1e293b] hover:text-white'
    }`

  const iconClass = (path: string) =>
    `w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 transition-all ${
      isActive(path) ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'
    }`

  return (
    <aside className="w-[268px] min-h-screen bg-[#0f172a] flex flex-col flex-shrink-0 shadow-[4px_0_20px_rgba(0,0,0,0.20)]">

      {/* ── Logo ── */}
      <div className="px-5 pt-5 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white font-bold text-base font-header shadow-lg flex-shrink-0">
            N
          </div>
          <div>
            <div className="text-sm font-bold text-white font-header leading-tight">NhiLe HR Culture</div>
            <div className="text-[10px] text-[#475569] font-medium">hr.culture.nquoc.vn</div>
          </div>
        </div>

        {/* XP Progress mini */}
        <div className="mt-4 bg-white/5 rounded-2xl px-3 py-2.5 border border-white/5">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Culture XP</p>
            <p className="text-xs font-bold text-white">{MOCK_XP}</p>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${MOCK_XP % 100}%` }} />
          </div>
          <p className="text-[10px] text-[#475569] mt-1">{MOCK_XP % 100}/100 XP → cấp tiếp theo</p>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">

        {/* Workspace */}
        <div>
          <p className="text-[10px] font-bold text-[#475569] uppercase tracking-[0.12em] px-3 mb-2">
            WORKSPACE
          </p>
          <NavLink to="/" end className={linkClass('/')}>
            <div className={iconClass('/')}>🏠</div>
            <span>Trang chủ</span>
          </NavLink>
        </div>

        {/* HR Tools */}
        <div>
          <p className="text-[10px] font-bold text-[#475569] uppercase tracking-[0.12em] px-3 mb-2">
            HR TOOLS
          </p>
          <div className="space-y-1">
            {NAV_ITEMS.map(item => (
              <NavLink key={item.to} to={item.to} className={linkClass(item.to)}>
                <div className={iconClass(item.to)}>{item.icon}</div>
                <div className="flex-1 min-w-0">
                  <span className="block truncate">{item.label}</span>
                  <span className={`text-[10px] font-normal truncate block ${
                    isActive(item.to) ? 'text-blue-200' : 'text-[#475569]'
                  }`}>{item.sub}</span>
                </div>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Culture Pillars */}
        <div className="px-1">
          <p className="text-[10px] font-bold text-[#475569] uppercase tracking-[0.12em] px-2 mb-3">
            TRỤ CỘT VĂN HÓA
          </p>
          <div className="space-y-2">
            {[
              { icon: '⚡', label: 'Dám Làm',    color: 'text-blue-400   bg-blue-500/10   border-blue-500/20' },
              { icon: '💥', label: 'Dám Sai',    color: 'text-rose-400   bg-rose-500/10   border-rose-500/20' },
              { icon: '🎯', label: 'Nói Thẳng',  color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
            ].map((p) => (
              <div key={p.label} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${p.color} border`}>
                <span className="text-sm">{p.icon}</span>
                <span className="text-xs font-bold">{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* ── User Card ── */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="bg-white/5 rounded-2xl p-3 flex items-center gap-3 border border-white/5">
          <div className={`w-10 h-10 rounded-2xl ${roleAvatarBg[user.role] ?? 'bg-blue-700'} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white truncate">{user.name}</p>
            <p className="text-[11px] text-[#94a3b8] font-medium">{roleLabels[user.role] ?? user.role}</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" title="Đang hoạt động" />
        </div>
      </div>
    </aside>
  )
}
