// src/mocks/handlers/hr-culture.ts
import { http, HttpResponse } from 'msw'
import {
  getCurrentMockUserId, getCurrentMockPerson,
  unauthorized, forbidden, notFound, badRequest,
} from '../config'
import {
  MOCK_STORIES, MOCK_CHALLENGES, MOCK_CHALLENGE_RESPONSES,
  MOCK_LESSONS, MOCK_JOURNEY_MILESTONES, MOCK_BEHAVIOR_SCORES,
  MOCK_TEAM_HEALTH, MOCK_TEAM_HEALTH_INSIGHTS,
} from '../data/hr-culture'

export const hrCultureHandlers = [

  http.get('*/api/hr/culture/stories', async ({ request }) => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    const url = new URL(request.url)
    const page  = Number(url.searchParams.get('page')  ?? '1')
    const limit = Number(url.searchParams.get('limit') ?? '20')
    const paged = MOCK_STORIES.slice((page - 1) * limit, page * limit)
    return HttpResponse.json({ data: paged, meta: { page, limit, total: MOCK_STORIES.length } })
  }),

  http.post('*/api/hr/culture/stories', async ({ request }) => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    const body = await request.json() as Record<string, any>
    const errors: string[] = []
    if (!body.content) errors.push('content should not be empty')
    if (body.content && body.content.length < 20) errors.push('content must be at least 20 characters')
    if (errors.length) return badRequest(errors)
    const created = {
      id: crypto.randomUUID(),
      // true_author_person_id stored in DB but NOT in API response
      content: body.content,
      is_anonymous: body.is_anonymous ?? true,
      reactions_count: {},
      created_at: new Date().toISOString(),
    }
    MOCK_STORIES.unshift(created)
    return HttpResponse.json({ data: created }, { status: 201 })
  }),

  http.post('*/api/hr/culture/stories/:id/reactions', async ({ params, request }) => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    const body = await request.json() as Record<string, string>
    if (!body.reaction_type) return badRequest(['reaction_type should not be empty'])
    const story = MOCK_STORIES.find(s => s.id === params.id)
    if (!story) return notFound('Story not found')
    story.reactions_count[body.reaction_type] = (story.reactions_count[body.reaction_type] ?? 0) + 1
    return HttpResponse.json({ data: { reactions_count: story.reactions_count } })
  }),

  http.post('*/api/hr/culture/stories/:id/reports', async ({ params, request }) => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    const body = await request.json() as Record<string, string>
    if (!body.reason) return badRequest(['reason should not be empty'])
    const story = MOCK_STORIES.find(s => s.id === params.id)
    if (!story) return notFound('Story not found')
    const created = {
      id: crypto.randomUUID(),
      story_id: params.id as string,
      reported_by: personId,
      reason: body.reason,
      status: 'pending',
      created_at: new Date().toISOString(),
    }
    return HttpResponse.json({ data: created }, { status: 201 })
  }),

  http.get('*/api/hr/culture/challenges', async () => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    return HttpResponse.json({ data: MOCK_CHALLENGES })
  }),

  http.post('*/api/hr/culture/challenge-responses', async ({ request }) => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    const body = await request.json() as Record<string, string>
    const errors: string[] = []
    if (!body.challenge_id) errors.push('challenge_id should not be empty')
    if (!body.response_content) errors.push('response_content should not be empty')
    if (errors.length) return badRequest(errors)
    const alreadyClaimed = (MOCK_CHALLENGE_RESPONSES[personId] ?? []).some(r => r.challenge_id === body.challenge_id)
    if (alreadyClaimed) {
      return HttpResponse.json(
        { statusCode: 422, message: 'Bạn đã tham gia challenge này rồi', error: 'Unprocessable Entity', code: 'HR_CHALLENGE_ALREADY_CLAIMED' },
        { status: 422 },
      )
    }
    const challenge = MOCK_CHALLENGES.find(c => c.id === body.challenge_id)
    const created = {
      id: crypto.randomUUID(),
      person_id: personId,
      challenge_id: body.challenge_id,
      xp_earned: (challenge as any)?.xp_reward ?? 0,
      ai_score: Math.floor(Math.random() * 30) + 65,
      ai_feedback: 'Phản hồi đầy đủ và thực tế.',
      status: 'evaluated',
      created_at: new Date().toISOString(),
    }
    ;(MOCK_CHALLENGE_RESPONSES[personId] ??= []).push(created)
    return HttpResponse.json({ data: created }, { status: 201 })
  }),

  http.get('*/api/hr/culture/lessons', async () => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    return HttpResponse.json({ data: MOCK_LESSONS })
  }),

  http.get('*/api/hr/culture/journey/me', async () => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    const milestones = MOCK_JOURNEY_MILESTONES[personId] ?? []
    const total_xp = milestones.reduce((sum, m) => sum + m.xp_earned, 0)
    return HttpResponse.json({ data: { person_id: personId, total_xp, milestones } })
  }),

  http.get('*/api/hr/culture/behavior-scores/me', async () => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    return HttpResponse.json({ data: MOCK_BEHAVIOR_SCORES[personId] ?? [] })
  }),

  http.get('*/api/hr/culture/team-health', async () => {
    const person = await getCurrentMockPerson()
    if (!person) return unauthorized()
    if (!person.roles.includes('hr_manager')) return forbidden('HR Manager only')
    return HttpResponse.json({ data: MOCK_TEAM_HEALTH })
  }),

  http.post('*/api/hr/culture/team-health/:id/ai-analysis', async ({ params }) => {
    const person = await getCurrentMockPerson()
    if (!person) return unauthorized()
    if (!person.roles.includes('hr_manager')) return forbidden('HR Manager only')
    const teamHealth = MOCK_TEAM_HEALTH.find(t => t.id === params.id)
    if (!teamHealth) return notFound('Team health record not found')
    const insights = MOCK_TEAM_HEALTH_INSIGHTS[params.id as string] ?? []
    const lastInsight = insights[insights.length - 1]
    if (lastInsight) {
      const cooldownMs = 60 * 60 * 1000
      if (Date.now() - new Date(lastInsight.generated_at).getTime() < cooldownMs) {
        return HttpResponse.json(
          { statusCode: 429, message: 'AI analysis cooldown 1 giờ', error: 'Too Many Requests', code: 'HR_AI_ANALYSIS_RATE_LIMITED' },
          { status: 429 },
        )
      }
    }
    const newInsight = {
      id: crypto.randomUUID(),
      team_health_id: params.id as string,
      analysis_text: `[AI] Team ${(teamHealth as any).team_name}: Engagement ${(teamHealth as any).engagement_score}/100. Khuyến nghị: tăng 1:1 meeting.`,
      generated_at: new Date().toISOString(),
    }
    ;(MOCK_TEAM_HEALTH_INSIGHTS[params.id as string] ??= []).push(newInsight)
    return HttpResponse.json({ data: newInsight }, { status: 201 })
  }),
]
