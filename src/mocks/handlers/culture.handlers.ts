import { http, HttpResponse } from 'msw'
import type { Challenge, CultureStory, OrgStructure, BehaviorScores, JourneyMilestoneRecord, TeamHealth } from '../../shared/types'

const BASE = 'https://api.nquoc.vn'

const mockOrg: OrgStructure[] = [
  { id: 'o1', name: 'Điều hành', layer: 'department', color: '#6366f1', active: true },
  { id: 'o2', name: 'Admin', layer: 'department', color: '#64748b', active: true },
  { id: 'o3', name: 'Editor', layer: 'department', color: '#f59e0b', active: true },
  { id: 'o4', name: 'HR', layer: 'department', color: '#e53e3e', active: true },
  { id: 'o5', name: 'IT/Tech', layer: 'department', color: '#3b82f6', active: true },
  { id: 'o6', name: 'Social/Event', layer: 'department', color: '#10b981', active: true },
  { id: 'o7', name: 'Design', layer: 'department', color: '#8b5cf6', active: true },
  { id: 'o8', name: 'Academy (N-EDU)', layer: 'department', color: '#f43f5e', active: true },
  { id: 'o9', name: 'NhiLe SG', layer: 'department', color: '#0ea5e9', active: true },
]

const mockStories: CultureStory[] = [
  {
    id: 'st1', user_id: 'u1', team_id: 'o3',
    experience_type: 'communication', courage_level: 'big',
    content: 'Tuần này tôi đã mạnh dạn nói thẳng với leader về deadline không thực tế. Kết quả là cả team được điều chỉnh scope hợp lý hơn.',
    support_type: 'many', is_public: true,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    user: { name: 'Nguyễn Minh Anh' }, team: { name: 'Editor' },
  },
  {
    id: 'st2', user_id: 'u2', team_id: 'o7',
    experience_type: 'execution', courage_level: 'small',
    content: 'Lần đầu tôi dám hỏi lại khi không hiểu brief thay vì âm thầm làm sai. Tiết kiệm được cả ngày sửa.',
    support_type: 'enough', is_public: true,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    user: { name: 'Lê Thị Thu Hà' }, team: { name: 'Design' },
  },
  {
    id: 'st3', user_id: 'u3', team_id: 'o5',
    experience_type: 'judgement', courage_level: 'breakthrough',
    content: 'Tôi đề xuất thay đổi quy trình deploy và được leader chấp nhận sau khi trình bày data cụ thể. Lần đầu cảm thấy tiếng nói của mình có giá trị.',
    support_type: 'many', is_public: true,
    created_at: new Date().toISOString(),
    user: { name: 'Đinh Quốc Việt' }, team: { name: 'IT/Tech' },
  },
]

const mockChallenges: Challenge[] = [
  {
    id: 'ch1', type: 'weekly',
    text: 'Tuần này, hãy nói thẳng 1 điều bạn chưa hài lòng trong công việc với leader của mình. Ghi lại phản ứng và kết quả.',
    points: 50, active_from: '2026-04-07', active_until: '2026-04-13',
  },
  {
    id: 'ch2', type: 'daily',
    text: 'Hôm nay, khi nhận task, hãy hỏi rõ "Done" nghĩa là gì và deadline cụ thể là khi nào.',
    points: 10, active_from: '2026-04-09', active_until: '2026-04-09',
  },
  {
    id: 'ch3', type: 'daily',
    text: 'Viết 1 tin nhắn cam kết với deadline cụ thể (ngày/giờ) thay vì dùng "sẽ cố gắng".',
    points: 10, active_from: '2026-04-09', active_until: '2026-04-09',
  },
]

const mockBehaviorScores: BehaviorScores = {
  try_score: 7.5, share_score: 6.0, learn_score: 8.2, help_score: 7.0,
  streak: 12, total_xp: 580, week_of: '2026-04-07',
}

const mockMilestones: JourneyMilestoneRecord[] = [
  {
    id: 'jm1', user_id: 'dev-user-id', milestone: '1m',
    completed_at: '2026-02-15T00:00:00Z',
    recap_note: 'Hoàn thành tháng đầu tiên. Đã quen với quy trình làm việc.',
    scores_snapshot: { total_xp: 120, try_score: 6.0 },
  },
  {
    id: 'jm2', user_id: 'dev-user-id', milestone: '3m',
    completed_at: '2026-04-15T00:00:00Z',
    recap_note: 'Hoàn thành 3 tháng. Đã có đóng góp rõ ràng cho team.',
    scores_snapshot: { total_xp: 380, try_score: 7.2 },
  },
]

