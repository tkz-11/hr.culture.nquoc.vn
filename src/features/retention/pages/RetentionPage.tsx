import { useState, useEffect } from 'react'
import type { AuthUser, HRMember, RetentionDashboard, LeaderMetrics } from '../../../shared/types'
import { useCountUp } from '../../../shared/hooks/useCountUp'
import { retentionService } from '../services/retention.service'
import { Modal } from '../../../shared/components/Modal'
import { EmptyState } from '../../../shared/components/EmptyState'
import { Skeleton } from '../../../shared/components/Skeleton'
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
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3 rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-[24px]" />
          <Skeleton className="h-32 rounded-[24px]" />
        </div>
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    </div>
  )

  const highRiskMembers = members.filter(m => m.risk_level === 'high' || m.risk_level === 'medium')
  const stableMembers = members.filter(m => m.risk_level === 'low')

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <ErrorBoundary feature="Retention Radar">

        {/* Header */}
        <div>
          <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.12em] mb-1">Không gian HR & Leader</p>
          <h1 className="text-xl font-black text-[#1a1a2e] font-header tracking-tight">Radar Giữ Chân Nhân Sự</h1>
          <p className="text-[13px] text-[#5a6a85] mt-1 max-w-lg">
            Khám phá sớm các rào cản để can thiệp kịp thời. Đừng để sự im lặng kéo dài.
          </p>
        </div>

        {/* Alert bar */}
        {dashboard && dashboard.recent_alerts.length > 0 && (
          <div className="bg-[#fff0f0] border border-[#fecaca] rounded-[14px] p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-[8px] bg-[#e53e3e] flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <h3 className="text-[11px] font-bold text-[#e53e3e] uppercase tracking-[0.1em] mb-1.5">Đang cần bạn lúc này</h3>
              <div className="flex flex-col gap-1.5">
                {dashboard.recent_alerts.map((alert, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2 text-[12px] text-[#e53e3e] bg-white rounded-[8px] px-3 py-1.5 border border-[#fecaca]">
                    <span className="font-bold text-[#1a1a2e]">{alert.member_name}</span>
                    <span className="text-[#fecaca]">•</span>
                    <span>Bế tắc <strong>{alert.days_ago} ngày</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        {dashboard && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard num={dashboard.high_risk} label="Cần can thiệp" color="red" urgent={dashboard.high_risk > 0} />
            <StatCard num={dashboard.stuck_count} label="Đang bế tắc" color="amber" urgent={dashboard.stuck_count > 2} />
            <StatCard num={dashboard.checkpoints_due} label="Sắp đến hạn" color="blue" />
            <StatCard num={dashboard.total_members} label="Thành viên" color="slate" />
          </div>
        )}

        {/* Priority list */}
        <div className="space-y-3">
          <h2 className="text-[13px] font-bold text-[#1a1a2e] flex items-center gap-2 border-b border-[#f0f0f0] pb-3">
            <span className="w-2 h-2 rounded-full bg-[#e53e3e]" /> Ưu tiên xử lý ({highRiskMembers.length})
          </h2>
          {highRiskMembers.length === 0 ? (
            <EmptyState
              icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
              title="Mọi thứ đang rất tuyệt"
              description="Không có nhân viên nào đang trong mức báo động đỏ."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {highRiskMembers.map(member => (
                <UrgentMemberCard key={member.id} member={member} onIntervene={() => setInterventionMember(member)} />
              ))}
            </div>
          )}
        </div>

        {/* Stable members */}
        <div className="space-y-3">
          <h2 className="text-[13px] font-bold text-[#94a3b8] flex items-center gap-2 border-b border-[#f0f0f0] pb-3">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" /> Đang hòa nhập tốt ({stableMembers.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stableMembers.map(member => (
              <StableMemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>

        {/* Leader matrix (HR only) */}
        {user.role === 'hr_manager' && leaderMetrics.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-[13px] font-bold text-[#1a1a2e] flex items-center gap-2 border-b border-[#f0f0f0] pb-3">
              <span className="w-2 h-2 rounded-full bg-[#6d28d9]" /> Phân tích Leader
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {leaderMetrics.map((lm) => (
                <SimpleLeaderCard
                  key={lm.id}
                  metrics={lm}
                  onWarn={() => setWarnLeader(lm)}
                  onCoach={() => setCoachLeader(lm)}
                />
              ))}
            </div>
          </div>
        )}

        {interventionMember && <SmartInterventionModal member={interventionMember} onClose={() => setInterventionMember(null)} />}
        {warnLeader && <WarnLeaderModal leader={warnLeader} onClose={() => setWarnLeader(null)} />}
        {coachLeader && <CoachingModal leader={coachLeader} onClose={() => setCoachLeader(null)} />}

      </ErrorBoundary>
    </div>
  )
}

function StatCard({ num, label, color, urgent }: { num: number; label: string; color: 'red' | 'amber' | 'blue' | 'slate'; urgent?: boolean }) {
  const styles = {
    red:   { bg: 'bg-[#fff0f0] border-[#fecaca]', text: 'text-[#e53e3e]' },
    amber: { bg: 'bg-[#fffbeb] border-[#fde68a]', text: 'text-[#d97706]' },
    blue:  { bg: 'bg-[#eff6ff] border-[#bfdbfe]', text: 'text-[#1d4ed8]' },
    slate: { bg: 'bg-white border-[#ebebeb]',       text: 'text-[#1a1a2e]' },
  }
  const display = useCountUp(num)
  const s = styles[color]

  return (
    <div className={`${s.bg} border rounded-[14px] p-4 text-center relative shadow-card hover:shadow-card-hover transition-all`}>
      {urgent && <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#e53e3e] animate-pulse" />}
      <p className={`text-3xl font-black font-header block mb-1 ${s.text}`}>{display}</p>
      <p className={`text-[10px] font-bold uppercase tracking-wide ${s.text} opacity-70`}>{label}</p>
    </div>
  )
}



function UrgentMemberCard({ member, onIntervene }: { member: HRMember, onIntervene: () => void }) {
  const stuckDays = member.current_assignment?.stuck_since
    ? Math.floor((Date.now() - new Date(member.current_assignment.stuck_since).getTime()) / 86400000)
    : 0
  const isHigh = member.risk_level === 'high'

  return (
    <div className="bg-white border border-[#ebebeb] hover:border-[#fecaca] hover:shadow-card-hover transition-all rounded-[16px] p-4 shadow-card relative overflow-hidden">
      {isHigh && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#e53e3e] rounded-l-[16px]" />}
      <div className="flex flex-col md:flex-row md:items-center gap-4 pl-2">
        <div className="flex items-center gap-3 flex-1">
          <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${isHigh ? 'bg-[#e53e3e]' : 'bg-[#d97706]'}`}>
            {member.user?.name?.charAt(0) ?? '?'}
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#1a1a2e]">{member.user?.name}</p>
            <p className="text-[11px] text-[#94a3b8]">{member.team?.name} · {member.current_assignment?.leader?.name || 'Chưa rõ'}</p>
          </div>
        </div>
        <div className="flex bg-[#f5f6fa] rounded-[10px] px-4 py-2.5 gap-5 border border-[#ebebeb] flex-shrink-0">
          <div className="text-center">
            <p className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wide mb-0.5">Bế tắc</p>
            <p className={`text-[14px] font-bold font-header ${stuckDays >= 14 ? 'text-[#e53e3e] animate-pulse' : 'text-[#1a1a2e]'}`}>
              {stuckDays > 0 ? `${stuckDays} ngày` : '—'}
            </p>
          </div>
          <div className="w-px bg-[#ebebeb]" />
          <div className="text-center">
            <p className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wide mb-0.5">Thích nghi</p>
            <p className="text-[14px] font-bold font-header text-[#1a1a2e]">{member.days_in_team}/90</p>
          </div>
        </div>
        <button
          onClick={onIntervene}
          className="w-full md:w-auto px-4 py-2.5 bg-[#e53e3e] text-white font-bold text-[12px] rounded-[10px] hover:bg-[#c53030] transition-all active:scale-[0.97] flex-shrink-0"
        >
          Can thiệp ngay
        </button>
      </div>
    </div>
  )
}

function StableMemberCard({ member }: { member: HRMember }) {
  return (
    <div className="bg-white border border-[#ebebeb] rounded-[14px] p-3.5 flex items-center gap-3 shadow-card hover:shadow-card-hover transition-all">
      <div className="w-9 h-9 rounded-[9px] bg-[#f0fdf4] text-[#059669] flex items-center justify-center text-sm font-bold flex-shrink-0">
        {member.user?.name?.charAt(0) ?? '?'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-[#1a1a2e] truncate">{member.user?.name}</p>
        <p className="text-[11px] text-[#94a3b8]">{member.days_in_team}/90 ngày · {member.team?.name}</p>
      </div>
      <span className="text-[10px] font-bold text-[#059669] bg-[#f0fdf4] px-2 py-1 rounded-[6px] border border-[#bbf7d0] flex-shrink-0">Tốt</span>
    </div>
  )
}

function SimpleLeaderCard({ metrics, onWarn, onCoach }: {
  metrics: LeaderMetrics & { coaching_flag: boolean };
  onWarn: () => void; onCoach: () => void
}) {
  const turnoverHigh = (metrics.turnover_rate_3m ?? 0) > 20

  return (
    <div className="bg-white border border-[#ebebeb] rounded-[16px] p-5 shadow-card hover:shadow-card-hover transition-all text-center">
      <div className="w-12 h-12 bg-[#f0f0ff] rounded-[12px] flex items-center justify-center text-[#6d28d9] font-bold text-base mx-auto mb-3">
        {metrics.leader?.name?.charAt(0) ?? 'L'}
      </div>
      <h3 className="text-[13px] font-bold text-[#1a1a2e]">{metrics.leader?.name}</h3>
      <p className="text-[10px] text-[#94a3b8] font-medium uppercase tracking-wide">{metrics.team?.name} · {metrics.team_size} người</p>

      <div className="mt-3 flex gap-2 justify-center flex-wrap">
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-[6px] ${turnoverHigh ? 'bg-[#fff0f0] text-[#e53e3e]' : 'bg-[#f5f6fa] text-[#5a6a85]'}`}>
          Rời đi: {metrics.turnover_rate_3m}%
        </span>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-[6px] bg-[#f0f0ff] text-[#6d28d9]">
          Năng lượng: {metrics.engage_score}/10
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button onClick={onWarn} className="py-2 border border-[#fde68a] bg-[#fffbeb] text-[#d97706] font-bold text-[11px] rounded-[10px] hover:bg-[#fef3c7] transition-all">
          Nhắc nhẹ
        </button>
        <button onClick={onCoach} className="py-2 bg-[#6d28d9] text-white font-bold text-[11px] rounded-[10px] hover:bg-[#5b21b6] transition-all shadow-sm">
          Huấn luyện
        </button>
      </div>
    </div>
  )
}

function SmartInterventionModal({ member, onClose }: { member: HRMember; onClose: () => void }) {
  const [step, setStep] = useState<'info' | 'done'>('info')
  const stuckDays = member.current_assignment?.stuck_since
    ? Math.floor((Date.now() - new Date(member.current_assignment.stuck_since).getTime()) / 86400000)
    : 0

  const handleIntervene = () => {
    setTimeout(() => setStep('done'), 600)
  }

  return (
    <Modal isOpen title="Can thiệp" onClose={onClose} size="md">
      <div className="max-h-[80vh] overflow-y-auto">
        {step === 'info' ? (
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#fff0f0] rounded-[12px] flex items-center justify-center text-[#e53e3e] font-bold text-base flex-shrink-0">
                {member.user?.name?.charAt(0)}
              </div>
              <div>
                <h2 className="text-[14px] font-bold text-[#1a1a2e] font-header">{member.user?.name}</h2>
                <p className="text-[11px] text-[#94a3b8]">{member.team?.name} · Bế tắc <strong className="text-[#e53e3e]">{stuckDays} ngày</strong></p>
              </div>
            </div>

            <div className="bg-[#f5f6fa] border border-[#ebebeb] rounded-[12px] p-4">
              <p className="text-[12px] text-[#5a6a85] italic leading-relaxed">
                "Nhân sự có xu hướng muốn nghỉ việc do thiếu gắn kết và phản hồi từ Trưởng nhóm."
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.1em]">Chọn kịch bản phù hợp</p>
              <button onClick={handleIntervene} className="w-full text-left p-4 rounded-[12px] border border-[#bfdbfe] bg-[#eff6ff] hover:bg-[#dbeafe] transition-colors">
                <p className="text-[13px] font-bold text-[#1d4ed8] mb-1">Nhắn tin trò chuyện nhanh</p>
                <p className="text-[11px] text-[#1d4ed8]/70">Bắt chuyện nhẹ nhàng, không tạo áp lực.</p>
              </button>
              <button onClick={handleIntervene} className="w-full text-left p-4 rounded-[12px] border border-[#fde68a] bg-[#fffbeb] hover:bg-[#fef3c7] transition-colors">
                <p className="text-[13px] font-bold text-[#d97706] mb-1">Đặt lịch 1-on-1 khẩn cấp</p>
                <p className="text-[11px] text-[#d97706]/70">Mời gọi thảo luận trực tiếp qua Coffee Meeting.</p>
              </button>
            </div>

            <button onClick={onClose} className="w-full py-2.5 bg-[#f5f6fa] text-[#5a6a85] font-bold text-[12px] rounded-[10px] hover:bg-[#f0f0f0] border border-[#ebebeb] transition-all">
              Chưa làm bây giờ
            </button>
          </div>
        ) : (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-[#f0fdf4] rounded-[16px] flex items-center justify-center mx-auto">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 className="text-[18px] font-bold font-header text-[#1a1a2e]">Đã ghi nhận!</h2>
            <p className="text-[13px] text-[#5a6a85]">Hành động vừa tạo ra sự an toàn tâm lý. Cuộc trò chuyện đã được log vào hệ thống.</p>
            <button onClick={onClose} className="w-full mt-2 py-3 bg-[#e53e3e] text-white font-bold text-[13px] rounded-[12px] hover:bg-[#c53030] transition-all">
              Hoàn thành
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}

function WarnLeaderModal({ leader, onClose }: { leader: LeaderMetrics & { coaching_flag: boolean }; onClose: () => void }) {
  return (
    <Modal isOpen title="Nhắc nhở nhẹ" onClose={onClose} size="sm">
      <div className="p-5 text-center">
        <p className="text-[13px] text-[#5a6a85] mb-5">Xác nhận gửi thông báo nhắc nhở 1-on-1 cho <br/><strong className="text-[#1a1a2e]">{leader.leader?.name}</strong>?</p>
        <button onClick={onClose} className="w-full py-3 bg-[#d97706] text-white font-bold text-[13px] rounded-[12px] hover:bg-[#b45309] transition-all">
          Đã gửi nhắc nhở
        </button>
      </div>
    </Modal>
  )
}

function CoachingModal({ leader, onClose }: { leader: LeaderMetrics & { coaching_flag: boolean }; onClose: () => void }) {
  return (
    <Modal isOpen title="Yêu cầu Coaching" onClose={onClose} size="sm">
      <div className="p-5 text-center">
        <p className="text-[13px] text-[#5a6a85] mb-5">Team của <strong className="text-[#1a1a2e]">{leader.leader?.name}</strong> đang có tỷ lệ nghỉ việc cao. Tạo request Coaching?</p>
        <button onClick={onClose} className="w-full py-3 bg-[#6d28d9] text-white font-bold text-[13px] rounded-[12px] hover:bg-[#5b21b6] transition-all">
          Tạo lịch hẹn
        </button>
      </div>
    </Modal>
  )
}
