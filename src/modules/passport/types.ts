export interface HrPassportProfile {
  person_id: string
  overall_score: number
  dimension_scores: Record<string, number>
  sessions_count: number
  streak_days: number
  last_session_at?: string
}

export interface HrCommSession {
  id: string
  person_id: string
  style: string
  score: number
  ai_feedback: string
  created_at: string
}

export interface HrScenario {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
}
