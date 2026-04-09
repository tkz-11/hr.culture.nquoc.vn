import React, { useState, useEffect } from 'react'
import type { AuthUser, HRMember, RetentionDashboard, LeaderMetrics } from '../../../shared/types'
import { retentionService } from '../services/retention.service'
import { Badge, riskBadge } from '../../../shared/components/Badge'
import { Modal } from '../../../shared/components/Modal'
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner'
import { EmptyState } from '../../../shared/components/EmptyState'

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

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-nquoc-text font-header">Retention Radar</h1>
        <p className="text-sm text-nquoc-muted mt-1">Bản đồ rủi ro nhân sự & Quản trị bế tắc</p>
      </div>

      {/* Summary cards */}
      {dashboard && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="Rủi ro cao"
            value={dashboard.high_risk}
            variant="red"
            icon="⚠️"
          />
          <SummaryCard
            label="Bế tắc"
            value={dashboard.stuck_count}
            variant="amber"
            icon="🔴"
          />
          <SummaryCard
            label="Checkpoint đến hạn"
            value={dashboard.checkpoints_due}
            variant="blue"
            icon="📅"
          />
          <SummaryCard
            label="Tổng nhân sự"
            value={dashboard.total_members}
            variant="slate"
            icon="👥"
          />
        </div>
      )}

      {/* Recent alerts */}
      {dashboard && dashboard.recent_alerts.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-red-600 mb-2">Cảnh báo gần đây</p>
          <div className="flex flex-wrap gap-2">
            {dashboard.recent_alerts.map((alert, i) => (
              <span key={i} className="text-xs text-red-700 bg-white border border-red-200 rounded-lg px-2 py-1">
                {alert.member_name} · <Badge variant="red" size="sm">{alert.risk_level.toUpperCase()}</Badge> · {alert.days_ago} ngày trước
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Radar Grid */}
      <div className="bg-white rounded-2xl border border-nquoc-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-nquoc-border">
          <h2 className="text-sm font-semibold text-nquoc-text font-header">
            Bản đồ nhân sự — 30/60/90 Day
          </h2>
          <button className="text-xs text-nquoc-blue border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors">
            Xuất báo cáo
          </button>
        </div>

        {members.length === 0 ? (
          <EmptyState icon="📋" title="Chưa có dữ liệu nhân sự" description="Dữ liệu sẽ xuất hiện khi có nhân sự được theo dõi." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[11px] text-nquoc-muted font-semibold uppercase tracking-wide border-b border-nquoc-border">
                  <th className="text-left px-5 py-3">Nhân sự</th>
                  <th className="text-left px-4 py-3">Tiến độ</th>
                  <th className="text-left px-4 py-3">Tình trạng</th>
                  <th className="text-left px-4 py-3">Bế tắc</th>
                  <th className="text-left px-4 py-3">Trách nhiệm</th>
                  <th className="text-left px-4 py-3">Hành động</th>
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
        <div className="bg-white rounded-2xl border border-nquoc-border overflow-hidden">
          <div className="px-5 py-4 border-b border-nquoc-border">
            <h2 className="text-sm font-semibold text-nquoc-text font-header">Ma trận Trưởng nhóm</h2>
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

      {/* Intervention Modal */}
      {interventionMember && (
        <InterventionModal
          member={interventionMember}
          onClose={() => setInterventionMember(null)}
        />
      )}

      {/* Warn Leader Modal */}
      {warnLeader && (
        <WarnLeaderModal
          leader={warnLeader}
          onClose={() => setWarnLeader(null)}
        />
      )}

      {/* Coaching Request Modal */}
      {coachLeader && (
        <CoachingModal
          leader={coachLeader}
          onClose={() => setCoachLeader(null)}
        />
      )}
    </div>
  )
}

// ── Summary Card ──
function SummaryCard({ label, value, variant, icon }: {
  label: string
  value: number
  variant: 'red' | 'amber' | 'blue' | 'slate'
  icon: string
}) {
  const bgMap = { red: 'bg-red-50', amber: 'bg-amber-50', blue: 'bg-blue-50', slate: 'bg-slate-50' }
  const textMap = { red: 'text-red-600', amber: 'text-amber-600', blue: 'text-blue-600', slate: 'text-slate-600' }
  return (
    <div className={`${bgMap[variant]} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-nquoc-muted font-medium">{label}</span>
      </div>
      <p className={`text-3xl font-bold ${textMap[variant]} font-header`}>{value}</p>
    </div>
  )
}

// ── Member Row ──
function MemberRow({ member, userRole, onIntervene }: {
  member: HRMember
  userRole: string
  onIntervene: () => void
}) {
  const { variant, label } = riskBadge(member.risk_level)
  const assignment = member.current_assignment
  const stuckDays = assignment?.stuck_since
    ? Math.floor((Date.now() - new Date(assignment.stuck_since).getTime()) / 86400000)
    : 0

  // Checkpoint progress
  const day = member.days_in_team
  const checkpoint = day >= 90 ? 90 : day >= 60 ? 60 : 30
  const progress = Math.min((day / checkpoint) * 100, 100)

  return (
    <tr className="hover:bg-nquoc-bg transition-colors group">
      {/* Nhân sự */}
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-nquoc-blue flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {member.user?.name?.charAt(0) ?? '?'}
          </div>
          <div>
            <p className="text-sm font-medium text-nquoc-text">{member.user?.name}</p>
            <p className="text-xs text-nquoc-muted">{member.team?.name}</p>
          </div>
        </div>
      </td>

      {/* Tiến độ */}
      <td className="px-4 py-3">
        <div>
          <p className="text-xs font-medium text-nquoc-text mb-1">{member.days_in_team}/{checkpoint}D</p>
          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-nquoc-blue rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </td>

      {/* Tình trạng */}
      <td className="px-4 py-3">
        <Badge variant={variant} size="sm">{label}</Badge>
      </td>

      {/* Bế tắc */}
      <td className="px-4 py-3">
        {stuckDays > 0 ? (
          <span className="text-sm font-semibold text-rose-600 animate-pulse">{stuckDays} ngày</span>
        ) : (
          <span className="text-sm text-nquoc-muted">—</span>
        )}
      </td>

      {/* Trách nhiệm */}
      <td className="px-4 py-3">
        <span className="text-sm text-nquoc-text">{assignment?.leader?.name ?? '—'}</span>
      </td>

      {/* Hành động */}
      <td className="px-4 py-3">
        {userRole === 'hr_manager' ? (
          <button
            onClick={onIntervene}
            className="text-xs font-semibold text-white bg-nquoc-hr px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors"
          >
            CAN THIỆP
          </button>
        ) : (
          <button className="text-xs font-semibold text-nquoc-blue border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
            THEO DÕI
          </button>
        )}
      </td>
    </tr>
  )
}

// ── Leader Card ──
function LeaderCard({ metrics, onWarn, onCoach }: {
  metrics: LeaderMetrics & { coaching_flag: boolean }
  onWarn: () => void
  onCoach: () => void
}) {
  const turnoverHigh = (metrics.turnover_rate_3m ?? 0) > 20
  const engageLow = (metrics.engage_score ?? 10) < 5

  return (
    <div className="border border-nquoc-border rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-nquoc-lead flex items-center justify-center text-white font-bold text-sm">
            L
          </div>
          <div>
            <p className="text-sm font-semibold text-nquoc-text">{metrics.leader?.name}</p>
            <p className="text-xs text-nquoc-muted">{metrics.team?.name} · {metrics.team_size} người</p>
          </div>
        </div>
        {metrics.coaching_flag && (
          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 font-medium">
            ⚠ Cần coaching
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-[11px] text-nquoc-muted">Nghỉ việc 3T</p>
          <p className={`font-bold font-header ${turnoverHigh ? 'text-red-600' : 'text-slate-600'}`}>
            {metrics.turnover_rate_3m ?? 0}%
          </p>
        </div>
        <div>
          <p className="text-[11px] text-nquoc-muted">Engagement</p>
          <p className={`font-bold font-header ${engageLow ? 'text-red-600' : 'text-emerald-600'}`}>
            {metrics.engage_score ?? '—'}/10
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onWarn}
          className="flex-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg py-1.5 hover:bg-amber-100 transition-colors"
        >
          Nhắc nhở
        </button>
        <button
          onClick={onCoach}
          className="flex-1 text-xs font-medium text-nquoc-blue bg-blue-50 border border-blue-200 rounded-lg py-1.5 hover:bg-blue-100 transition-colors"
        >
          Coaching
        </button>
      </div>
    </div>
  )
}

// ── Intervention Modal ──
function InterventionModal({ member, onClose }: { member: HRMember; onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [actionNote, setActionNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!actionNote.trim()) return
    setSubmitting(true)
    try {
      await retentionService.createIntervention({
        member_id: member.id,
        action_taken: actionNote,
        intervene_date: new Date().toISOString().split('T')[0],
      })
      setStep(3)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen title="Can thiệp HR" onClose={onClose} size="md">
      <div className="p-6">
        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                s <= step ? 'bg-nquoc-blue text-white' : 'bg-gray-100 text-nquoc-muted'
              }`}>{s}</div>
              {s < 3 && <div className={`flex-1 h-0.5 ${s < step ? 'bg-nquoc-blue' : 'bg-gray-100'}`} />}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-nquoc-text font-header">Xem xét tình huống</h3>
            <div className="bg-nquoc-bg rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-nquoc-blue flex items-center justify-center text-white font-bold">
                  {member.user?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-nquoc-text">{member.user?.name}</p>
                  <p className="text-xs text-nquoc-muted">{member.team?.name} · Ngày {member.days_in_team}/90</p>
                </div>
              </div>
              <div className="pt-2 space-y-1">
                <p className="text-xs text-nquoc-muted">Mức rủi ro: <Badge variant={riskBadge(member.risk_level).variant} size="sm">{member.risk_level.toUpperCase()}</Badge></p>
                {member.current_assignment && (
                  <p className="text-xs text-nquoc-muted">Leader phụ trách: <span className="text-nquoc-text font-medium">{member.current_assignment.leader?.name}</span></p>
                )}
                {member.current_assignment?.stuck_since && (
                  <p className="text-xs text-rose-600 font-medium">Bế tắc từ: {new Date(member.current_assignment.stuck_since).toLocaleDateString('vi-VN')}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full py-2.5 bg-nquoc-blue text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Tiếp theo
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-nquoc-text font-header">Xác nhận can thiệp</h3>
            <div>
              <label className="text-xs font-semibold text-nquoc-muted block mb-1.5">
                Ghi chú hành động can thiệp <span className="text-red-500">*</span>
              </label>
              <textarea
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="Ví dụ: Lên lịch gặp 1-on-1 với member trong 24h, trao đổi về rào cản công việc..."
                className="w-full h-28 border border-nquoc-border rounded-xl px-3 py-2.5 text-sm text-nquoc-text resize-none focus:outline-none focus:border-nquoc-blue transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 border border-nquoc-border text-nquoc-muted rounded-xl text-sm font-medium hover:bg-nquoc-bg transition-colors"
              >
                Quay lại
              </button>
              <button
                onClick={handleSubmit}
                disabled={!actionNote.trim() || submitting}
                className="flex-1 py-2.5 bg-nquoc-hr text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Đang gửi...' : 'Gửi can thiệp'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-3xl">✓</div>
            <h3 className="font-semibold text-nquoc-text font-header">Đã gửi can thiệp</h3>
            <p className="text-sm text-nquoc-muted">
              Leader sẽ nhận thông báo. HR sẽ xử lý trong 24h.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-nquoc-blue text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Đóng
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
            <p className="text-sm text-nquoc-muted">Gửi nhắc nhở đến <span className="font-semibold text-nquoc-text">{leader.leader?.name}</span></p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-24 border border-nquoc-border rounded-xl px-3 py-2.5 text-sm text-nquoc-text resize-none focus:outline-none focus:border-nquoc-blue transition-colors"
            />
            <div className="flex gap-2">
              {(['telegram', 'email'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setChannel(c)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${
                    channel === c ? 'bg-nquoc-blue text-white border-nquoc-blue' : 'border-nquoc-border text-nquoc-muted hover:bg-nquoc-bg'
                  }`}
                >
                  {c === 'telegram' ? '✈ Telegram DM' : '✉ Email'}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSent(true)}
              className="w-full py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors"
            >
              Gửi nhắc nhở
            </button>
          </>
        ) : (
          <div className="text-center py-4 space-y-3">
            <div className="text-3xl">✓</div>
            <p className="text-sm font-semibold text-nquoc-text">Đã gửi nhắc nhở qua {channel === 'telegram' ? 'Telegram' : 'Email'}</p>
            <button onClick={onClose} className="w-full py-2 bg-nquoc-bg border border-nquoc-border text-nquoc-text rounded-xl text-sm font-medium">Đóng</button>
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
            <p className="text-sm text-nquoc-muted">Tạo yêu cầu cho <span className="font-semibold text-nquoc-text">{leader.leader?.name}</span></p>
            <div className="space-y-2">
              {(['monitor', 'coaching'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-medium border text-left transition-colors ${
                    type === t ? 'bg-nquoc-active border-nquoc-blue text-nquoc-blue' : 'border-nquoc-border text-nquoc-muted hover:bg-nquoc-bg'
                  }`}
                >
                  {t === 'monitor' ? '👁 Theo dõi thêm' : '🎯 Yêu cầu Coaching'}
                </button>
              ))}
            </div>
            <button
              onClick={handleSubmit}
              className="w-full py-2.5 bg-nquoc-blue text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Gửi yêu cầu
            </button>
          </>
        ) : (
          <div className="text-center py-4 space-y-3">
            <div className="text-3xl">✓</div>
            <p className="text-sm font-semibold text-nquoc-text">Đã tạo yêu cầu {type === 'coaching' ? 'Coaching' : 'Theo dõi'}</p>
            <button onClick={onClose} className="w-full py-2 bg-nquoc-bg border border-nquoc-border text-nquoc-text rounded-xl text-sm font-medium">Đóng</button>
          </div>
        )}
      </div>
    </Modal>
  )
}
