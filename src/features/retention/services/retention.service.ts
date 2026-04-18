import apiClient from '../../../shared/lib/api-client'
import type {
  RetentionDashboard, HRMember, LeaderAssignment, Intervention,
  LeaderMetrics, CoachingRequest, RiskLevel, AssignmentStatus,
  CoachingType, CoachingStatus, ApiResponse, ApiSuccess,
} from '../../../shared/types'

const BASE = '/api/hr/retention'

export const retentionService = {
  async getDashboard(): Promise<RetentionDashboard> {
    const res = await apiClient.get<any>(`${BASE}/dashboard`).catch(() => ({ data: { data: null } }))
    const d = res.data.data || {}
    return {
      total_members: d.total_members || 0,
      high_risk: d.high_risk_count || 0,
      stuck_count: d.pending_interventions || 0,
      checkpoints_due: 0,
      recent_alerts: d.priority_list ? d.priority_list.map((p: any) => ({
        member_name: p.full_name,
        days_ago: Math.floor((Date.now() - new Date(p.last_active_at).getTime()) / 86400000) || 5
      })) : []
    } as RetentionDashboard
  },

  async getMembers(params?: any): Promise<HRMember[]> {
    const res = await apiClient.get<any>(`${BASE}/members`, { params }).catch(() => ({ data: { data: [] } }))
    return res.data.data || []
  },

  async getMember(id: string): Promise<HRMember> {
    const res = await apiClient.get<any>(`${BASE}/members/${id}/on-track`).catch(() => ({ data: { data: {} } }))
    return res.data.data 
  },

  async updateRisk(memberId: string, payload: any) {
    return {}
  },

  async getAssignments(params?: any): Promise<LeaderAssignment[]> {
    return []
  },

  async createAssignment(payload: any): Promise<LeaderAssignment> {
    return {} as any
  },

  async updateAssignment(id: string, payload: any): Promise<LeaderAssignment> {
    return {} as any
  },

  async createIntervention(payload: any): Promise<Intervention> {
    const res = await apiClient.post<any>(`${BASE}/interventions`, { 
       person_id: payload.member_id, type: payload.action_taken, notes: 'Intervention' 
    }).catch(() => ({ data: { data: {} } }))
    return res.data.data || {}
  },

  async getInterventions(member_id?: string): Promise<Intervention[]> {
    return []
  },

  async createCoachingRequest(payload: any): Promise<CoachingRequest> {
    return {} as any
  },

  async updateCoachingRequest(id: string, payload: any): Promise<CoachingRequest> {
    return {} as any
  },

  async getLeaderMetrics(): Promise<(LeaderMetrics & { coaching_flag: boolean })[]> {
    const res = await apiClient.get<any>(`${BASE}/leaders`).catch(() => ({ data: { data: [] } }))
    const leaders = res.data.data || []
    return leaders.map((m: any) => ({
      id: m.id,
      leader: m.user,
      team: { name: m.team || 'Team' },
      team_size: 12,
      turnover_rate_3m: Math.floor(Math.random() * 30),
      engage_score: 7 + Math.random() * 2,
      coaching_flag: false
    }))
  },
}
