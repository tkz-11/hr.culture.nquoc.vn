import apiClient from '../../../shared/lib/api-client'
import type {
  PassportProfile, CommHeatmapEntry, CommSession,
  AnalyzeResult, RewriteResult, LeaderIntegrity,
  ScenarioGroup, ApiSuccess,
} from '../../../shared/types'

const BASE = '/api/hr/passport'

export const passportService = {
  async getMe(): Promise<{
    profile: PassportProfile
    heatmap: CommHeatmapEntry[]
    recent_sessions: CommSession[]
    scenarios_done: number
  }> {
    const res = await apiClient.get<ApiSuccess<{
      profile: PassportProfile
      heatmap: CommHeatmapEntry[]
      recent_sessions: CommSession[]
      scenarios_done: number
    }>>(`${BASE}/me`)
    return res.data.data
  },

  async analyze(text: string): Promise<AnalyzeResult> {
    const res = await apiClient.post<ApiSuccess<AnalyzeResult>>(`${BASE}/analyze`, { text })
    return res.data.data
  },

  async rewrite(text: string): Promise<RewriteResult> {
    const res = await apiClient.post<ApiSuccess<RewriteResult>>(`${BASE}/rewrite`, { text })
    return res.data.data
  },

  async submitScenario(payload: {
    scenario_group: ScenarioGroup
    prompt: string
    response: string
  }): Promise<{ rating: string; xp_delta: number; rewrite?: string; feedback_message: string }> {
    const res = await apiClient.post<ApiSuccess<{ rating: string; xp_delta: number; rewrite?: string; feedback_message: string }>>(
      `${BASE}/scenarios/submit`,
      payload
    )
    return res.data.data
  },

  async getLeaderProfile(id: string): Promise<{
    integrity: LeaderIntegrity
    vague_phrases_this_week: string[]
    improvement_suggestions: string[]
  }> {
    const res = await apiClient.get<ApiSuccess<{
      integrity: LeaderIntegrity
      vague_phrases_this_week: string[]
      improvement_suggestions: string[]
    }>>(`${BASE}/leader/${id}`)
    return res.data.data
  },

  async getDashboard(): Promise<{
    avg_directness_score: number
    banned_word_pct: number
    weekly_trend: { week: string; avg_score: number }[]
    members_needing_attention: { user_id: string; name: string; directness_score: number; trend: string }[]
  }> {
    const res = await apiClient.get<ApiSuccess<{
      avg_directness_score: number
      banned_word_pct: number
      weekly_trend: { week: string; avg_score: number }[]
      members_needing_attention: { user_id: string; name: string; directness_score: number; trend: string }[]
    }>>(`${BASE}/dashboard`)
    return res.data.data
  },

  async logHeatmap(payload: {
    date: string
    deadline_met?: boolean
    wyfl_done?: boolean
    banned_word_count?: number
  }): Promise<CommHeatmapEntry> {
    const res = await apiClient.post<ApiSuccess<CommHeatmapEntry>>(`${BASE}/heatmap/log`, payload)
    return res.data.data
  },
}
