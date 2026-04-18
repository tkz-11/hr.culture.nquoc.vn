// src/mocks/data/hr-passport.ts
import { MOCK_PERSONS } from './persons'

export const MOCK_PASSPORT_PROFILES: Record<string, any> = {
  [MOCK_PERSONS[0].id]: {
    person_id: MOCK_PERSONS[0].id,
    overall_score: 82,
    dimension_scores: { empathy: 85, clarity: 78, leadership: 84 },
    sessions_count: 24,
    streak_days: 7,
    last_session_at: '2026-04-17T09:00:00.000Z',
  },
  [MOCK_PERSONS[1].id]: {
    person_id: MOCK_PERSONS[1].id,
    overall_score: 71,
    dimension_scores: { empathy: 72, clarity: 68, leadership: 74 },
    sessions_count: 15,
    streak_days: 3,
    last_session_at: '2026-04-16T10:00:00.000Z',
  },
  [MOCK_PERSONS[2].id]: {
    person_id: MOCK_PERSONS[2].id,
    overall_score: 45,
    dimension_scores: { empathy: 40, clarity: 50, leadership: 45 },
    sessions_count: 4,
    streak_days: 0,
  },
}

export const MOCK_TODAY_PROMPT = {
  id: 'prompt-0001-4000-8000-000000000001',
  prompt_date: '2026-04-18',
  content: 'Khi đồng nghiệp chia sẻ khó khăn, bạn phản hồi như thế nào?',
  category: 'empathy',
  created_at: '2026-04-18T00:00:00.000Z',
}

export const MOCK_RECENT_PROMPTS = [
  MOCK_TODAY_PROMPT,
  {
    id: 'prompt-0002-4000-8000-000000000002',
    prompt_date: '2026-04-17',
    content: 'Bạn trình bày ý kiến phản bác như thế nào trong cuộc họp?',
    category: 'assertive',
    created_at: '2026-04-17T00:00:00.000Z',
  },
  {
    id: 'prompt-0003-4000-8000-000000000003',
    prompt_date: '2026-04-16',
    content: 'Mô tả cách bạn giao việc cho thành viên team.',
    category: 'leadership',
    created_at: '2026-04-16T00:00:00.000Z',
  },
]

export const MOCK_COMM_SESSIONS: Record<string, any[]> = {
  [MOCK_PERSONS[0].id]: [
    {
      id: 'session-001-4000-8000-000000000001',
      person_id: MOCK_PERSONS[0].id,
      style: 'empathetic',
      score: 88,
      ai_feedback: 'Ngôn ngữ ấm áp, thể hiện sự quan tâm rõ ràng.',
      created_at: '2026-04-17T09:00:00.000Z',
    },
    {
      id: 'session-002-4000-8000-000000000002',
      person_id: MOCK_PERSONS[0].id,
      style: 'coaching',
      score: 79,
      ai_feedback: 'Câu hỏi mở tốt, cần thêm lắng nghe tích cực.',
      created_at: '2026-04-15T10:00:00.000Z',
    },
  ],
  [MOCK_PERSONS[1].id]: [
    {
      id: 'session-003-4000-8000-000000000003',
      person_id: MOCK_PERSONS[1].id,
      style: 'direct',
      score: 70,
      ai_feedback: 'Rõ ràng nhưng cần thêm sự đồng cảm.',
      created_at: '2026-04-16T10:00:00.000Z',
    },
  ],
  [MOCK_PERSONS[2].id]: [],
}

export const MOCK_SCENARIOS = [
  { id: 'scenario-001-4000-8000-000000000001', title: 'Xử lý xung đột trong team', description: 'Hai thành viên mâu thuẫn về cách tiếp cận dự án...', difficulty: 'medium', category: 'conflict_resolution' },
  { id: 'scenario-002-4000-8000-000000000002', title: 'Phản hồi kết quả thấp', description: 'Thành viên team liên tục không đạt KPI tháng thứ 2...', difficulty: 'hard', category: 'performance_feedback' },
  { id: 'scenario-003-4000-8000-000000000003', title: 'Chào đón thành viên mới', description: 'Thành viên mới gia nhập team sau kỳ tuyển dụng...', difficulty: 'easy', category: 'onboarding' },
]

export const MOCK_SCENARIO_RESPONSES: Record<string, any[]> = {
  [MOCK_PERSONS[0].id]: [
    { id: 'scenresp-001-4000-8000-000000000001', person_id: MOCK_PERSONS[0].id, scenario_id: 'scenario-001-4000-8000-000000000001', score: 85, ai_feedback: 'Cách xử lý trung lập, hướng về giải pháp tốt.', created_at: '2026-04-14T09:00:00.000Z' },
  ],
  [MOCK_PERSONS[1].id]: [],
  [MOCK_PERSONS[2].id]: [],
}

export const MOCK_LEADER_INTEGRITY = {
  person_id: MOCK_PERSONS[1].id,
  integrity_score: 74,
  dimensions: { transparency: 78, consistency: 70, empathy: 75 },
  last_updated_at: '2026-04-15T00:00:00.000Z',
}

export const MOCK_HR_COMM_DASHBOARD = {
  avg_score: 68,
  sessions_this_week: 47,
  top_performers: [{ person_id: MOCK_PERSONS[0].id, full_name: MOCK_PERSONS[0].full_name, score: 88 }],
  needs_attention: [{ person_id: MOCK_PERSONS[2].id, full_name: MOCK_PERSONS[2].full_name, score: 28 }],
}

export const MOCK_MEMBERS_NEEDING_SUPPORT = [
  { person_id: MOCK_PERSONS[2].id, full_name: MOCK_PERSONS[2].full_name, reason: 'Chưa có session nào trong 2 tuần' },
]
