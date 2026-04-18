// src/mocks/handlers/hr-passport.ts
import { http, HttpResponse } from 'msw'
import {
  getCurrentMockUserId, getCurrentMockPerson,
  unauthorized, forbidden, notFound, badRequest,
} from '../config'
import {
  MOCK_PASSPORT_PROFILES, MOCK_TODAY_PROMPT, MOCK_RECENT_PROMPTS,
  MOCK_COMM_SESSIONS, MOCK_SCENARIOS, MOCK_SCENARIO_RESPONSES,
  MOCK_LEADER_INTEGRITY, MOCK_HR_COMM_DASHBOARD, MOCK_MEMBERS_NEEDING_SUPPORT,
} from '../data/hr-passport'

export const hrPassportHandlers = [

  http.get('*/api/hr/passport/me', async () => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    return HttpResponse.json({ data: MOCK_PASSPORT_PROFILES[personId] ?? null })
  }),

  http.get('*/api/hr/passport/prompts/today', async () => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    return HttpResponse.json({ data: MOCK_TODAY_PROMPT })
  }),

  http.get('*/api/hr/passport/prompts/recent', async () => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    return HttpResponse.json({ data: MOCK_RECENT_PROMPTS })
  }),

  http.get('*/api/hr/passport/heatmap', async () => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    const dates: string[] = []
    const scores: number[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date('2026-04-18')
      d.setDate(d.getDate() - i)
      dates.push(d.toISOString().split('T')[0])
      scores.push(Math.random() > 0.4 ? Math.floor(Math.random() * 40) + 55 : 0)
    }
    return HttpResponse.json({ data: { dates, scores } })
  }),

  http.get('*/api/hr/passport/comm-sessions', async ({ request }) => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    const url = new URL(request.url)
    const page  = Number(url.searchParams.get('page')  ?? '1')
    const limit = Number(url.searchParams.get('limit') ?? '20')
    const items = MOCK_COMM_SESSIONS[personId] ?? []
    const paged = items.slice((page - 1) * limit, page * limit)
    return HttpResponse.json({ data: paged, meta: { page, limit, total: items.length } })
  }),

  http.post('*/api/hr/passport/comm-sessions', async ({ request }) => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    const body = await request.json() as Record<string, string>
    const errors: string[] = []
    if (!body.input_text) errors.push('input_text should not be empty')
    if (!body.style) errors.push('style should not be empty')
    if (errors.length) return badRequest(errors)
    const now = new Date().toISOString()
    const created = {
      id: crypto.randomUUID(),
      person_id: personId,
      style: body.style,
      rewritten_text: `[AI rewrite] ${body.input_text.slice(0, 60)}... (${body.style} mode)`,
      score: Math.floor(Math.random() * 30) + 65,
      ai_feedback: 'Ngôn ngữ rõ ràng, thể hiện sự quan tâm.',
      created_at: now,
    }
    ;(MOCK_COMM_SESSIONS[personId] ??= []).unshift(created)
    return HttpResponse.json({ data: created }, { status: 201 })
  }),

  http.delete('*/api/hr/passport/comm-sessions/:id', async ({ params }) => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    const list = MOCK_COMM_SESSIONS[personId] ?? []
    const idx = list.findIndex(s => s.id === params.id)
    if (idx < 0) return notFound('Session not found')
    if (list[idx].person_id !== personId) return forbidden('Not your session')
    list.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('*/api/hr/passport/scenarios', async () => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    return HttpResponse.json({ data: MOCK_SCENARIOS })
  }),

  http.post('*/api/hr/passport/scenario-responses', async ({ request }) => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    const body = await request.json() as Record<string, string>
    const errors: string[] = []
    if (!body.scenario_id) errors.push('scenario_id should not be empty')
    if (!body.response_text) errors.push('response_text should not be empty')
    if (errors.length) return badRequest(errors)
    const created = {
      id: crypto.randomUUID(),
      person_id: personId,
      scenario_id: body.scenario_id,
      score: Math.floor(Math.random() * 30) + 60,
      ai_feedback: 'Phản hồi tốt, thể hiện sự đồng cảm.',
      created_at: new Date().toISOString(),
    }
    ;(MOCK_SCENARIO_RESPONSES[personId] ??= []).push(created)
    return HttpResponse.json({ data: created }, { status: 201 })
  }),

  http.get('*/api/hr/passport/leader-integrity/me', async () => {
    const person = await getCurrentMockPerson()
    if (!person) return unauthorized()
    if (!['leader', 'hr_manager'].includes(person.primary_role)) {
      return forbidden('Leader or HR Manager only')
    }
    return HttpResponse.json({ data: MOCK_LEADER_INTEGRITY })
  }),

  http.get('*/api/hr/passport/hr-dashboard', async () => {
    const person = await getCurrentMockPerson()
    if (!person) return unauthorized()
    if (!person.roles.includes('hr_manager')) return forbidden('HR Manager only')
    return HttpResponse.json({ data: MOCK_HR_COMM_DASHBOARD })
  }),

  http.get('*/api/hr/passport/members-needing-support', async () => {
    const person = await getCurrentMockPerson()
    if (!person) return unauthorized()
    if (!person.roles.includes('hr_manager')) return forbidden('HR Manager only')
    return HttpResponse.json({ data: MOCK_MEMBERS_NEEDING_SUPPORT })
  }),
]
