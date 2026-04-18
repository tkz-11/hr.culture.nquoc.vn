// src/mocks/data/hr-retention.ts
import type { HrMemberRisk, HrIntervention, HrCoachingRequest } from '@modules/retention/types'
import { MOCK_PERSONS } from './persons'

export const MOCK_RETENTION_DASHBOARD = {
  total_members: 32,
  high_risk_count: 4,
  medium_risk_count: 11,
  low_risk_count: 17,
  pending_interventions: 3,
  trend_this_week: 'stable' as const,
  priority_list: [
    {
      person_id: MOCK_PERSONS[2].id,
      full_name: MOCK_PERSONS[2].full_name,
      team: 'Team Kinh Doanh',
      role: 'member',
      risk_level: 'high' as const,
      risk_score: 82,
      risk_factors: ['Vắng mặt liên tiếp', 'Giảm tương tác'],
      last_active_at: '2026-04-10T08:00:00.000Z',
    },
    {
      person_id: MOCK_PERSONS[3].id,
      full_name: MOCK_PERSONS[3].full_name,
      team: 'Team Vận Hành',
      role: 'member',
      risk_level: 'high' as const,
      risk_score: 75,
      risk_factors: ['KPI thấp 2 tháng liên tiếp'],
      last_active_at: '2026-04-12T09:00:00.000Z',
    },
  ],
}

export const MOCK_MEMBERS_RISK: HrMemberRisk[] = [
  {
    person_id: MOCK_PERSONS[2].id,
    full_name: MOCK_PERSONS[2].full_name,
    team: 'Team Kinh Doanh',
    role: 'member',
    risk_level: 'high',
    risk_score: 82,
    risk_factors: ['Vắng mặt liên tiếp', 'Giảm tương tác'],
    last_active_at: '2026-04-10T08:00:00.000Z',
    last_intervention_at: '2026-03-28T10:00:00.000Z',
  },
  {
    person_id: MOCK_PERSONS[3].id,
    full_name: MOCK_PERSONS[3].full_name,
    team: 'Team Vận Hành',
    role: 'member',
    risk_level: 'medium',
    risk_score: 55,
    risk_factors: ['Ít tham gia meetings'],
    last_active_at: '2026-04-14T07:00:00.000Z',
  },
  {
    person_id: MOCK_PERSONS[1].id,
    full_name: MOCK_PERSONS[1].full_name,
    team: 'Team Marketing',
    role: 'leader',
    risk_level: 'low',
    risk_score: 20,
    risk_factors: [],
    last_active_at: '2026-04-17T09:00:00.000Z',
  },
]

export const MOCK_INTERVENTIONS: HrIntervention[] = [
  {
    id: 'intv-0001-0000-4000-8000-000000000001',
    person_id: MOCK_PERSONS[2].id,
    intervened_by: MOCK_PERSONS[0].id,
    type: 'call',
    notes: 'Gọi điện hỏi thăm, bạn chia sẻ áp lực công việc.',
    outcome: 'followup',
    occurred_at: '2026-04-15T10:00:00.000Z',
    created_at: '2026-04-15T10:30:00.000Z',
  },
]

export const MOCK_COACHING_REQUESTS: HrCoachingRequest[] = [
  {
    id: 'coachr-001-0000-4000-8000-000000000001',
    member_id: MOCK_PERSONS[2].id,
    member_name: MOCK_PERSONS[2].full_name,
    requested_by: MOCK_PERSONS[1].id,
    reason: 'Thái độ tiêu cực trong team meeting',
    urgency: 'high',
    status: 'pending',
    created_at: '2026-04-16T08:00:00.000Z',
    updated_at: '2026-04-16T08:00:00.000Z',
  },
]
