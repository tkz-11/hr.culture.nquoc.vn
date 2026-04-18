import { NavLink, useLocation } from 'react-router-dom'
import type { AuthUser } from '../types'

interface SidebarProps {
  user: AuthUser
}

const roleLabels: Record<string, string> = {
  hr_manager: 'HR Manager',
  leader:     'Leader',
  member:     'Thành viên',
}

// SVG Icons — no emoji
const Ic = {
  home: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  radar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  passport: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M7 21v-1a5 5 0 0 1 10 0v1"/>
    </svg>
  ),
  culture: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  chevron: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  dot: (w = 6) => (
    <span style={{ width: w, height: w }} className="rounded-full bg-current flex-shrink-0 inline-block" />
  ),
}

const NAV_ITEMS = [
  { to: '/retention', icon: Ic.radar,   label: 'Radar Giữ Chân Nhân Sự', sub: 'Bản đồ rủi ro nhân sự' },
  { to: '/passport',  icon: Ic.passport, label: 'Hộ Chiếu Giao Tiếp',    sub: 'Giao tiếp thẳng thắn' },
  { to: '/culture',   icon: Ic.culture,  label: 'Văn Hóa Đội Nhóm',       sub: 'Hệ điều hành văn hóa' },
]

const CULTURE_PILLARS = [
  { label: 'Dám Làm',   color: '#2563eb', bg: '#eff6ff' },
  { label: 'Dám Sai',   color: '#dc2626', bg: '#fff0f0' },
  { label: 'Nói Thẳng', color: '#059669', bg: '#f0fdf4' },
]

export function Sidebar({ user }: SidebarProps) {
  const location = useLocation()

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <aside className="w-[268px] min-h-screen bg-white flex flex-col flex-shrink-0 border-r border-[#ebebeb]" style={{ boxShadow: '2px 0 8px rgba(0,0,0,0.04)' }}>

      {/* ── Logo ── */}
      <div className="px-5 pt-5 pb-4 border-b border-[#f0f0f0]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#e53e3e] rounded-[10px] flex items-center justify-center text-white font-bold text-base font-header flex-shrink-0">
            N
          </div>
          <div>
            <div className="text-[15px] font-black text-[#1a1a2e] font-header leading-tight tracking-tight">NhiLe HR</div>
            <div className="text-[10px] text-[#94a3b8] font-medium tracking-wide">hr.culture.nquoc.vn</div>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">

        {/* Workspace */}
        <div>
          <p className="text-[10px] font-bold text-[#c0ccd8] uppercase tracking-[0.12em] px-2 mb-1.5">
            Workspace
          </p>
          <NavLink
            to="/"
            end
            className={() =>
              `flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[13.5px] font-semibold transition-all duration-150 ${
                isActive('/')
                  ? 'bg-[#fff0f0] text-[#e53e3e]'
                  : 'text-[#5a6a85] hover:bg-[#f8fafc] hover:text-[#1a1a2e]'
              }`
            }
          >
            <span className={isActive('/') ? 'text-[#e53e3e]' : 'text-[#94a3b8]'}>{Ic.home}</span>
            <span>Trang chủ</span>
          </NavLink>
        </div>

        {/* HR Tools */}
        <div>
          <p className="text-[10px] font-bold text-[#c0ccd8] uppercase tracking-[0.12em] px-2 mb-1.5">
            HR Tools
          </p>
          <div className="space-y-0.5">
            {NAV_ITEMS.map(item => {
              const active = isActive(item.to)
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={() =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[13.5px] font-semibold transition-all duration-150 group ${
                      active
                        ? 'bg-[#fff0f0] text-[#e53e3e]'
                        : 'text-[#5a6a85] hover:bg-[#f8fafc] hover:text-[#1a1a2e]'
                    }`
                  }
                >
                  <span className={active ? 'text-[#e53e3e]' : 'text-[#94a3b8] group-hover:text-[#5a6a85]'}>
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="block truncate leading-tight">{item.label}</span>
                    <span className={`text-[11px] font-normal truncate block mt-0.5 ${active ? 'text-[#e53e3e]/70' : 'text-[#b0bec5]'}`}>
                      {item.sub}
                    </span>
                  </div>
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e53e3e] flex-shrink-0" />
                  )}
                </NavLink>
              )
            })}
          </div>
        </div>

        {/* Culture Pillars */}
        <div>
          <p className="text-[10px] font-bold text-[#c0ccd8] uppercase tracking-[0.12em] px-2 mb-2">
            Trụ cột văn hóa
          </p>
          <div className="space-y-1.5 px-1">
            {CULTURE_PILLARS.map((p) => (
              <div
                key={p.label}
                className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-[12px] font-bold"
                style={{ backgroundColor: p.bg, color: p.color }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: p.color }}
                />
                {p.label}
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* ── User Card ── */}
      <div className="px-3 py-4 border-t border-[#f0f0f0]">
        <div className="flex items-center gap-3 px-2 py-2">
          <div
            className="w-9 h-9 rounded-[9px] flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: user.primary_role === 'hr_manager' ? '#e53e3e' : user.primary_role === 'leader' ? '#6d28d9' : '#1a1a2e' }}
          >
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-[#1a1a2e] truncate leading-tight">{user.full_name}</p>
            <p className="text-[11px] text-[#94a3b8] font-medium">{roleLabels[user.primary_role] ?? user.primary_role}</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-[#10b981] flex-shrink-0" />
        </div>
      </div>
    </aside>
  )
}
