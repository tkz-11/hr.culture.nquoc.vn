// src/mocks/data/persons.ts
import type { Role } from '@shared/types/auth'

export interface MockPerson {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  roles: Role[]
  primary_role: Role
}

export const MOCK_PERSONS: MockPerson[] = [
  {
    id: 'a1b2c3d4-0001-4000-8000-000000000001',
    email: 'hr-manager-01@nquoc-hr-culture.vn',
    full_name: 'HR Manager 01',
    roles: ['hr_manager'] as Role[],
    primary_role: 'hr_manager' as Role,
  },
  {
    id: 'a1b2c3d4-0002-4000-8000-000000000002',
    email: 'leader-01@nquoc-hr-culture.vn',
    full_name: 'Leader 01',
    roles: ['leader'] as Role[],
    primary_role: 'leader' as Role,
  },
  {
    id: 'a1b2c3d4-0003-4000-8000-000000000003',
    email: 'member-01@nquoc-hr-culture.vn',
    full_name: 'Member 01',
    roles: ['member'] as Role[],
    primary_role: 'member' as Role,
  },
  {
    id: 'a1b2c3d4-0004-4000-8000-000000000004',
    email: 'member-02@nquoc-hr-culture.vn',
    full_name: 'Member 02',
    roles: ['member'] as Role[],
    primary_role: 'member' as Role,
  },
]
