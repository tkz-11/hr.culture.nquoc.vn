export interface OrgUnit {
  id: string
  name: string
  member_count: number
}

export interface HrMemberRisk {
  person_id: string
  full_name: string
  team: string
  role: string
  risk_level: 'high' | 'medium' | 'low'
  risk_score: number
  risk_factors: string[]
  last_active_at: string
  last_intervention_at?: string
}

export interface HrIntervention {
  id: string
  person_id: string
  intervened_by: string
  type: string
  notes: string
  outcome: string
  occurred_at: string
  created_at: string
}

export interface HrCoachingRequest {
  id: string
  member_id: string
  member_name: string
  requested_by: string
  reason: string
  urgency: string
  status: string
  created_at: string
  updated_at: string
}
