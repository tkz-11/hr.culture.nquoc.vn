import type { AuthUser, UserRole } from '../types'
import { Badge } from './Badge'

interface TopBarProps {
  user: AuthUser
  onSwitchRole?: (role: UserRole) => void
}

const IS_DEV = import.meta.env.DEV
const IS_PREVIEW = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')

const roleLabels: Record<UserRole, string> = {
  hr_manager: 'HR Manager',
  leader: 'Leader',
  member: 'Thành viên',
}

const roleBadgeVariant: Record<UserRole, 'red' | 'blue' | 'indigo' | 'slate'> = {
  hr_manager: 'red',
  leader: 'indigo',
  member: 'slate',
}

const roleGradient: Record<UserRole, string> = {
  hr_manager: 'from-red-700 to-red-800',
  leader:     'from-violet-700 to-purple-800',
  member:     'from-slate-700 to-slate-900',
}

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 6)  return '🌙 Đêm khuya rồi nhé'
  if (hour < 12) return '☀️ Chào buổi sáng'
  if (hour < 18) return '🌤️ Buổi chiều tốt lành'
  return '🌙 Chào buổi tối'
}

export function TopBar({ user, onSwitchRole }: TopBarProps) {
  return (
    <header
      id="topbar"
      className="h-[60px] border-b border-nquoc-border bg-white/85 backdrop-blur-md sticky top-0 z-50
        flex items-center justify-between px-6 flex-shrink-0 shadow-[0_1px_0_rgba(0,0,0,0.04)]"
    >
      {/* Left: Greeting */}
      <div className="flex items-center gap-3">
        <div>
          <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-wider leading-none">
            {getGreeting()}, {roleLabels[user.role]}
          </p>
          <p className="text-sm font-bold text-nquoc-text font-header leading-tight mt-0.5">
            {user.name} <span className="text-base animate-wave inline-block">👋</span>
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">

        {/* Dev Role Switcher */}
        {(IS_DEV || IS_PREVIEW) && onSwitchRole && (
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-1.5">
            <span className="text-[10px] font-bold text-amber-600 mr-1.5 uppercase tracking-wider">DEV</span>
            {(['hr_manager', 'leader', 'member'] as UserRole[]).map((role) => (
              <button
                key={role}
                id={`switch-role-${role}`}
                onClick={() => onSwitchRole(role)}
                className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all ${
                  user.role === role
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-amber-600 hover:bg-amber-100'
                }`}
              >
                {role === 'hr_manager' ? 'HR' : role === 'leader' ? 'Leader' : 'Member'}
              </button>
            ))}
          </div>
        )}

        {/* Notification bell */}
        <button
          id="notification-bell"
          className="relative w-9 h-9 rounded-2xl bg-nquoc-bg border border-nquoc-border flex items-center justify-center
            hover:bg-indigo-50 hover:border-indigo-200 transition-all"
          title="Thông báo"
        >
          <span className="text-sm">🔔</span>
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 rounded-full flex items-center justify-center">
            <span className="text-[8px] text-white font-bold">2</span>
          </span>
        </button>

        {/* Role badge + Avatar */}
        <div className="flex items-center gap-2">
          <Badge variant={roleBadgeVariant[user.role]} size="sm">
            {roleLabels[user.role]}
          </Badge>
          <div className={`w-9 h-9 rounded-2xl bg-gradient-to-br ${roleGradient[user.role]} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>

      </div>
    </header>
  )
}
