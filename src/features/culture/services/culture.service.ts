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
    const res = await apiClient.get<ApiSuccess<OrgStructure[]>>(`${BASE}/org`)
    return res.data.data
  },

  async getFeed(params?: { team_id?: string; cursor?: string; per_page?: number }): Promise<{
    items: CultureStory[]
    meta: { next_cursor?: string; has_next: boolean }
  }> {
    const res = await apiClient.get<ApiCursorPaginated<CultureStory>>(`${BASE}/feed`, { params })
    return { items: res.data.items, meta: res.data.meta }
  },

  async getChallenges(): Promise<{
    weekly: Challenge
    daily: Challenge[]
  }> {
    const res = await apiClient.get<ApiSuccess<{ weekly: Challenge; daily: Challenge[] }>>(`${BASE}/challenges`)
    return res.data.data
  },

  async submitChallenge(payload: { challenge_id: string; proof_text: string }): Promise<{
    approved: boolean
    awarded_points: number
    ai_feedback: string
    ai_reason: string
  }> {
    const res = await apiClient.post<ApiSuccess<{
      approved: boolean
      awarded_points: number
      ai_feedback: string
      ai_reason: string
    }>>(`${BASE}/challenges/submit`, payload)
    return res.data.data
  },

  async getStories(params?: {
    team_id?: string
    experience_type?: ExperienceType
    courage_level?: CourageLevel
    from_date?: string
    to_date?: string
    cursor?: string
  }): Promise<CultureStory[]> {
    const res = await apiClient.get<ApiSuccess<CultureStory[]>>(`${BASE}/stories`, { params })
    return res.data.data
  },

  async createStory(payload: {
    team_id: string
    experience_type: ExperienceType
    courage_level: CourageLevel
    content: string
    support_type?: SupportType
    is_public: boolean
  }): Promise<CultureStory> {
    const res = await apiClient.post<ApiSuccess<CultureStory>>(`${BASE}/stories`, payload)
    return res.data.data
  },

  async getLessons(params?: {
    team_id?: string
    experience_type?: ExperienceType
    courage_level?: CourageLevel
    q?: string
  }): Promise<CultureStory[]> {
    const res = await apiClient.get<ApiSuccess<CultureStory[]>>(`${BASE}/lessons`, { params })
    return res.data.data
  },

  async getJourneyMe(): Promise<{
    milestones: JourneyMilestoneRecord[]
    current_scores: BehaviorScores
    radar_data: { try: number; share: number; learn: number; help: number }
  }> {
    const res = await apiClient.get<ApiSuccess<{
      milestones: JourneyMilestoneRecord[]
      current_scores: BehaviorScores
      radar_data: { try: number; share: number; learn: number; help: number }
    }>>(`${BASE}/journey/me`)
    return res.data.data
  },

  async getJourneyTrend(): Promise<{
    week_of: string
    try_score: number
    share_score: number
    learn_score: number
    help_score: number
  }[]> {
    const res = await apiClient.get<ApiSuccess<{
      week_of: string
      try_score: number
      share_score: number
      learn_score: number
      help_score: number
    }[]>>(`${BASE}/journey/trend`)
    return res.data.data
  },

  async getTeamHealth(department_id?: string): Promise<(TeamHealth)[]> {
    const res = await apiClient.get<ApiSuccess<TeamHealth[]>>(`${BASE}/team-health`, {
      params: department_id ? { department_id } : undefined,
    })
    return res.data.data
  },

  async analyzeTeamHealth(payload: { team_id: string; period: string }): Promise<TeamAnalysis> {
    const res = await apiClient.post<ApiSuccess<TeamAnalysis>>(`${BASE}/team-health/analyze`, payload)
    return res.data.data
  },
}
