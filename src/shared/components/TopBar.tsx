import type { AuthUser } from '../types'
type UserRole = AuthUser['primary_role']
import { Badge } from './Badge'

interface TopBarProps {
  user: AuthUser
  onSwitchRole?: (role: UserRole) => void
}

const IS_DEV = import.meta.env.DEV
const IS_PREVIEW = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')

const roleLabels: Record<UserRole, string> = {
  hr_manager: 'HR Manager',
  leader:     'Leader',
  member:     'Thành viên',
}

const roleBadgeVariant: Record<UserRole, 'red' | 'blue' | 'indigo' | 'slate'> = {
  hr_manager: 'red',
  leader:     'indigo',
  member:     'slate',
}

const roleAvatarColor: Record<UserRole, string> = {
  hr_manager: '#e53e3e',
  leader:     '#6d28d9',
  member:     '#1a1a2e',
}

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 6)  return 'Đêm khuya rồi nhé'
  if (h < 12) return 'Chào buổi sáng'
  if (h < 18) return 'Buổi chiều tốt lành'
  return 'Chào buổi tối'
}

const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)

export function TopBar({ user, onSwitchRole }: TopBarProps) {
  return (
    <header className="h-[60px] border-b border-[#ebebeb] bg-white sticky top-0 z-50 flex items-center justify-between px-6 flex-shrink-0">

      {/* Left: Greeting */}
      <div>
        <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider leading-none">
          {getGreeting()}, {roleLabels[user.primary_role]}
        </p>
        <p className="text-[13px] font-bold text-[#1a1a2e] font-header leading-tight mt-0.5">
          {user.full_name}
        </p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">

        {/* Dev Role Switcher */}
        {(IS_DEV || IS_PREVIEW) && onSwitchRole && (
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-[10px] px-2.5 py-1.5">
            <span className="text-[10px] font-bold text-amber-600 mr-1.5 uppercase tracking-wider">DEV</span>
            {(['hr_manager', 'leader', 'member'] as UserRole[]).map((role) => (
              <button
                key={role}
                id={`switch-role-${role}`}
                onClick={() => onSwitchRole(role)}
                className={`text-[10px] px-2 py-1 rounded-[7px] font-bold transition-all ${
                  user.primary_role === role
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
          className="relative w-9 h-9 rounded-[10px] bg-[#f5f6fa] border border-[#ebebeb] flex items-center justify-center text-[#64748b] hover:bg-[#f0f0f0] transition-all"
          title="Thông báo"
        >
          <BellIcon />
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#e53e3e] rounded-full flex items-center justify-center">
            <span className="text-[8px] text-white font-bold">2</span>
          </span>
        </button>

        {/* Role badge + Avatar */}
        <div className="flex items-center gap-2">
          <Badge variant={roleBadgeVariant[user.primary_role]} size="sm">
            {roleLabels[user.primary_role]}
          </Badge>
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white font-bold text-sm"
            style={{ background: roleAvatarColor[user.primary_role] }}
          >
            {user.full_name.charAt(0).toUpperCase()}
          </div>
        </div>

      </div>
    </header>
  )
}
