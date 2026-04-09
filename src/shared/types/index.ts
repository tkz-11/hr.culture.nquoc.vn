// ──────────────────────────────────────────────
// NhiLe HR Culture · Shared TypeScript Interfaces
// NL-CLAUDE-HR-001 v1.0
// ──────────────────────────────────────────────

export type UserRole = 'hr_manager' | 'leader' | 'member';

export type RiskLevel = 'none' | 'low' | 'medium' | 'high';
export type AssignmentStatus = 'none' | 'talking' | 'stuck' | 'resolved';
export type CoachingType = 'monitor' | 'coaching';
export type CoachingStatus = 'pending' | 'scheduled' | 'completed' | 'cancelled';

export type PatternType = 'direct' | 'vague' | 'silent' | 'face-saving';
export type ScenarioGroup = 'A' | 'B' | 'C';

export type OrgLayer = 'department' | 'team' | 'sub-team';
export type ExperienceType =
  | 'judgement'
  | 'communication'
  | 'execution'
  | 'priority'
  | 'late_ask'
  | 'overstepping';
export type CourageLevel = 'small' | 'big' | 'breakthrough';
export type SupportType = 'many' | 'enough' | 'late' | 'none';
export type ChallengeType = 'weekly' | 'daily';
export type JourneyMilestone = '1m' | '3m' | '6m' | '1y' | 'out';

// ── Auth ──
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
}

// ── Module 1 · HR Retention Radar ──
export interface HRMember {
  id: string;
  user_id: string;
  team_id: string;
  join_date: string;
  risk_level: RiskLevel;
  days_in_team: number;
  active: boolean;
  created_at: string;
  user?: { name: string; avatar_url?: string };
  team?: { name: string };
  current_assignment?: LeaderAssignment;
}

export interface LeaderAssignment {
  id: string;
  member_id: string;
  leader_id: string;
  status: AssignmentStatus;
  stuck_since?: string;
  notes?: string;
  assigned_at: string;
  resolved_at?: string;
  leader?: { name: string };
}

export interface Intervention {
  id: string;
  member_id: string;
  hr_manager_id: string;
  intervene_date: string;
  action_taken: string;
  resolved_at?: string;
  created_at: string;
}

export interface LeaderMetrics {
  id: string;
  leader_id: string;
  team_size: number;
  turnover_rate_3m?: number;
  engage_score?: number;
  period_start: string;
  leader?: { name: string };
  team?: { name: string };
}

export interface CoachingRequest {
  id: string;
  leader_id: string;
  requested_by: string;
  type: CoachingType;
  status: CoachingStatus;
  scheduled_at?: string;
  created_at: string;
}

export interface RiskLog {
  id: string;
  member_id: string;
  risk_level: RiskLevel;
  reason?: string;
  checkpoint_day?: 30 | 60 | 90;
  logged_at: string;
}

export interface RetentionDashboard {
  total_members: number;
  high_risk: number;
  stuck_count: number;
  checkpoints_due: number;
  recent_alerts: Array<{
    member_name: string;
    risk_level: RiskLevel;
    type: string;
    days_ago: number;
  }>;
}

// ── Module 2 · Communication Passport ──
export interface PassportProfile {
  id: string;
  user_id: string;
  culture_xp: number;
  streak_days: number;
  directness_score: number;
  last_active_date?: string;
  updated_at: string;
}

export interface PatternDetected {
  type: PatternType;
  snippet: string;
  xp_delta: number;
}

export interface CommSession {
  id: string;
  user_id: string;
  input_text: string;
  patterns_detected: PatternDetected[];
  rating: PatternType;
  xp_delta: number;
  created_at: string;
}

export interface ScenarioResponse {
  id: string;
  user_id: string;
  scenario_group: ScenarioGroup;
  prompt: string;
  response: string;
  rating: PatternType;
  xp_delta: number;
  rewrite?: string;
  created_at: string;
}

export interface CommHeatmapEntry {
  date: string;
  deadline_met?: boolean;
  wyfl_done?: boolean;
  banned_word_count: number;
}

export interface LeaderIntegrity {
  id: string;
  leader_id: string;
  feedback_timeliness: number;
  wyfl_compliance: number;
  language_standard: number;
  scenario_completion: number;
  directness: number;
  integrity_score: number;
  period: string;
}

export interface AnalyzeResult {
  rating: PatternType;
  xp_delta: number;
  patterns_detected: PatternDetected[];
  new_total_xp: number;
  streak_days: number;
  rewrite_suggestion?: string;
}

export interface RewriteResult {
  original: string;
  rewritten: string;
  rating: PatternType;
  xp_delta: number;
  patterns_detected: PatternDetected[];
}

// Scoring constants
export const PATTERN_KEYWORDS = {
  silent: ['không sao', 'bình thường', 'để sau', 'thôi được', 'kệ đi'],
  vague: ['sẽ cố', 'hy vọng', 'thử xem', 'có thể', 'để tính'],
  face_saving: ['kỳ cục lắm', 'ngại quá', 'sợ người ta nghĩ'],
} as const;

export const XP_DELTA: Record<PatternType, number> = {
  direct: 20,
  vague: 5,
  silent: -10,
  'face-saving': -5,
};

// ── Module 3 · NhiLe Culture OS ──
export interface OrgStructure {
  id: string;
  name: string;
  layer: OrgLayer;
  parent_id?: string;
  leader_id?: string;
  co_leader_id?: string;
  color?: string;
  active: boolean;
}

export interface CultureStory {
  id: string;
  user_id: string;
  team_id: string;
  experience_type: ExperienceType;
  courage_level: CourageLevel;
  content: string;
  support_type?: SupportType;
  is_public: boolean;
  created_at: string;
  user?: { name: string; avatar_url?: string };
  team?: { name: string };
}

export interface Challenge {
  id: string;
  type: ChallengeType;
  text: string;
  points: number;
  active_from: string;
  active_until: string;
  my_response?: ChallengeResponse;
}

export interface ChallengeResponse {
  id: string;
  user_id: string;
  challenge_id: string;
  proof_text: string;
  ai_approved?: boolean;
  awarded_points: number;
  ai_feedback?: string;
  ai_reason?: string;
  created_at: string;
}

export interface BehaviorScores {
  try_score: number;
  share_score: number;
  learn_score: number;
  help_score: number;
  streak: number;
  total_xp: number;
  week_of: string;
}

export interface TeamHealth {
  team_id: string;
  health_index: number;
  support_rate: number;
  avg_scores_json: {
    try?: number;
    share?: number;
    learn?: number;
    help?: number;
    insights?: string;
  };
  period: string;
  analyzed_at: string;
  team_name?: string;
  member_count?: number;
}

export interface JourneyMilestoneRecord {
  id: string;
  user_id: string;
  milestone: JourneyMilestone;
  completed_at: string;
  recap_note?: string;
  scores_snapshot: Partial<BehaviorScores>;
}

export interface TeamAnalysis {
  insights: string;
  patterns: string[];
  recommendations: string[];
  analyzed_at: string;
}

// ── API Response wrappers ──
export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}
export interface ApiError {
  success: false;
  error: { message: string; code: string };
}
export interface ApiPaginated<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
export interface ApiCursorPaginated<T> {
  success: true;
  items: T[];
  meta: { next_cursor?: string; has_next: boolean };
}
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
