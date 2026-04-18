export interface HrStory {
  id: string
  content: string
  is_anonymous: boolean
  reactions_count: Record<string, number>
  created_at: string
}

export interface HrChallenge {
  id: string
  title: string
  description: string
  xp_reward: number
  deadline?: string
  is_completed: boolean
}

export interface HrChallengeResponse {
  id: string
  person_id: string
  challenge_id: string
  xp_earned: number
  ai_score?: number
  ai_feedback?: string
  status: 'pending_eval' | 'evaluated'
  created_at: string
}

export interface HrLesson {
  id: string
  title: string
  description: string
  category: string
  duration_minutes: number
  is_completed: boolean
}

export interface HrTeamHealthInsight {
  id: string
  team_health_id: string
  analysis_text: string
  generated_at: string
}
