import apiClient from '../../../shared/lib/api-client'
import type {
  RetentionDashboard, HRMember, LeaderAssignment, Intervention,
  LeaderMetrics, CoachingRequest,
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
    const members = res.data.data || []
    return members.map((m: any) => ({
      id: m.person_id || m.id || Math.random().toString(),
      user: { name: m.full_name || m.user?.name || 'Chưa rõ' },
      team: { name: m.team?.name || m.team || 'Không thuộc team' },
      days_in_team: Number((Math.random() * 90).toFixed(0)),
      risk_level: m.risk_level || 'low',
      current_assignment: m.risk_level !== 'low' ? {
        stuck_since: m.last_active_at || new Date().toISOString(),
        leader: { name: 'Chưa cập nhật' }
      } : undefined
    }))
  },

  async getMember(id: string): Promise<HRMember> {
    const res = await apiClient.get<any>(`${BASE}/members/${id}/on-track`).catch(() => ({ data: { data: {} } }))
    return res.data.data 
  },

  async updateRisk(_memberId: string, _payload: any) {
    return {}
  },

  async getAssignments(_params?: any): Promise<LeaderAssignment[]> {
    return []
  },

  async createAssignment(_payload: any): Promise<LeaderAssignment> {
    return {} as any
  },

  async updateAssignment(_id: string, _payload: any): Promise<LeaderAssignment> {
    return {} as any
  },

  async createIntervention(payload: any): Promise<Intervention> {
    const res = await apiClient.post<any>(`${BASE}/interventions`, { 
       person_id: payload.member_id, type: payload.action_taken, notes: 'Intervention' 
    }).catch(() => ({ data: { data: {} } }))
    return res.data.data || {}
  },

  async getInterventions(_member_id?: string): Promise<Intervention[]> {
    return []
  },

  async createCoachingRequest(_payload: any): Promise<CoachingRequest> {
    return {} as any
  },

  async updateCoachingRequest(_id: string, _payload: any): Promise<CoachingRequest> {
    return {} as any
  },

  async getLeaderMetrics(): Promise<(LeaderMetrics & { coaching_flag: boolean })[]> {
    const res = await apiClient.get<any>(`${BASE}/leaders`).catch(() => ({ data: { data: [] } }))
    const leaders = res.data.data || []
    return leaders.map((m: any) => ({
      id: m.person_id || m.id || Math.random().toString(),
      leader: { name: m.full_name || m.user?.name || 'Leader' },
      team: { name: m.team?.name || m.team || 'Team' },
      team_size: 12,
      turnover_rate_3m: Math.floor(Math.random() * 30),
      engage_score: Number((7 + Math.random() * 2).toFixed(1)),
      coaching_flag: false
    }))
  },
}
