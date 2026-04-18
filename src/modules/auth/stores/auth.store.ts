import { create } from 'zustand'
import { supabase } from '@shared/config/supabase'
import { authApi } from '../api/auth.api'
import type { AuthUser, Role } from '@shared/types/auth'

interface AuthState {
  user: AuthUser | null
  loading: boolean
  initialize: () => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  switchRole: (role: Role) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,

  initialize: async () => {
    set({ loading: true })
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session && import.meta.env.VITE_ENABLE_MOCKING !== 'true') {
        set({ user: null, loading: false })
        return
      }

      // In mock mode, /api/auth/me is intercepted by MSW using localStorage role
      const user = await authApi.getMe()
      set({ user: user ?? null, loading: false })
    } catch {
      set({ user: null, loading: false })
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        set({ user: null })
        return
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        try {
          const user = await authApi.getMe()
          set({ user: user ?? null })
        } catch {
          set({ user: null })
        }
      }
    })
  },

  loginWithGoogle: async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth-callback` },
    })
  },

  logout: async () => {
    localStorage.removeItem('nquoc-dev-role')
    await supabase.auth.signOut()
    set({ user: null })
  },

  // Dev / role-switcher helper (mock mode only)
  switchRole: (role: Role) => {
    localStorage.setItem('nquoc-dev-role', role)
    const current = get().user
    if (current) set({ user: { ...current, primary_role: role, roles: [role] } })
  },
}))
