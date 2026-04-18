export type Role = 'hr_manager' | 'leader' | 'member'

export interface AuthUser {
  person_id: string
  email: string
  full_name: string
  avatar_url?: string
  roles: Role[]
  primary_role: Role
}
