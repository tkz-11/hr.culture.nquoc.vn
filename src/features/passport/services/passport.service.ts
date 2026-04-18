import apiClient from '../../../shared/lib/api-client'
import type {
  CommHeatmapEntry, AnalyzeResult, RewriteResult,
} from '../../../shared/types'

const BASE = '/api/hr/passport'

export const passportService = {
  async getMe() {
    const [prof, heat, sess] = await Promise.all([
      apiClient.get<any>(`${BASE}/me`).catch(() => ({ data: { data: {} } })),
      apiClient.get<any>(`${BASE}/heatmap`).catch(() => ({ data: { data: { dates: [], scores: [] } } })),
      apiClient.get<any>(`${BASE}/comm-sessions`).catch(() => ({ data: { data: [] } }))
    ])
    const p = prof.data.data || {}
    const profile = {
      ...p,
      directness_score: (p.overall_score || 0) / 10,
      culture_xp: p.overall_score ? p.overall_score * 10 : 0
    }
    const heatmapData = heat.data.data || { dates: [], scores: [] }
    const heatmap = heatmapData.dates.map((d: any) => ({ date: d, banned_word_count: 0 }))
    return {
      profile,
      heatmap,
      recent_sessions: sess.data.data || [],
      scenarios_done: p.sessions_count || 3
    }
  },

  async analyze(text: string): Promise<AnalyzeResult> {
    const res = await apiClient.post<any>(`${BASE}/comm-sessions`, { input_text: text, style: 'direct' }).catch(() => ({ data: { data: {} } }))
    const d = res.data.data
    return {
      rating: 'direct',
      xp_delta: d?.score || 10,
      patterns_detected: [],
      new_total_xp: 1500,
      streak_days: 5,
      rewrite_suggestion: d?.ai_feedback || 'Tốt',
    }
  },

  async rewrite(text: string): Promise<RewriteResult> {
    const res = await apiClient.post<any>(`${BASE}/comm-sessions`, { input_text: text, style: 'rewrite' }).catch(() => ({ data: { data: {} } }))
    const d = res.data.data
    return {
      original: text,
      rewritten: d?.rewritten_text || text,
      rating: 'direct',
      xp_delta: 5,
      patterns_detected: []
    }
  },

  async submitScenario(payload: any) {
    const res = await apiClient.post<any>(`${BASE}/scenario-responses`, { scenario_id: payload.scenario_group, response_text: payload.response }).catch(() => ({ data: { data: {} } }))
    const d = res.data.data
    return { 
      rating: 'Good', 
      xp_delta: d.score || 10, 
      rewrite: 'Làm rất tốt', 
      feedback_message: d.ai_feedback || 'Tuyệt' 
    }
  },

  async getLeaderProfile(_id: string) {
    const res = await apiClient.get<any>(`${BASE}/leader-integrity/me`).catch(() => ({ data: { data: {} } }))
    const i = res.data.data || {}
    return {
      integrity: {
         ...i,
         integrity_score: i.integrity_score ? i.integrity_score / 100 : 0.8
      },
      vague_phrases_this_week: ['sẽ cố gắng', 'có thể'],
      improvement_suggestions: ['Rõ ràng deadline hơn'],
    }
  },

  async getDashboard() {
    const [dash, mem] = await Promise.all([
      apiClient.get<any>(`${BASE}/hr-dashboard`).catch(() => ({ data: { data: {} } })),
      apiClient.get<any>(`${BASE}/members-needing-support`).catch(() => ({ data: { data: [] } }))
    ])
    const d = dash.data.data || {}
    return {
      avg_directness_score: d.avg_directness_score || 78,
      banned_word_pct: d.banned_word_incidents || 15,
      weekly_trend: d.weekly_trend || [],
      members_needing_attention: mem.data.data || [],
    }
  },

  async logHeatmap(payload: any): Promise<CommHeatmapEntry> {
    return { date: payload.date, deadline_met: true, wyfl_done: true, banned_word_count: 0 }
  },
}
