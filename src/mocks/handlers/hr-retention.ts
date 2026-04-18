// src/mocks/handlers/hr-retention.ts
import { http, HttpResponse } from 'msw'
import {
  getCurrentMockPerson,
  unauthorized, forbidden, notFound, badRequest,
} from '../config'
import {
  MOCK_RETENTION_DASHBOARD,
  MOCK_MEMBERS_RISK,
  MOCK_INTERVENTIONS,
  MOCK_COACHING_REQUESTS,
} from '../data/hr-retention'

export const hrRetentionHandlers = [

  http.get('*/api/hr/retention/dashboard', async () => {
    const person = await getCurrentMockPerson()
    if (!person) return unauthorized()
    if (!person.roles.includes('hr_manager')) return forbidden('HR Manager only')
    return HttpResponse.json({ data: MOCK_RETENTION_DASHBOARD })
  }),

  http.get('*/api/hr/retention/members', async ({ request }) => {
    const person = await getCurrentMockPerson()
    if (!person) return unauthorized()
    if (!['hr_manager', 'leader'].includes(person.primary_role)) {
      return forbidden('HR Manager or Leader only')
    }
    const url = new URL(request.url)
    const risk_level = url.searchParams.get('risk_level')
    const team = url.searchParams.get('team')
    const page  = Number(url.searchParams.get('page')  ?? '1')
    const limit = Number(url.searchParams.get('limit') ?? '20')
    let items = [...MOCK_MEMBERS_RISK]
    if (person.primary_role === 'leader') items = items.filter(m => m.role === 'member')
    if (risk_level) items = items.filter(m => m.risk_level === risk_level)
    if (team) items = items.filter(m => m.team === team)
    const paged = items.slice((page - 1) * limit, page * limit)
    return HttpResponse.json({ data: paged, meta: { page, limit, total: items.length } })
  }),

  http.get('*/api/hr/retention/members/:person_id/on-track', async ({ params }) => {
    const person = await getCurrentMockPerson()
    if (!person) return unauthorized()
    if (!['hr_manager', 'leader'].includes(person.primary_role)) {
      return forbidden('HR Manager or Leader only')
    }
    const member = MOCK_MEMBERS_RISK.find(m => m.person_id === params.person_id)
    if (!member) return notFound('Member not found')
    return HttpResponse.json({ data: member })
  }),

  http.post('*/api/hr/retention/interventions', async ({ request }) => {
    const person = await getCurrentMockPerson()
    if (!person) return unauthorized()
    if (!person.roles.includes('hr_manager')) return forbidden('HR Manager only')
    const body = await request.json() as Record<string, unknown>
    const errors: string[] = []
    if (!body.person_id) errors.push('person_id should not be empty')
    if (!body.type) errors.push('type should not be empty')
    if (!body.notes) errors.push('notes should not be empty')
    if (errors.length) return badRequest(errors)
    const now = new Date().toISOString()
    const created = { id: crypto.randomUUID(), ...body, intervened_by: person.id, occurred_at: now, created_at: now }
    MOCK_INTERVENTIONS.push(created as any)
    return HttpResponse.json({ data: created }, { status: 201 })
  }),

  http.get('*/api/hr/retention/leaders', async () => {
    const person = await getCurrentMockPerson()
    if (!person) return unauthorized()
    if (!person.roles.includes('hr_manager')) return forbidden('HR Manager only')
    return HttpResponse.json({ data: MOCK_MEMBERS_RISK.filter(m => m.role === 'leader') })
  }),

  http.get('*/api/hr/retention/coaching-requests', async ({ request }) => {
    const person = await getCurrentMockPerson()
    if (!person) return unauthorized()
    if (!person.roles.includes('hr_manager')) return forbidden('HR Manager only')
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    let items = [...MOCK_COACHING_REQUESTS]
    if (status) items = items.filter(r => r.status === status)
    return HttpResponse.json({ data: items })
  }),
]
