import { Outlet } from 'react-router-dom'
import { Sidebar } from '@shared/components/Sidebar'
import { TopBar } from '@shared/components/TopBar'
import { NBotCoach } from '@shared/components/NBotCoach'
import { useAuthStore } from '@modules/auth/stores/auth.store'
import type { UserRole } from '@shared/types'

export function AppLayout() {
  const { user, switchRole } = useAuthStore()
  if (!user) return null

  return (
    <div className="flex min-h-screen bg-nquoc-bg">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar user={user} onSwitchRole={(role: UserRole) => switchRole(role)} />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
      <NBotCoach user={user} />
    </div>
  )
}
