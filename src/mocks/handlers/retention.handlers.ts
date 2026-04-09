import { http, HttpResponse } from 'msw'
import type { HRMember, RetentionDashboard, LeaderAssignment, Intervention, LeaderMetrics } from '../../shared/types'

const BASE = 'https://api.nquoc.vn'

const mockMembers: HRMember[] = [
  {
    id: '1', user_id: 'u1', team_id: 't1', join_date: '2024-01-15',
    risk_level: 'high', days_in_team: 85, active: true, created_at: new Date().toISOString(),
    user: { name: 'Nguyễn Minh Anh' }, team: { name: 'Editor' },
    current_assignment: {
      id: 'a1', member_id: '1', leader_id: 'l1', status: 'stuck',
      stuck_since: new Date(Date.now() - 8 * 86400000).toISOString(),
      assigned_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      created_at: new Date().toISOString(),
      leader: { name: 'Trần Văn Bình' },
    },
  },
  {
    id: '2', user_id: 'u2', team_id: 't2', join_date: '2024-02-01',
    risk_level: 'medium', days_in_team: 68, active: true, created_at: new Date().toISOString(),
    user: { name: 'Lê Thị Thu Hà' }, team: { name: 'Design' },
    current_assignment: {
      id: 'a2', member_id: '2', leader_id: 'l2', status: 'talking',
      assigned_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      created_at: new Date().toISOString(),
      leader: { name: 'Phạm Ngọc Lan' },
    },
  },
  {
    id: '3', user_id: 'u3', team_id: 't3', join_date: '2024-03-10',
    risk_level: 'low', days_in_team: 30, active: true, created_at: new Date().toISOString(),
    user: { name: 'Đinh Quốc Việt' }, team: { name: 'IT/Tech' },
    current_assignment: {
      id: 'a3', member_id: '3', leader_id: 'l3', status: 'none',
      assigned_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      created_at: new Date().toISOString(),
      leader: { name: 'Hoàng Minh Tuấn' },
    },
  },
  {
    id: '4', user_id: 'u4', team_id: 't1', join_date: '2024-01-20',
    risk_level: 'none', days_in_team: 80, active: true, created_at: new Date().toISOString(),
    user: { name: 'Vũ Thị Bảo Châu' }, team: { name: 'Editor' },
  },
]

const mockLeaderMetrics: LeaderMetrics[] = [
  {
    id: 'lm1', leader_id: 'l1', team_size: 8, turnover_rate_3m: 25,
    engage_score: 4.2, period_start: '2026-04-01',
    leader: { name: 'Trần Văn Bình' }, team: { name: 'Editor' },
  },
  {
    id: 'lm2', leader_id: 'l2', team_size: 5, turnover_rate_3m: 10,
    engage_score: 7.8, period_start: '2026-04-01',
    leader: { name: 'Phạm Ngọc Lan' }, team: { name: 'Design' },
  },
  {
    id: 'lm3', leader_id: 'l3', team_size: 12, turnover_rate_3m: 8,
    engage_score: 8.5, period_start: '2026-04-01',
    leader: { name: 'Hoàng Minh Tuấn' }, team: { name: 'IT/Tech' },
  },
]

export const retentionHandlers = [
  http.get(`${BASE}/api/hr/retention/dashboard`, () => {
    const dashboard: RetentionDashboard = {
      total_members: 130,
      high_risk: 12,
      stuck_count: 5,
      checkpoints_due: 8,
      recent_alerts: [
        { member_name: 'Nguyễn Minh Anh', risk_level: 'high', type: 'stuck', days_ago: 2 },
        { member_name: 'Lê Thị Thu Hà', risk_level: 'medium', type: 'checkpoint_90', days_ago: 5 },
      ],
    }
    return HttpResponse.json({ success: true, data: dashboard })
  }),

  http.get(`${BASE}/api/hr/retention/members`, () => {
    return HttpResponse.json({ success: true, data: mockMembers })
  }),

  http.get(`${BASE}/api/hr/retention/members/:id`, ({ params }) => {
    const member = mockMembers.find((m) => m.id === params.id) ?? mockMembers[0]
    return HttpResponse.json({ success: true, data: member })
  }),

  http.post(`${BASE}/api/hr/retention/members/:id/risk`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({
      success: true,
      data: {
        id: Math.random().toString(36).slice(2),
        member_id: 'u1',
        risk_level: body.risk_level,
        reason: body.reason,
        checkpoint_day: body.checkpoint_day,
        logged_at: new Date().toISOString(),
      },
    })
  }),

  http.get(`${BASE}/api/hr/retention/assignments`, () => {
    return HttpResponse.json({ success: true, data: mockMembers.map((m) => m.current_assignment).filter(Boolean) })
  }),

  http.post(`${BASE}/api/hr/retention/assignments`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    const assignment: LeaderAssignment = {
      id: Math.random().toString(36).slice(2),
      member_id: body.member_id as string,
      leader_id: body.leader_id as string,
      status: 'none',
      assigned_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }
    return HttpResponse.json({ success: true, data: assignment })
  }),

  http.put(`${BASE}/api/hr/retention/assignments/:id`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ success: true, data: { id: 'a1', ...body } })
  }),

  http.post(`${BASE}/api/hr/retention/interventions`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    const intervention: Intervention = {
      id: Math.random().toString(36).slice(2),
      member_id: body.member_id as string,
      hr_manager_id: 'hr1',
      intervene_date: body.intervene_date as string,
      action_taken: body.action_taken as string,
      created_at: new Date().toISOString(),
    }
    return HttpResponse.json({ success: true, data: intervention })
  }),

  http.get(`${BASE}/api/hr/retention/interventions`, () => {
    return HttpResponse.json({ success: true, data: [] })
  }),

  http.get(`${BASE}/api/hr/retention/leader-metrics`, () => {
    const data = mockLeaderMetrics.map((m) => ({
      ...m,
      coaching_flag: (m.turnover_rate_3m ?? 0) > 20 || (m.engage_score ?? 10) < 5,
    }))
    return HttpResponse.json({ success: true, data })
  }),

  http.post(`${BASE}/api/hr/retention/coaching-requests`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({
      success: true,
      data: {
        id: Math.random().toString(36).slice(2),
        leader_id: body.leader_id,
        requested_by: 'hr1',
        type: body.type,
        status: 'pending',
        created_at: new Date().toISOString(),
      },
    })
  }),

  http.put(`${BASE}/api/hr/retention/coaching-requests/:id`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ success: true, data: { id: 'cr1', ...body } })
  }),
]
