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

export function Sidebar({ user }: SidebarProps) {
  const location = useLocation()

  const navItemClass = (path: string) => {
    const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
    return `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
      active
        ? 'bg-nquoc-active text-nquoc-blue border-l-[3px] border-nquoc-blue pl-[calc(0.75rem-3px)]'
        : 'text-nquoc-muted hover:bg-nquoc-bg hover:text-nquoc-text'
    }`
  }

  return (
    <aside className="w-[260px] min-h-screen bg-nquoc-sidebar border-r border-nquoc-border flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-nquoc-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-nquoc-blue rounded-lg flex items-center justify-center text-white font-bold text-sm font-header">
            N
          </div>
          <div>
            <div className="text-sm font-bold text-nquoc-text font-header leading-tight">NQuoc HR</div>
            <div className="text-[10px] text-nquoc-muted">hr.culture.nquoc.vn</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5">
        {/* Workspace */}
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">
            Workspace
          </p>
          <NavLink to="/" className={navItemClass('/')} end>
            <span className="text-base">🏠</span>
            <span>Trang chủ</span>
          </NavLink>
        </div>

        {/* HR Tools */}
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">
            HR Tools
          </p>
          <div className="space-y-1">
            <NavLink to="/retention" className={navItemClass('/retention')}>
              <span className="text-base">📡</span>
              <span>Retention Radar</span>
            </NavLink>
            <NavLink to="/passport" className={navItemClass('/passport')}>
              <span className="text-base">🗂️</span>
              <span>Comm Passport</span>
            </NavLink>
            <NavLink to="/culture" className={navItemClass('/culture')}>
              <span className="text-base">🌱</span>
              <span>Culture OS</span>
            </NavLink>
          </div>
        </div>
      </nav>

      {/* User info */}
      <div className="px-3 py-4 border-t border-nquoc-border">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-nquoc-blue flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-nquoc-text truncate">{user.name}</p>
            <Badge variant={roleBadgeVariant[user.role] ?? 'slate'} size="sm">
              {roleLabels[user.role] ?? user.role}
            </Badge>
          </div>
        </div>
      </div>
    </aside>
  )
}
