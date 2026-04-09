import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { AuthUser, UserRole } from '../types'

// Dev mode: role switcher
const DEV_ROLE_KEY = 'nquoc-dev-role'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const u = data.session.user
        const devRole = localStorage.getItem(DEV_ROLE_KEY) as UserRole | null
        setUser({
          id: u.id,
          email: u.email ?? '',
          name: u.user_metadata?.name ?? u.email ?? 'User',
          avatar_url: u.user_metadata?.avatar_url,
          role: devRole ?? (u.user_metadata?.role as UserRole) ?? 'member',
        })
      }
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user
        const devRole = localStorage.getItem(DEV_ROLE_KEY) as UserRole | null
        setUser({
          id: u.id,
          email: u.email ?? '',
          name: u.user_metadata?.name ?? u.email ?? 'User',
          avatar_url: u.user_metadata?.avatar_url,
          role: devRole ?? (u.user_metadata?.role as UserRole) ?? 'member',
        })
      } else {
        setUser(null)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const switchRole = (role: UserRole) => {
    localStorage.setItem(DEV_ROLE_KEY, role)
    if (user) setUser({ ...user, role })
  }

  const signOut = () => supabase.auth.signOut()

  return { user, loading, switchRole, signOut }
}
