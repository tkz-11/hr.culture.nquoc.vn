// src/mocks/data/hr-culture.ts
import { MOCK_PERSONS } from './persons'

// ⚠️ true_author_person_id tồn tại ở DB nhưng KHÔNG export qua API — privacy P0
export const MOCK_STORIES: any[] = [
  { id: 'story-001-4000-8000-000000000001', content: 'Hôm nay team mình vượt qua thử thách khó. Tự hào vì mọi người đã cùng nhau giải quyết.', is_anonymous: true, reactions_count: { heart: 5, clap: 3 }, created_at: '2026-04-17T08:00:00.000Z' },
  { id: 'story-002-4000-8000-000000000002', content: 'Chia sẻ bài học sau buổi training kỹ năng giao tiếp tuần này.', is_anonymous: false, reactions_count: { heart: 2 }, created_at: '2026-04-16T10:00:00.000Z' },
  { id: 'story-003-4000-8000-000000000003', content: 'Cảm ơn mọi người đã hỗ trợ khi mình gặp khó khăn.', is_anonymous: true, reactions_count: { support: 8, heart: 4 }, created_at: '2026-04-15T14:00:00.000Z' },
]

export const MOCK_CHALLENGES = [
  { id: 'challenge-001-4000-8000-000000000001', title: 'Chia sẻ 1 bài học trong tuần', description: 'Chia sẻ bài học bạn học được trong tuần này với team.', xp_reward: 50, deadline: '2026-04-20T23:59:59.000Z', is_completed: false },
  { id: 'challenge-002-4000-8000-000000000002', title: 'Phản hồi tích cực cho đồng nghiệp', description: 'Gửi 1 lời phản hồi tích cực cho thành viên trong team.', xp_reward: 30, is_completed: true },
  { id: 'challenge-003-4000-8000-000000000003', title: 'Hoàn thành scenario training', description: 'Hoàn thành ít nhất 1 scenario trong Comm Passport tuần này.', xp_reward: 80, is_completed: false },
]

export const MOCK_CHALLENGE_RESPONSES: Record<string, any[]> = {
  [MOCK_PERSONS[0].id]: [
    { id: 'chalresp-001-4000-8000-000000000001', person_id: MOCK_PERSONS[0].id, challenge_id: 'challenge-002-4000-8000-000000000002', xp_earned: 30, ai_score: 88, ai_feedback: 'Phản hồi chân thành và cụ thể.', status: 'evaluated', created_at: '2026-04-15T09:00:00.000Z' },
  ],
  [MOCK_PERSONS[1].id]: [],
  [MOCK_PERSONS[2].id]: [],
}

export const MOCK_LESSONS = [
  { id: 'lesson-001-4000-8000-000000000001', title: 'Giao tiếp không bạo lực', description: 'Kỹ năng lắng nghe và biểu đạt nhu cầu.', category: 'communication', duration_minutes: 15, is_completed: true },
  { id: 'lesson-002-4000-8000-000000000002', title: 'Phản hồi hiệu quả', description: 'Cách đưa phản hồi xây dựng, không phán xét.', category: 'feedback', duration_minutes: 20, is_completed: false },
  { id: 'lesson-003-4000-8000-000000000003', title: 'Xây dựng trust trong team', description: 'Hành động nhỏ tạo sự tin tưởng lớn.', category: 'team_culture', duration_minutes: 12, is_completed: false },
]

export const MOCK_JOURNEY_MILESTONES: Record<string, any[]> = {
  [MOCK_PERSONS[0].id]: [
    { id: 'mile-001-4000-8000-000000000001', person_id: MOCK_PERSONS[0].id, title: 'Hoàn thành 10 rewrite sessions', xp_earned: 100, achieved_at: '2026-04-10T00:00:00.000Z' },
    { id: 'mile-002-4000-8000-000000000002', person_id: MOCK_PERSONS[0].id, title: 'Streak 7 ngày', xp_earned: 70, achieved_at: '2026-04-17T00:00:00.000Z' },
  ],
  [MOCK_PERSONS[1].id]: [
    { id: 'mile-003-4000-8000-000000000003', person_id: MOCK_PERSONS[1].id, title: 'Hoàn thành 5 rewrite sessions', xp_earned: 50, achieved_at: '2026-04-14T00:00:00.000Z' },
  ],
  [MOCK_PERSONS[2].id]: [],
}

export const MOCK_BEHAVIOR_SCORES: Record<string, any[]> = {
  [MOCK_PERSONS[0].id]: [
    { dimension: 'empathy',    score: 85, trend: 'up',     recorded_at: '2026-04-15T00:00:00.000Z' },
    { dimension: 'clarity',    score: 78, trend: 'stable', recorded_at: '2026-04-15T00:00:00.000Z' },
    { dimension: 'leadership', score: 84, trend: 'up',     recorded_at: '2026-04-15T00:00:00.000Z' },
  ],
  [MOCK_PERSONS[1].id]: [
    { dimension: 'empathy', score: 72, trend: 'stable', recorded_at: '2026-04-15T00:00:00.000Z' },
    { dimension: 'clarity', score: 68, trend: 'down',   recorded_at: '2026-04-15T00:00:00.000Z' },
  ],
  [MOCK_PERSONS[2].id]: [],
}

export const MOCK_TEAM_HEALTH = [
  { id: 'teamh-001-4000-8000-000000000001', team_id: 'org-0001-0000-0000-000000000001', team_name: 'Team Kinh Doanh', snapshot_date: '2026-04-14', engagement_score: 72, communication_score: 68, retention_risk_count: 2, created_at: '2026-04-14T00:00:00.000Z' },
  { id: 'teamh-002-4000-8000-000000000002', team_id: 'org-0001-0000-0000-000000000002', team_name: 'Team Vận Hành', snapshot_date: '2026-04-14', engagement_score: 81, communication_score: 79, retention_risk_count: 1, created_at: '2026-04-14T00:00:00.000Z' },
]

// append-only — never overwrite (C-03)
export const MOCK_TEAM_HEALTH_INSIGHTS: Record<string, any[]> = {
  'teamh-001-4000-8000-000000000001': [
    { id: 'insight-001-4000-8000-000000000001', team_health_id: 'teamh-001-4000-8000-000000000001', analysis_text: 'Team đang có dấu hiệu áp lực. Khuyến nghị: check-in cá nhân sớm.', generated_at: '2026-04-14T10:00:00.000Z' },
  ],
  'teamh-002-4000-8000-000000000002': [],
}
