import apiClient from '../../../shared/lib/api-client'
import type {
  RetentionDashboard, HRMember, LeaderAssignment, Intervention,
  LeaderMetrics, CoachingRequest, RiskLevel, AssignmentStatus,
  CoachingType, CoachingStatus, ApiResponse, ApiSuccess,
} from '../../../shared/types'

const BASE = '/api/hr/retention'

export const retentionService = {
  async getDashboard(): Promise<RetentionDashboard> {
    const res = await apiClient.get<ApiSuccess<RetentionDashboard>>(`${BASE}/dashboard`)
    return res.data.data
  },

  async getMembers(params?: {
    risk_level?: RiskLevel
    checkpoint?: 30 | 60 | 90
    team_id?: string
    leader_id?: string
  }): Promise<HRMember[]> {
    const res = await apiClient.get<ApiSuccess<HRMember[]>>(`${BASE}/members`, { params })
    return res.data.data
  },

  async getMember(id: string): Promise<HRMember> {
    const res = await apiClient.get<ApiSuccess<HRMember>>(`${BASE}/members/${id}`)
    return res.data.data
  },

  async updateRisk(
    memberId: string,
    payload: { risk_level: RiskLevel; reason?: string; checkpoint_day?: 30 | 60 | 90 }
  ) {
    const res = await apiClient.post<ApiResponse<unknown>>(`${BASE}/members/${memberId}/risk`, payload)
    return res.data
  },

  async getAssignments(params?: { status?: AssignmentStatus }): Promise<LeaderAssignment[]> {
    const res = await apiClient.get<ApiSuccess<LeaderAssignment[]>>(`${BASE}/assignments`, { params })
    return res.data.data
  },

  async createAssignment(payload: { member_id: string; leader_id: string }): Promise<LeaderAssignment> {
    const res = await apiClient.post<ApiSuccess<LeaderAssignment>>(`${BASE}/assignments`, payload)
    return res.data.data
  },

  async updateAssignment(
    id: string,
    payload: { status: AssignmentStatus; notes?: string; stuck_since?: string }
  ): Promise<LeaderAssignment> {
    const res = await apiClient.put<ApiSuccess<LeaderAssignment>>(`${BASE}/assignments/${id}`, payload)
    return res.data.data
  },

  async createIntervention(payload: {
    member_id: string
    action_taken: string
    intervene_date: string
    scheduled_followup_at?: string
  }): Promise<Intervention> {
    const res = await apiClient.post<ApiSuccess<Intervention>>(`${BASE}/interventions`, payload)
    return res.data.data
  },

  async getInterventions(member_id?: string): Promise<Intervention[]> {
    const res = await apiClient.get<ApiSuccess<Intervention[]>>(`${BASE}/interventions`, {
      params: member_id ? { member_id } : undefined,
    })
    return res.data.data
  },

  async createCoachingRequest(payload: { leader_id: string; type: CoachingType }): Promise<CoachingRequest> {
    const res = await apiClient.post<ApiSuccess<CoachingRequest>>(`${BASE}/coaching-requests`, payload)
    return res.data.data
  },

  async updateCoachingRequest(
    id: string,
    payload: { status: CoachingStatus; scheduled_at?: string }
  ): Promise<CoachingRequest> {
    const res = await apiClient.put<ApiSuccess<CoachingRequest>>(`${BASE}/coaching-requests/${id}`, payload)
    return res.data.data
  },

  async getLeaderMetrics(): Promise<(LeaderMetrics & { coaching_flag: boolean })[]> {
    const res = await apiClient.get<ApiSuccess<(LeaderMetrics & { coaching_flag: boolean })[]>>(
      `${BASE}/leader-metrics`
    )
    return res.data.data
  },
}
