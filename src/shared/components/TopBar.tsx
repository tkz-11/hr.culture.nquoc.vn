import type { AuthUser, UserRole } from '../types'
import { Badge } from './Badge'

interface TopBarProps {
  user: AuthUser
  onSwitchRole?: (role: UserRole) => void
}

const IS_DEV = import.meta.env.DEV

const roleLabels: Record<UserRole, string> = {
  hr_manager: 'HR Manager',
  leader: 'Leader',
  member: 'Thành viên',
}

const roleBadgeVariant: Record<UserRole, 'red' | 'blue' | 'slate'> = {
  hr_manager: 'red',
  leader: 'blue',
  member: 'slate',
}

export function TopBar({ user, onSwitchRole }: TopBarProps) {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Chào buổi sáng'
    if (hour < 18) return 'Chúc bạn buổi chiều tốt lành'
    return 'Chào buổi tối'
  }

  return (
    <header className="h-16 border-b border-nquoc-border bg-white/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex flex-col">
        <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-wider">{getGreeting()}, {roleLabels[user.role]}</p>
        <h1 className="text-base font-bold text-nquoc-text font-header">
          {user.name} <span className="text-xl inline-block animate-wave ml-1">👋</span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Dev role switcher */}
        {IS_DEV && onSwitchRole && (
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
            <span className="text-[10px] font-medium text-amber-600 mr-1">DEV:</span>
            {(['hr_manager', 'leader', 'member'] as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => onSwitchRole(role)}
                className={`text-[10px] px-2 py-0.5 rounded font-medium transition-colors ${
                  user.role === role
                    ? 'bg-amber-400 text-white'
                    : 'text-amber-600 hover:bg-amber-100'
                }`}
              >
                {role === 'hr_manager' ? 'HR' : role === 'leader' ? 'Leader' : 'Member'}
              </button>
            ))}
          </div>
        )}

        {/* User info */}
        <div className="flex items-center gap-2.5">
          <Badge variant={roleBadgeVariant[user.role]} size="sm">
            {roleLabels[user.role]}
          </Badge>
          <div className="w-8 h-8 rounded-full bg-nquoc-blue flex items-center justify-center text-white font-semibold text-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  )
}
