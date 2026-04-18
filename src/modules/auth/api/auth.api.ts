import { api } from '@shared/config/api-client'
import type { AuthUser } from '@shared/types/auth'

export const authApi = {
  getMe: () => api.get<AuthUser>('/auth/me'),
}
