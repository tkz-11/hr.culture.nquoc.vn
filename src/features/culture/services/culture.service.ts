import apiClient from '../../../shared/lib/api-client'
import type {
  Challenge, CultureStory, OrgStructure, BehaviorScores,
  JourneyMilestoneRecord, TeamHealth, TeamAnalysis,
  ExperienceType, CourageLevel, SupportType,
  ApiSuccess, ApiCursorPaginated,
} from '../../../shared/types'

const BASE = '/api/hr/culture'

export const cultureService = {
  async getOrg(): Promise<OrgStructure[]> {
    const res = await apiClient.get<any>(`${BASE}/org`).catch(() => ({ data: { data: [] } }))
    return res.data.data || []
  },

  async getFeed(params?: { team_id?: string; cursor?: string; per_page?: number }): Promise<{
    items: CultureStory[]
    meta: { next_cursor?: string; has_next: boolean }
  }> {
    const res = await apiClient.get<any>(`${BASE}/stories`, { params })
    return { items: res.data.data || [], meta: { has_next: false } }
  },

  async getChallenges(): Promise<{ weekly: Challenge; daily: Challenge[] }> {
    const res = await apiClient.get<any>(`${BASE}/challenges`)
    const challenges = res.data.data || []
    return { 
      weekly: challenges.find((c: any) => c.type === 'weekly') || challenges[0],
      daily: challenges.filter((c: any) => c.type === 'daily')
    }
  },

  async submitChallenge(payload: { challenge_id: string; proof_text: string }) {
    const res = await apiClient.post<any>(`${BASE}/challenge-responses`, { 
      challenge_id: payload.challenge_id, 
      response_content: payload.proof_text 
    })
    const d = res.data.data
    return {
      approved: true,
      awarded_points: d?.xp_earned || 10,
      ai_feedback: d?.ai_feedback || 'Phản hồi tốt',
      ai_reason: 'Đạt tiêu chuẩn'
    }
  },

  async getStories(params?: any): Promise<CultureStory[]> {
    const res = await apiClient.get<any>(`${BASE}/stories`, { params })
    return res.data.data || []
  },

  async createStory(payload: any): Promise<CultureStory> {
    const res = await apiClient.post<any>(`${BASE}/stories`, payload)
    return res.data.data
  },

  async getLessons(params?: any): Promise<CultureStory[]> {
    const res = await apiClient.get<any>(`${BASE}/lessons`, { params })
    return res.data.data || []
  },

  async getJourneyMe() {
    const [journeyRes, scoresRes] = await Promise.all([
      apiClient.get<any>(`${BASE}/journey/me`),
      apiClient.get<any>(`${BASE}/behavior-scores/me`)
    ])
    const milestones = journeyRes.data.data?.milestones || []
    const scores = scoresRes.data.data || { try_score: 0, share_score: 0, learn_score: 0, help_score: 0, total_xp: 0, streak: 0 }
    return {
      milestones,
      current_scores: scores,
      radar_data: { try: scores.try_score, share: scores.share_score, learn: scores.learn_score, help: scores.help_score }
    }
  },

  async getJourneyTrend(): Promise<any[]> {
    const res = await apiClient.get<any>(`${BASE}/journey/trend`).catch(() => ({ data: { data: [] } }))
    return res.data.data || []
  },

  async getTeamHealth(department_id?: string): Promise<TeamHealth[]> {
    const res = await apiClient.get<any>(`${BASE}/team-health`, {
      params: department_id ? { department_id } : undefined,
    })
    return res.data.data || []
  },

  async analyzeTeamHealth(payload: { team_id: string; period: string }): Promise<TeamAnalysis> {
    const res = await apiClient.post<any>(`${BASE}/team-health/${payload.team_id}/ai-analysis`)
    const txt = res.data.data?.analysis_text || ''
    return {
      insights: txt,
      patterns: ['Giao tiếp tốt'],
      recommendations: ['Tiếp tục phát huy'],
      analyzed_at: res.data.data?.generated_at || new Date().toISOString()
    }
  },
}
