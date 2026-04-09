import { http, HttpResponse } from 'msw'
import type { PassportProfile, CommHeatmapEntry, CommSession, AnalyzeResult, RewriteResult } from '../../shared/types'

const BASE = 'https://api.nquoc.vn'

const mockProfile: PassportProfile = {
  id: 'pp1', user_id: 'dev-user-id',
  culture_xp: 340, streak_days: 7, directness_score: 6.8,
  last_active_date: new Date().toISOString().split('T')[0],
  updated_at: new Date().toISOString(),
}

// Generate 14 ngày heatmap
const heatmap: CommHeatmapEntry[] = Array.from({ length: 14 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() - (13 - i))
  return {
    date: d.toISOString().split('T')[0],
    deadline_met: Math.random() > 0.3,
    wyfl_done: Math.random() > 0.4,
    banned_word_count: Math.floor(Math.random() * 4),
  }
})

const mockSessions: CommSession[] = [
  {
    id: 's1', user_id: 'dev-user-id',
    input_text: 'Tôi sẽ cố hoàn thành trước thứ 6.',
    patterns_detected: [{ type: 'vague', snippet: 'sẽ cố', xp_delta: 5 }],
    rating: 'vague', xp_delta: 5, created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 's2', user_id: 'dev-user-id',
    input_text: 'Tôi sẽ gửi báo cáo vào 17h thứ 5 tuần này.',
    patterns_detected: [{ type: 'direct', snippet: 'gửi báo cáo vào 17h thứ 5 tuần này', xp_delta: 20 }],
    rating: 'direct', xp_delta: 20, created_at: new Date().toISOString(),
  },
]

export const passportHandlers = [
  http.get(`${BASE}/api/hr/passport/me`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        profile: mockProfile,
        heatmap,
        recent_sessions: mockSessions,
        scenarios_done: 5,
      },
    })
  }),

  http.post(`${BASE}/api/hr/passport/analyze`, async ({ request }) => {
    const body = await request.json() as { text: string }
    const text = body.text.toLowerCase()

    // Simple pattern detection
    const silentWords = ['không sao', 'bình thường', 'để sau', 'thôi được', 'kệ đi']
    const vagueWords = ['sẽ cố', 'hy vọng', 'thử xem', 'có thể', 'để tính']

    const detected = []
    for (const w of silentWords) {
      if (text.includes(w)) detected.push({ type: 'silent' as const, snippet: w, xp_delta: -10 })
    }
    for (const w of vagueWords) {
      if (text.includes(w)) detected.push({ type: 'vague' as const, snippet: w, xp_delta: 5 })
    }

    const rating = detected.length === 0 ? 'direct' : detected[0].type
    const xp_delta = rating === 'direct' ? 20 : detected[0]?.xp_delta ?? 0

    const result: AnalyzeResult = {
      rating,
      xp_delta,
      patterns_detected: detected,
      new_total_xp: mockProfile.culture_xp + xp_delta,
      streak_days: mockProfile.streak_days,
      rewrite_suggestion:
        rating !== 'direct'
          ? 'Hãy thử nói rõ thời hạn cụ thể: "Tôi sẽ gửi vào [ngày/giờ cụ thể]."'
          : undefined,
    }
    return HttpResponse.json({ success: true, data: result })
  }),

  http.post(`${BASE}/api/hr/passport/rewrite`, async ({ request }) => {
    const body = await request.json() as { text: string }
    const result: RewriteResult = {
      original: body.text,
      rewritten: body.text
        .replace(/sẽ cố/gi, 'sẽ hoàn thành')
        .replace(/thử xem/gi, 'sẽ thực hiện')
        .replace(/hy vọng/gi, 'cam kết')
        .replace(/có thể/gi, 'chắc chắn')
        + ' — vào [ngày/giờ cụ thể].',
      rating: 'vague',
      xp_delta: 5,
      patterns_detected: [],
    }
    return HttpResponse.json({ success: true, data: result })
  }),

  http.post(`${BASE}/api/hr/passport/scenarios/submit`, async ({ request }) => {
    const body = await request.json() as { response: string }
    const text = body.response.toLowerCase()
    const isVague = ['sẽ cố', 'hy vọng', 'có thể'].some((w) => text.includes(w))
    return HttpResponse.json({
      success: true,
      data: {
        rating: isVague ? 'vague' : 'direct',
        xp_delta: isVague ? 5 : 20,
        rewrite: isVague ? 'Hãy thêm ngày/giờ cụ thể vào cam kết của bạn.' : null,
        feedback_message: isVague
          ? 'Câu trả lời còn mơ hồ. Thêm thời hạn và hành động cụ thể hơn.'
          : 'Tốt lắm! Câu trả lời rõ ràng và có thể đo lường được.',
      },
    })
  }),

  http.get(`${BASE}/api/hr/passport/leader/:id`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        integrity: {
          id: 'li1', leader_id: 'l1',
          feedback_timeliness: 7.5, wyfl_compliance: 8.0,
          language_standard: 6.5, scenario_completion: 9.0, directness: 7.0,
          integrity_score: 7.6,
          period: '2026-04-01',
        },
        vague_phrases_this_week: ['sẽ cố gắng', 'hy vọng xong sớm', 'để tính'],
        improvement_suggestions: [
          'Đặt deadline cụ thể khi giao task cho team.',
          'Tránh dùng "sẽ cố" — thay bằng ngày/giờ cam kết.',
        ],
      },
    })
  }),

  http.get(`${BASE}/api/hr/passport/dashboard`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        avg_directness_score: 6.8,
        banned_word_pct: 23,
        weekly_trend: [
          { week: '2026-03-24', avg_score: 6.2 },
          { week: '2026-03-31', avg_score: 6.5 },
          { week: '2026-04-07', avg_score: 6.8 },
        ],
        members_needing_attention: [
          { user_id: 'u5', name: 'Trần Văn C', directness_score: 3.2, trend: 'down' },
          { user_id: 'u6', name: 'Nguyễn Thị D', directness_score: 4.0, trend: 'flat' },
        ],
      },
    })
  }),

  http.post(`${BASE}/api/hr/passport/heatmap/log`, async ({ request }) => {
    const body = await request.json() as CommHeatmapEntry
    return HttpResponse.json({ success: true, data: body })
  }),
]
