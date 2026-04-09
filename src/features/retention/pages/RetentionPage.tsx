import React, { useState, useEffect } from 'react'
import type { AuthUser, HRMember, RetentionDashboard, LeaderMetrics } from '../../../shared/types'
import { retentionService } from '../services/retention.service'
import { Badge, riskBadge } from '../../../shared/components/Badge'
import { Modal } from '../../../shared/components/Modal'
import { EmptyState } from '../../../shared/components/EmptyState'
import { Skeleton, TableSkeleton } from '../../../shared/components/Skeleton'
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary'

interface RetentionPageProps {
  user: AuthUser
}

export function RetentionPage({ user }: RetentionPageProps) {
  const [dashboard, setDashboard] = useState<RetentionDashboard | null>(null)
  const [members, setMembers] = useState<HRMember[]>([])
  const [leaderMetrics, setLeaderMetrics] = useState<(LeaderMetrics & { coaching_flag: boolean })[]>([])
  const [loading, setLoading] = useState(true)
  const [interventionMember, setInterventionMember] = useState<HRMember | null>(null)
  const [warnLeader, setWarnLeader] = useState<(LeaderMetrics & { coaching_flag: boolean }) | null>(null)
  const [coachLeader, setCoachLeader] = useState<(LeaderMetrics & { coaching_flag: boolean }) | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [dash, mems] = await Promise.all([
          retentionService.getDashboard(),
          retentionService.getMembers(),
        ])
        setDashboard(dash)
        setMembers(mems)
        if (user.role === 'hr_manager') {
          const metrics = await retentionService.getLeaderMetrics()
          setLeaderMetrics(metrics)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user.role])

  if (loading) return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-[28px]" />)}
      </div>
      <TableSkeleton />
    </div>
  )

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
      <ErrorBoundary feature="Retention Radar">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-sm">📡</div>
              <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-widest">HR Tool</p>
            </div>
            <h1 className="text-2xl font-bold text-nquoc-text font-header">Retention Radar</h1>
            <p className="text-sm text-nquoc-muted mt-1">Bản đồ rủi ro nhân sự · Quản trị bế tắc 30/60/90 ngày</p>
          </div>
          <button className="text-xs font-bold text-indigo-600 border border-indigo-200 rounded-2xl px-4 py-2.5
            hover:bg-indigo-50 transition-all active:scale-95 whitespace-nowrap">
            📊 Xuất báo cáo
          </button>
        </div>

        {/* Summary KPI Cards — Glassmorphism style */}
        {dashboard && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              label="Rủi ro cao"
              value={dashboard.high_risk}
              icon="🚨"
              gradient="from-rose-500 to-pink-600"
              bg="bg-rose-50"
              textColor="text-rose-600"
              borderColor="border-rose-100"
              urgent={dashboard.high_risk > 0}
            />
            <KPICard
              label="Đang bế tắc"
              value={dashboard.stuck_count}
              icon="🔴"
              gradient="from-amber-500 to-orange-600"
              bg="bg-amber-50"
              textColor="text-amber-600"
              borderColor="border-amber-100"
              urgent={dashboard.stuck_count > 2}
            />
            <KPICard
              label="Checkpoint đến hạn"
              value={dashboard.checkpoints_due}
              icon="📅"
              gradient="from-indigo-500 to-violet-600"
              bg="bg-indigo-50"
              textColor="text-indigo-600"
              borderColor="border-indigo-100"
            />
            <KPICard
              label="Tổng nhân sự"
              value={dashboard.total_members}
              icon="👥"
              gradient="from-slate-500 to-slate-700"
              bg="bg-slate-50"
              textColor="text-slate-600"
              borderColor="border-slate-100"
            />
          </div>
        )}

        {/* Recent Alerts Banner */}
        {dashboard && dashboard.recent_alerts.length > 0 && (
          <div className="bg-rose-50 border border-rose-100 rounded-[28px] px-6 py-4 flex items-start gap-4">
            <div className="w-8 h-8 rounded-xl bg-rose-500 flex items-center justify-center text-white text-sm flex-shrink-0 animate-pulse">
              ⚠
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-rose-700 mb-2 uppercase tracking-wider">Cảnh báo gần đây</p>
              <div className="flex flex-wrap gap-2">
                {dashboard.recent_alerts.map((alert, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-rose-700 bg-white border border-rose-200 rounded-xl px-3 py-1.5 shadow-rose-soft">
                    <span className="font-semibold">{alert.member_name}</span>
                    <span className="text-rose-300">·</span>
                    <Badge variant="red" size="sm">{alert.risk_level.toUpperCase()}</Badge>
                    <span className="text-rose-400">{alert.days_ago} ngày trước</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Member Radar Grid */}
        <div className="bg-white rounded-[32px] border border-nquoc-border overflow-hidden shadow-card">
          <div className="flex items-center justify-between px-6 py-5 border-b border-nquoc-border">
            <div>
              <h2 className="text-base font-bold text-nquoc-text font-header">
                Bản đồ nhân sự · 30/60/90 Day
              </h2>
              <p className="text-[10px] text-nquoc-muted font-bold uppercase tracking-wider mt-0.5">
                Dựa trên tiến độ hòa nhập & rủi ro bế tắc
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[11px] text-nquoc-muted font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-500" />Rủi ro cao
                <span className="w-2 h-2 rounded-full bg-amber-400 ml-2" />Trung bình
                <span className="w-2 h-2 rounded-full bg-emerald-400 ml-2" />Ổn định
              </div>
            </div>
          </div>

          {members.length === 0 ? (
            <EmptyState icon="📋" title="Chưa có dữ liệu nhân sự" description="Dữ liệu sẽ xuất hiện khi có nhân sự được theo dõi." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] text-nquoc-muted font-bold uppercase tracking-widest border-b border-nquoc-border bg-nquoc-bg">
                    <th className="text-left px-6 py-3.5">Nhân sự</th>
                    <th className="text-left px-4 py-3.5">Tiến độ</th>
                    <th className="text-left px-4 py-3.5">Tình trạng</th>
                    <th className="text-left px-4 py-3.5">Bế tắc</th>
                    <th className="text-left px-4 py-3.5">Phụ trách</th>
                    <th className="text-left px-4 py-3.5">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-nquoc-border">
                  {members.map((member) => (
                    <MemberRow
                      key={member.id}
                      member={member}
                      userRole={user.role}
                      onIntervene={() => setInterventionMember(member)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Leader Matrix — HR Manager only */}
        {user.role === 'hr_manager' && leaderMetrics.length > 0 && (
          <div className="bg-white rounded-[32px] border border-nquoc-border overflow-hidden shadow-card">
            <div className="px-6 py-5 border-b border-nquoc-border">
              <h2 className="text-base font-bold text-nquoc-text font-header">Ma trận Trưởng nhóm</h2>
              <p className="text-[10px] text-nquoc-muted font-bold uppercase tracking-wider mt-0.5">
                Tổng quan hiệu quả quản lý team
              </p>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {leaderMetrics.map((lm) => (
                <LeaderCard
                  key={lm.id}
                  metrics={lm}
                  onWarn={() => setWarnLeader(lm)}
                  onCoach={() => setCoachLeader(lm)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Modals */}
        {interventionMember && (
          <InterventionWizard
            member={interventionMember}
            onClose={() => setInterventionMember(null)}
          />
        )}
        {warnLeader && <WarnLeaderModal leader={warnLeader} onClose={() => setWarnLeader(null)} />}
        {coachLeader && <CoachingModal leader={coachLeader} onClose={() => setCoachLeader(null)} />}

      </ErrorBoundary>
    </div>
  )
}

// ── KPI Card ──
function KPICard({ label, value, icon, bg, textColor, borderColor, urgent }: {
  label: string; value: number; icon: string
  gradient: string; bg: string; textColor: string; borderColor: string; urgent?: boolean
}) {
  return (
    <div className={`${bg} border ${borderColor} rounded-[28px] p-5 card-lift relative overflow-hidden ${urgent ? 'ring-1 ring-rose-300' : ''}`}>
      {urgent && (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
      )}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{icon}</span>
        <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-wider">{label}</p>
      </div>
      <p className={`text-4xl font-extrabold font-header leading-none ${textColor} animate-count-up`}>{value}</p>
    </div>
  )
}

// ── Member Row ──
function MemberRow({ member, userRole, onIntervene }: {
  member: HRMember; userRole: string; onIntervene: () => void
}) {
  const { variant, label } = riskBadge(member.risk_level)
  const assignment = member.current_assignment
  const stuckDays = assignment?.stuck_since
    ? Math.floor((Date.now() - new Date(assignment.stuck_since).getTime()) / 86400000)
    : 0

  const day = member.days_in_team
  const checkpoint = day >= 90 ? 90 : day >= 60 ? 60 : 30
  const progress = Math.min((day / checkpoint) * 100, 100)

  const progressColor = member.risk_level === 'high'
    ? 'bg-rose-500'
    : member.risk_level === 'medium'
    ? 'bg-amber-400'
    : 'bg-emerald-500'

  return (
    <tr className="hover:bg-nquoc-hover transition-colors group">
      {/* Nhân sự */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm
            ${member.risk_level === 'high' ? 'bg-gradient-to-br from-rose-500 to-pink-600'
            : member.risk_level === 'medium' ? 'bg-gradient-to-br from-amber-400 to-amber-500'
            : 'bg-gradient-indigo'}`}>
            {member.user?.name?.charAt(0) ?? '?'}
          </div>
          <div>
            <p className="text-sm font-semibold text-nquoc-text">{member.user?.name}</p>
            <p className="text-[11px] text-nquoc-muted">{member.team?.name}</p>
          </div>
        </div>
      </td>

      {/* Tiến độ */}
      <td className="px-4 py-4">
        <div>
          <p className="text-xs font-bold text-nquoc-text mb-1.5">{member.days_in_team}/{checkpoint}D</p>
          <div className="w-28 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${progressColor}`} style={{ width: `${progress}%` }} />
          </div>
        </div>
      </td>

      {/* Tình trạng */}
      <td className="px-4 py-4">
        <Badge variant={variant} size="sm">{label}</Badge>
      </td>

      {/* Bế tắc */}
      <td className="px-4 py-4">
        {stuckDays > 0 ? (
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-bold ${stuckDays >= 14 ? 'text-rose-600' : 'text-amber-600'}`}>
              {stuckDays} ngày
            </span>
            {stuckDays >= 14 && (
              <span className="text-[9px] font-bold bg-rose-100 text-rose-600 rounded-full px-1.5 py-0.5 uppercase animate-pulse">
                URGENT
              </span>
            )}
          </div>
        ) : (
          <span className="text-sm text-slate-300 font-medium">—</span>
        )}
      </td>

      {/* Phụ trách */}
      <td className="px-4 py-4">
        <span className="text-sm text-nquoc-text font-medium">{assignment?.leader?.name ?? '—'}</span>
      </td>

      {/* Hành động */}
      <td className="px-4 py-4">
        {userRole === 'hr_manager' ? (
          <button
            onClick={onIntervene}
            className="text-xs font-bold text-white bg-rose-500 px-4 py-2 rounded-xl
              hover:bg-rose-600 shadow-rose-soft transition-all active:scale-95 whitespace-nowrap"
          >
            Can thiệp ngay
          </button>
        ) : (
          <button className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl
            hover:bg-indigo-100 transition-all active:scale-95">
            Hỗ trợ ngay
          </button>
        )}
      </td>
    </tr>
  )
}

// ── Leader Card ──
function LeaderCard({ metrics, onWarn, onCoach }: {
  metrics: LeaderMetrics & { coaching_flag: boolean };
  onWarn: () => void; onCoach: () => void
}) {
  const turnoverHigh = (metrics.turnover_rate_3m ?? 0) > 20
  const engageLow = (metrics.engage_score ?? 10) < 5

  return (
    <div className="bg-white border border-nquoc-border rounded-[28px] p-6 space-y-4 shadow-card card-lift">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {metrics.leader?.name?.charAt(0) ?? 'L'}
          </div>
          <div>
            <p className="text-sm font-bold text-nquoc-text">{metrics.leader?.name}</p>
            <p className="text-[11px] text-nquoc-muted">{metrics.team?.name} · {metrics.team_size} người</p>
          </div>
        </div>
        {metrics.coaching_flag && (
          <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-1 font-bold uppercase tracking-wider">
            ⚠ Coaching
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-nquoc-bg rounded-2xl p-3">
          <p className="text-[10px] text-nquoc-muted font-bold uppercase tracking-wider mb-1">Nghỉ việc 3T</p>
          <p className={`text-xl font-extrabold font-header ${turnoverHigh ? 'text-rose-600' : 'text-slate-700'}`}>
            {metrics.turnover_rate_3m ?? 0}%
          </p>
        </div>
        <div className="bg-nquoc-bg rounded-2xl p-3">
          <p className="text-[10px] text-nquoc-muted font-bold uppercase tracking-wider mb-1">Engagement</p>
          <p className={`text-xl font-extrabold font-header ${engageLow ? 'text-rose-600' : 'text-emerald-600'}`}>
            {metrics.engage_score ?? '—'}/10
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={onWarn}
          className="flex-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl py-2 hover:bg-amber-100 transition-colors active:scale-95">
          ⚠ Nhắc nhở
        </button>
        <button onClick={onCoach}
          className="flex-1 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl py-2 hover:bg-indigo-100 transition-colors active:scale-95">
          🎯 Coaching
        </button>
      </div>
    </div>
  )
}

// ── Intervention Wizard — 3 bước: Lắng nghe → Đối thoại → Giải quyết ──
function InterventionWizard({ member, onClose }: { member: HRMember; onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [channel, setChannel] = useState<'1on1' | 'telegram' | 'email'>('1on1')
  const [actionNote, setActionNote] = useState('')
  const [commitment, setCommitment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const stuckDays = member.current_assignment?.stuck_since
    ? Math.floor((Date.now() - new Date(member.current_assignment.stuck_since).getTime()) / 86400000)
    : 0

  const handleSubmit = async () => {
    if (!actionNote.trim()) return
    setSubmitting(true)
    try {
      await retentionService.createIntervention({
        member_id: member.id,
        action_taken: `${actionNote}\n\nCam kết: ${commitment}`,
        intervene_date: new Date().toISOString().split('T')[0],
      })
      setStep(4)
    } finally {
      setSubmitting(false)
    }
  }

  const steps = [
    { n: 1, label: 'Lắng nghe', icon: '👂' },
    { n: 2, label: 'Đối thoại', icon: '💬' },
    { n: 3, label: 'Giải quyết', icon: '✅' },
  ]

  return (
    <Modal isOpen title="" onClose={onClose} size="md">
      <div className="p-6">

        {step < 4 && (
          <>
            {/* Step indicator */}
            <div className="flex items-center gap-0 mb-7">
              {steps.map((s, i) => (
                <React.Fragment key={s.n}>
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      s.n < step ? 'bg-emerald-500 text-white'
                      : s.n === step ? 'bg-gradient-indigo text-white shadow-nquoc scale-110'
                      : 'bg-slate-100 text-nquoc-muted'
                    }`}>
                      {s.n < step ? '✓' : s.icon}
                    </div>
                    <p className={`text-[10px] font-bold mt-1.5 ${s.n === step ? 'text-indigo-600' : 'text-nquoc-muted'}`}>
                      {s.label}
                    </p>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mb-5 mx-1 transition-all duration-500 ${s.n < step ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </>
        )}

        {/* Step 1: Lắng nghe */}
        {step === 1 && (
          <div className="space-y-5 animate-slide-up">
            <div>
              <h3 className="text-lg font-bold text-nquoc-text font-header">👂 Bước 1: Lắng nghe</h3>
              <p className="text-sm text-nquoc-muted mt-1">Xem xét toàn bộ bối cảnh trước khi can thiệp.</p>
            </div>

            {/* Member context card */}
            <div className="bg-nquoc-bg rounded-2xl p-5 space-y-3 border border-nquoc-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold text-base">
                  {member.user?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-nquoc-text">{member.user?.name}</p>
                  <p className="text-xs text-nquoc-muted">{member.team?.name} · Ngày {member.days_in_team}/90</p>
                </div>
                <Badge variant={riskBadge(member.risk_level).variant} size="sm" className="ml-auto">
                  {member.risk_level.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-white rounded-xl p-3">
                  <p className="text-[10px] text-nquoc-muted font-bold uppercase tracking-wider mb-1">Số ngày bế tắc</p>
                  <p className={`text-2xl font-extrabold font-header ${stuckDays >= 14 ? 'text-rose-600' : 'text-amber-600'}`}>
                    {stuckDays > 0 ? stuckDays : '—'}
                    <span className="text-sm font-normal text-nquoc-muted ml-1">ngày</span>
                  </p>
                  {stuckDays >= 14 && (
                    <p className="text-[10px] font-bold text-rose-500 uppercase mt-1 animate-pulse">⚠ Nghiêm trọng</p>
                  )}
                </div>
                <div className="bg-white rounded-xl p-3">
                  <p className="text-[10px] text-nquoc-muted font-bold uppercase tracking-wider mb-1">Leader phụ trách</p>
                  <p className="text-sm font-bold text-nquoc-text">
                    {member.current_assignment?.leader?.name ?? 'Chưa phân công'}
                  </p>
                </div>
              </div>

              {member.current_assignment?.stuck_since && (
                <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  Bế tắc từ: {new Date(member.current_assignment.stuck_since).toLocaleDateString('vi-VN')}
                </p>
              )}
            </div>

            {/* Listening checklist */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-3">Trước khi gặp — check:</p>
              <div className="space-y-2">
                {[
                  'Đọc lại lịch sử tương tác gần nhất với member?',
                  'Hỏi Leader về bối cảnh và rào cản công việc?',
                  'Đặt tâm thế lắng nghe, không phán xét từ đầu?',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-indigo-800">
                    <span className="w-4 h-4 rounded flex items-center justify-center bg-indigo-200 text-indigo-700 font-bold flex-shrink-0 mt-0.5 text-[10px]">
                      {i + 1}
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 bg-gradient-indigo text-white rounded-2xl text-sm font-bold hover:opacity-90 transition-all active:scale-95 shadow-nquoc"
            >
              Đã lắng nghe — Tiến đến Đối thoại →
            </button>
          </div>
        )}

        {/* Step 2: Đối thoại */}
        {step === 2 && (
          <div className="space-y-5 animate-slide-up">
            <div>
              <h3 className="text-lg font-bold text-nquoc-text font-header">💬 Bước 2: Đối thoại</h3>
              <p className="text-sm text-nquoc-muted mt-1">Ghi lại kế hoạch trao đổi trực tiếp với member.</p>
            </div>

            {/* Channel selector */}
            <div>
              <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-wider mb-2">Hình thức gặp gỡ</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { key: '1on1', label: '1-on-1 Meet', icon: '🤝' },
                  { key: 'telegram', label: 'Telegram DM', icon: '✈' },
                  { key: 'email', label: 'Email', icon: '✉' },
                ] as const).map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setChannel(c.key)}
                    className={`py-3 px-2 rounded-2xl text-xs font-bold border transition-all text-center ${
                      channel === c.key
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700 shadow-sm'
                        : 'border-nquoc-border text-nquoc-muted hover:bg-nquoc-hover'
                    }`}
                  >
                    <div className="text-lg mb-1">{c.icon}</div>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-nquoc-muted uppercase tracking-wider block mb-2">
                Ghi chú nội dung trao đổi dự kiến <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="VD: Hỏi thăm về rào cản công việc hiện tại, lắng nghe cảm xúc và nhu cầu. Đề xuất kết nối với mentor, tạo 1-on-1 hàng tuần..."
                className="w-full h-28 border-2 border-nquoc-border rounded-2xl px-4 py-3 text-sm text-nquoc-text resize-none
                  focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all placeholder-slate-300"
              />
            </div>

            {/* Talk tips */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2">💡 Gợi ý câu hỏi mở:</p>
              <div className="space-y-1.5 text-xs text-emerald-800">
                {[
                  '"Bạn đang cảm thấy thế nào về công việc gần đây?"',
                  '"Có điều gì đang làm bạn khó chịu hoặc trở ngại không?"',
                  '"Tôi có thể giúp gì để bạn tiến lên được không?"',
                ].map((q, i) => (
                  <p key={i} className="italic">{q}</p>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="flex-1 py-3 border border-nquoc-border text-nquoc-muted rounded-2xl text-sm font-medium hover:bg-nquoc-bg transition-colors">
                ← Quay lại
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!actionNote.trim()}
                className="flex-1 py-3 bg-gradient-indigo text-white rounded-2xl text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-all active:scale-95 shadow-nquoc"
              >
                Tiến đến Giải quyết →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Giải quyết */}
        {step === 3 && (
          <div className="space-y-5 animate-slide-up">
            <div>
              <h3 className="text-lg font-bold text-nquoc-text font-header">✅ Bước 3: Giải quyết</h3>
              <p className="text-sm text-nquoc-muted mt-1">Xác nhận cam kết hành động sau buổi đối thoại.</p>
            </div>

            {/* Summary */}
            <div className="bg-nquoc-bg rounded-2xl p-4 border border-nquoc-border space-y-3">
              <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-wider">Tóm tắt kế hoạch</p>
              <div className="flex justify-between text-sm">
                <span className="text-nquoc-muted">Member:</span>
                <span className="font-bold text-nquoc-text">{member.user?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-nquoc-muted">Hình thức:</span>
                <span className="font-bold text-nquoc-text capitalize">{channel === '1on1' ? '1-on-1 Meeting' : channel}</span>
              </div>
              <div className="pt-2 border-t border-nquoc-border">
                <p className="text-xs text-nquoc-muted font-medium">{actionNote}</p>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-nquoc-muted uppercase tracking-wider block mb-2">
                Cam kết kết quả sau 48h
              </label>
              <textarea
                value={commitment}
                onChange={(e) => setCommitment(e.target.value)}
                placeholder="VD: Lên lịch 1-on-1 trong 24h, báo cáo kết quả qua Telegram cho HR Manager..."
                className="w-full h-20 border-2 border-nquoc-border rounded-2xl px-4 py-3 text-sm text-nquoc-text resize-none
                  focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all placeholder-slate-300"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)}
                className="flex-1 py-3 border border-nquoc-border text-nquoc-muted rounded-2xl text-sm font-medium hover:bg-nquoc-bg transition-colors">
                ← Quay lại
              </button>
              <button
                onClick={handleSubmit}
                disabled={!actionNote.trim() || submitting}
                className="flex-1 py-3 bg-rose-500 text-white rounded-2xl text-sm font-bold hover:bg-rose-600 disabled:opacity-50 transition-all active:scale-95 shadow-rose-soft"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Đang gửi...
                  </span>
                ) : '🚀 Gửi can thiệp'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="text-center space-y-5 py-6 animate-bounce-in">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-4xl glow-emerald">
              ✅
            </div>
            <div>
              <h3 className="text-xl font-bold text-nquoc-text font-header">Can thiệp đã được ghi nhận!</h3>
              <p className="text-sm text-nquoc-muted mt-2 leading-relaxed">
                Leader sẽ nhận thông báo ngay. HR sẽ theo dõi và cập nhật kết quả trong 48h tới.
              </p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-sm text-emerald-800">
              <p className="font-bold mb-1">Bước tiếp theo:</p>
              <p className="text-xs">Kết nối với <strong>{member.current_assignment?.leader?.name}</strong> và xác nhận lịch gặp 1-on-1.</p>
            </div>
            <button onClick={onClose}
              className="w-full py-3 bg-gradient-indigo text-white rounded-2xl text-sm font-bold hover:opacity-90 transition-all shadow-nquoc">
              Hoàn thành
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}

// ── Warn Leader Modal ──
function WarnLeaderModal({ leader, onClose }: { leader: LeaderMetrics & { coaching_flag: boolean }; onClose: () => void }) {
  const [message, setMessage] = useState('Nhắc Leader chủ động 1-on-1 sớm với các thành viên đang gặp khó khăn.')
  const [channel, setChannel] = useState<'telegram' | 'email'>('telegram')
  const [sent, setSent] = useState(false)

  return (
    <Modal isOpen title="Nhắc nhở Leader" onClose={onClose} size="sm">
      <div className="p-6 space-y-4">
        {!sent ? (
          <>
            <p className="text-sm text-nquoc-muted">
              Gửi nhắc nhở đến <span className="font-bold text-nquoc-text">{leader.leader?.name}</span>
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-24 border-2 border-nquoc-border rounded-2xl px-3 py-2.5 text-sm text-nquoc-text resize-none
                focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all"
            />
            <div className="flex gap-2">
              {(['telegram', 'email'] as const).map((c) => (
                <button key={c} onClick={() => setChannel(c)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    channel === c
                      ? 'bg-nquoc-blue text-white border-nquoc-blue shadow-nquoc'
                      : 'border-nquoc-border text-nquoc-muted hover:bg-nquoc-hover'
                  }`}>
                  {c === 'telegram' ? '✈ Telegram DM' : '✉ Email'}
                </button>
              ))}
            </div>
            <button onClick={() => setSent(true)}
              className="w-full py-3 bg-amber-500 text-white rounded-2xl text-sm font-bold hover:bg-amber-600 transition-all active:scale-95">
              Gửi nhắc nhở
            </button>
          </>
        ) : (
          <div className="text-center py-4 space-y-3 animate-bounce-in">
            <div className="text-4xl">✅</div>
            <p className="text-sm font-bold text-nquoc-text">Đã gửi qua {channel === 'telegram' ? 'Telegram' : 'Email'}</p>
            <button onClick={onClose} className="w-full py-2.5 bg-nquoc-bg border border-nquoc-border text-nquoc-text rounded-2xl text-sm font-medium">
              Đóng
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}

// ── Coaching Request Modal ──
function CoachingModal({ leader, onClose }: { leader: LeaderMetrics & { coaching_flag: boolean }; onClose: () => void }) {
  const [type, setType] = useState<'monitor' | 'coaching'>('coaching')
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    await retentionService.createCoachingRequest({ leader_id: leader.leader_id, type })
    setSent(true)
  }

  return (
    <Modal isOpen title="Yêu cầu Coaching" onClose={onClose} size="sm">
      <div className="p-6 space-y-4">
        {!sent ? (
          <>
            <p className="text-sm text-nquoc-muted">
              Tạo yêu cầu cho <span className="font-bold text-nquoc-text">{leader.leader?.name}</span>
            </p>
            <div className="space-y-2">
              {(['monitor', 'coaching'] as const).map((t) => (
                <button key={t} onClick={() => setType(t)}
                  className={`w-full py-3.5 px-4 rounded-2xl text-sm font-bold border text-left transition-all ${
                    type === t
                      ? 'bg-nquoc-active border-nquoc-blue text-nquoc-blue shadow-sm'
                      : 'border-nquoc-border text-nquoc-muted hover:bg-nquoc-hover'
                  }`}>
                  {t === 'monitor' ? '👁 Theo dõi thêm' : '🎯 Yêu cầu Coaching'}
                </button>
              ))}
            </div>
            <button onClick={handleSubmit}
              className="w-full py-3 bg-gradient-indigo text-white rounded-2xl text-sm font-bold hover:opacity-90 transition-all active:scale-95 shadow-nquoc">
              Gửi yêu cầu
            </button>
          </>
        ) : (
          <div className="text-center py-4 space-y-3 animate-bounce-in">
            <div className="text-4xl">🎯</div>
            <p className="text-sm font-bold text-nquoc-text">Đã tạo yêu cầu {type === 'coaching' ? 'Coaching' : 'Theo dõi'}</p>
            <button onClick={onClose} className="w-full py-2.5 bg-nquoc-bg border border-nquoc-border text-nquoc-text rounded-2xl text-sm font-medium">
              Đóng
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}