const mockTeamHealth: TeamHealth[] = [
  {
    team_id: 'o3', health_index: 72, support_rate: 85,
    avg_scores_json: { try: 7.2, share: 6.5, learn: 8.0, help: 7.8 },
    period: '2026-04-01', analyzed_at: new Date().toISOString(),
    team_name: 'Editor', member_count: 15,
  },
  {
    team_id: 'o7', health_index: 88, support_rate: 92,
    avg_scores_json: { try: 8.5, share: 7.8, learn: 8.2, help: 9.0 },
    period: '2026-04-01', analyzed_at: new Date().toISOString(),
    team_name: 'Design', member_count: 8,
  },
  {
    team_id: 'o5', health_index: 65, support_rate: 70,
    avg_scores_json: { try: 6.8, share: 5.5, learn: 7.5, help: 6.2 },
    period: '2026-04-01', analyzed_at: new Date().toISOString(),
    team_name: 'IT/Tech', member_count: 20,
  },
]

export const cultureHandlers = [
  http.get(`${BASE}/api/hr/culture/org`, () => {
    return HttpResponse.json({ success: true, data: mockOrg })
  }),

  http.get(`${BASE}/api/hr/culture/feed`, () => {
    return HttpResponse.json({
      success: true,
      items: mockStories,
      meta: { has_next: false },
    })
  }),

  http.get(`${BASE}/api/hr/culture/challenges`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        weekly: mockChallenges[0],
        daily: mockChallenges.slice(1),
      },
    })
  }),

  http.post(`${BASE}/api/hr/culture/challenges/submit`, async ({ request }) => {
    const body = await request.json() as { proof_text: string }
    const approved = body.proof_text.length > 80
    return HttpResponse.json({
      success: true,
      data: {
        approved,
        awarded_points: approved ? 50 : 0,
        ai_feedback: approved
          ? 'Bằng chứng rõ ràng và có hành động cụ thể. Xuất sắc!'
          : 'Cần mô tả hành động cụ thể hơn, có thể đo lường được.',
        ai_reason: approved ? 'Đạt tiêu chí hành động + kết quả' : 'Chưa có bằng chứng hành động cụ thể',
      },
    })
  }),

  http.get(`${BASE}/api/hr/culture/stories`, () => {
    return HttpResponse.json({ success: true, data: mockStories })
  }),

  http.post(`${BASE}/api/hr/culture/stories`, async ({ request }) => {
    const body = await request.json() as Partial<CultureStory>
    const story: CultureStory = {
      id: Math.random().toString(36).slice(2),
      user_id: 'dev-user-id',
      team_id: body.team_id ?? 'o1',
      experience_type: body.experience_type ?? 'communication',
      courage_level: body.courage_level ?? 'small',
      content: body.content ?? '',
      support_type: body.support_type,
      is_public: body.is_public ?? false,
      created_at: new Date().toISOString(),
      user: { name: 'Bạn' },
    }
    return HttpResponse.json({ success: true, data: story })
  }),

  http.get(`${BASE}/api/hr/culture/lessons`, () => {
    return HttpResponse.json({ success: true, data: mockStories.filter((s) => s.is_public) })
  }),

  http.get(`${BASE}/api/hr/culture/journey/me`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        milestones: mockMilestones,
        current_scores: mockBehaviorScores,
        radar_data: {
          try: mockBehaviorScores.try_score,
          share: mockBehaviorScores.share_score,
          learn: mockBehaviorScores.learn_score,
          help: mockBehaviorScores.help_score,
        },
      },
    })
  }),

  http.get(`${BASE}/api/hr/culture/journey/trend`, () => {
    const trend = Array.from({ length: 4 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (3 - i) * 7)
      return {
        week_of: d.toISOString().split('T')[0],
        try_score: 5 + Math.random() * 3,
        share_score: 4 + Math.random() * 4,
        learn_score: 6 + Math.random() * 3,
        help_score: 5 + Math.random() * 4,
      }
    })
    return HttpResponse.json({ success: true, data: trend })
  }),

  http.get(`${BASE}/api/hr/culture/team-health`, () => {
    return HttpResponse.json({ success: true, data: mockTeamHealth })
  }),

  http.post(`${BASE}/api/hr/culture/team-health/analyze`, async () => {
    await new Promise((r) => setTimeout(r, 1500)) // simulate AI delay
    return HttpResponse.json({
      success: true,
      data: {
        insights: 'Team đang có xu hướng giao tiếp cải thiện rõ rệt trong tháng qua. Tuy nhiên, tỷ lệ chia sẻ câu chuyện công khai vẫn còn thấp so với mục tiêu.',
        patterns: [
          'Thành viên mới (< 3 tháng) có xu hướng im lặng hơn khi gặp khó khăn',
          'Leader có số lần feedback đúng hạn cao → team có điểm giao tiếp tốt hơn',
          'Thử thách tuần được hoàn thành chủ yếu bởi nhóm senior',
        ],
        recommendations: [
          'Tổ chức 1-on-1 định kỳ với thành viên < 3 tháng để khuyến khích chia sẻ sớm',
          'Nhân rộng mô hình leader phản hồi đúng hạn ra toàn team',
          'Thiết kế thử thách daily dễ hơn để tăng participation rate của junior',
        ],
        analyzed_at: new Date().toISOString(),
      },
    })
  }),
]
