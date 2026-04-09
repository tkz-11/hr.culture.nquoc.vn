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
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-8 animate-fade-in bg-[#f1f5f9]">
      <ErrorBoundary feature="Retention Radar">

        {/* Tiêu đề & Giới thiệu */}
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
            Không gian HR & Leader
          </p>
          <h1 className="text-3xl font-extrabold text-slate-900 font-header tracking-tight">
            Sức Khỏe Đội Ngũ
          </h1>
          <p className="text-sm font-medium text-slate-500 max-w-lg">
            Khám phá sớm các rào cản và cảm xúc của nhân sự để có hành động can thiệp kịp thời. Đừng để sự im lặng kéo dài.
          </p>
        </div>

        {/* Cảnh báo Gần Đây (Nổi bật nhất nếu có) */}
        {dashboard && dashboard.recent_alerts.length > 0 && (
          <div className="bg-rose-50 border-2 border-rose-100 rounded-[24px] p-5">
             <div className="flex items-start gap-4">
               <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-rose-500 shadow-sm shrink-0">
                  <span className="animate-pulse">⚠</span>
               </div>
               <div>
                 <h3 className="text-sm font-bold text-rose-800 uppercase tracking-widest mb-2">Đang cần bạn lúc này</h3>
                 <div className="flex flex-col gap-2">
                   {dashboard.recent_alerts.map((alert, i) => (
                     <div key={i} className="flex flex-wrap items-center gap-2 text-sm text-rose-700 bg-white rounded-xl px-3 py-2 shadow-sm border border-rose-50/50">
                       <span className="font-bold text-slate-900">{alert.member_name}</span>
                       <span className="text-rose-300">•</span>
                       <span className="font-medium">Bế tắc <strong className="text-rose-600">{alert.days_ago} ngày</strong></span>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
          </div>
        )}

        {/* Tóm tắt thông số Hành vi */}
        {dashboard && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <BehaviorCard 
              num={dashboard.high_risk} label="Cần can thiệp gấp" 
              icon="🚨" color="rose" urgent={dashboard.high_risk > 0} 
            />
            <BehaviorCard 
              num={dashboard.stuck_count} label="Đang bế tắc" 
              icon="🔴" color="amber" urgent={dashboard.stuck_count > 2} 
            />
            <BehaviorCard 
              num={dashboard.checkpoints_due} label="Sắp đến hạn Đánh giá" 
              icon="📅" color="indigo" 
            />
            <BehaviorCard 
              num={dashboard.total_members} label="Thành viên" 
              icon="👥" color="slate" 
            />
          </div>
        )}

        {/* Danh sách Cần Can Thiệp Gấp (Dạng Thẻ lớn, hành động tức thì) */}
        <div className="space-y-4">
           <h2 className="text-lg font-bold text-slate-900 font-header flex items-center gap-2 border-b border-slate-200 pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Ưu tiên xử lý ({highRiskMembers.length})
           </h2>
           
           {highRiskMembers.length === 0 ? (
             <EmptyState icon="🌈" title="Mọi thứ đang rất tuyệt" description="Không có nhân viên nào đang trong mức báo động đỏ." />
           ) : (
             <div className="grid grid-cols-1 gap-4">
               {highRiskMembers.map(member => (
                 <UrgentMemberCard key={member.id} member={member} onIntervene={() => setInterventionMember(member)} />
               ))}
             </div>
           )}
        </div>

        {/* Danh sách Ổn định */}
        <div className="space-y-4 pt-6">
           <h2 className="text-lg font-bold text-slate-400 font-header flex items-center gap-2 border-b border-slate-200 pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Đang hòa nhập tốt ({stableMembers.length})
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stableMembers.map(member => (
                 <StableMemberCard key={member.id} member={member} />
              ))}
           </div>
        </div>

        {/* Dành riêng cho HR Manager: Ma Trận Leader */}
        {user.role === 'hr_manager' && leaderMetrics.length > 0 && (
          <div className="space-y-4 pt-8">
            <h2 className="text-lg font-bold text-slate-900 font-header flex items-center gap-2 border-b border-slate-200 pb-3">
               <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Phân tích Tổ chức Leader
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {/* Modals */}
        {interventionMember && (
          <SmartInterventionModal
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

function BehaviorCard({ num, label, icon, color, urgent }: { num: number, label: string, icon: string, color: 'rose' | 'amber' | 'indigo' | 'slate', urgent?: boolean }) {
  const bgs = {
    rose:   'bg-rose-50 border-rose-100 text-rose-600',
    amber:  'bg-amber-50 border-amber-100 text-amber-600',
    indigo: 'bg-blue-50 border-blue-100 text-blue-600',
    slate:  'bg-white border-slate-200 text-slate-500',
  }
  const textColors = {
    rose: 'text-rose-600', amber: 'text-amber-600',
    indigo: 'text-blue-700', slate: 'text-slate-800'
  }
  const display = useCountUp(num)

  return (
    <div className={`${bgs[color]} border rounded-2xl p-4 text-center relative shadow-sm hover:shadow-md transition-all`}>
      {urgent && <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-rose-500 animate-urgent border-2 border-white" />}
      <div className="text-2xl mb-1">{icon}</div>
      <p className={`text-3xl font-black font-header block mb-1 animate-count-up ${textColors[color]}`}>{display}</p>
      <p className="text-[11px] font-bold uppercase tracking-wide opacity-80">{label}</p>
    </div>
  )
}

function UrgentMemberCard({ member, onIntervene }: { member: HRMember, onIntervene: () => void }) {
  const stuckDays = member.current_assignment?.stuck_since
    ? Math.floor((Date.now() - new Date(member.current_assignment.stuck_since).getTime()) / 86400000)
    : 0

  const isHigh = member.risk_level === 'high'

  return (
    <div className="bg-white border-2 border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 rounded-2xl p-5 shadow-sm block w-full relative overflow-hidden">
      {isHigh && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500" />}
      <div className="flex flex-col md:flex-row md:items-center gap-5">
         
         <div className="flex items-center gap-4 flex-1">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold shadow-sm flex-shrink-0
              ${isHigh ? 'bg-rose-500' : 'bg-amber-500'}`}>
              {member.user?.name?.charAt(0) ?? '?'}
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">{member.user?.name}</p>
              <p className="text-xs text-slate-500 font-medium">{member.team?.name} • Phụ trách: {member.current_assignment?.leader?.name || 'Chưa rõ'}</p>
            </div>
         </div>

         <div className="flex bg-slate-50 rounded-[16px] p-3 gap-4 border border-slate-100 flex-1 justify-center">
            <div className="text-center">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Bế tắc</p>
               <p className={`text-lg font-bold font-header ${stuckDays >= 14 ? 'text-rose-600 animate-pulse' : 'text-slate-700'}`}>{stuckDays > 0 ? `${stuckDays} ngày` : 'Không'}</p>
            </div>
            <div className="w-[1px] bg-slate-200"></div>
            <div className="text-center">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Thích nghi</p>
               <p className="text-lg font-bold font-header text-slate-700">{member.days_in_team}/90 ngày</p>
            </div>
         </div>

         <button
           onClick={onIntervene}
           className="w-full md:w-auto px-6 py-3 bg-[#0f172a] text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition-all shadow-md mt-2 md:mt-0 active:scale-[0.97]">
           Can thiệp ngay
         </button>

      </div>
    </div>
  )
}

function StableMemberCard({ member }: { member: HRMember }) {
  return (
    <div className="bg-white border border-slate-100 rounded-[24px] p-4 flex items-center gap-3">
       <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold border border-emerald-100">
         {member.user?.name?.charAt(0) ?? '?'}
       </div>
       <div>
         <p className="text-sm font-bold text-slate-800">{member.user?.name}</p>
         <p className="text-xs text-slate-400 font-medium">Progress: {member.days_in_team}/90 • {member.team?.name}</p>
       </div>
       <div className="ml-auto text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">Tốt</div>
    </div>
  )
}

function SimpleLeaderCard({ metrics, onWarn, onCoach }: {
  metrics: LeaderMetrics & { coaching_flag: boolean };
  onWarn: () => void; onCoach: () => void
}) {
  const turnoverHigh = (metrics.turnover_rate_3m ?? 0) > 20
  
  return (
    <div className="bg-white border text-center border-slate-200 rounded-2xl p-5 shadow-sm">
       <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-[20px] shadow-sm flex items-center justify-center text-indigo-600 font-bold text-xl mx-auto mb-3">
         {metrics.leader?.name?.charAt(0) ?? 'L'}
       </div>
       <h3 className="text-base font-bold text-slate-900">{metrics.leader?.name}</h3>
       <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">{metrics.team?.name} • {metrics.team_size} người</p>
       
       <div className="mt-4 flex gap-2 justify-center">
         <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${turnoverHigh ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-600'}`}>
            Rời đi: {metrics.turnover_rate_3m}%
         </span>
         <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700">
            Năng lượng: {metrics.engage_score}/10
         </span>
       </div>

       <div className="mt-5 grid grid-cols-2 gap-3">
         <button onClick={onWarn} className="py-2.5 bg-white border-2 border-amber-100 text-amber-700 font-bold text-xs rounded-xl hover:bg-amber-50">⚠ Nhắc nhẹ</button>
         <button onClick={onCoach} className="py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 shadow-sm">🎯 Huấn luyện</button>
       </div>
    </div>
  )
}

/* Modal Can Thiệp Thông Minh: Tập trung vào kịch bản 1 Click (Scripted Response) */
function SmartInterventionModal({ member, onClose }: { member: HRMember; onClose: () => void }) {
  const [step, setStep] = useState<'info' | 'done'>('info')
  const stuckDays = member.current_assignment?.stuck_since ? Math.floor((Date.now() - new Date(member.current_assignment.stuck_since).getTime()) / 86400000) : 0

  const handleIntervene = () => {
    setTimeout(() => {
       setStep('done')
    }, 800)
  }

  return (
    <Modal isOpen title="" onClose={onClose} size="md">
      <div className="p-0 border-b-0 max-h-[85vh] overflow-y-auto">
         {step === 'info' ? (
           <div className="p-6 md:p-8 space-y-6">
              <div className="flex flex-col items-center text-center gap-3">
                 <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-rose-500 font-bold text-2xl">
                   {member.user?.name?.charAt(0)}
                 </div>
                 <div>
                   <h2 className="text-2xl font-bold font-header text-slate-900">{member.user?.name}</h2>
                   <p className="text-sm font-medium text-slate-500">{member.team?.name} • Bế tắc <strong className="text-rose-600">{stuckDays} ngày</strong></p>
                 </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-[20px] p-4 text-sm font-medium text-slate-700 italic text-center">
                 "Máy học AI dự đoán: Nhân sự có xu hướng muốn nghỉ việc do thiếu gắn kết và phản hồi từ Trưởng nhóm."
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 text-center">Chọn kịch bản phù hợp nhất</p>
                <div className="space-y-3">
                   <button onClick={() => handleIntervene()} className="w-full text-left p-4 rounded-[20px] border border-indigo-100 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-300 transition-colors">
                      <p className="text-sm font-bold text-indigo-900 mb-1">💬 Nhắn tin trò chuyện nhanh</p>
                      <p className="text-xs text-indigo-700/80 font-medium">Bắt chuyện nhẹ nhàng, không tạo áp lực. Gửi kịch bản mẫu qua Chat.</p>
                   </button>
                   <button onClick={() => handleIntervene()} className="w-full text-left p-4 rounded-[20px] border border-amber-100 bg-amber-50 hover:bg-amber-100 hover:border-amber-300 transition-colors">
                      <p className="text-sm font-bold text-amber-900 mb-1">📅 Đặt lịch 1-on-1 Khẩn cấp</p>
                      <p className="text-xs text-amber-700/80 font-medium">Mời gọi thảo luận trực tiếp qua Coffee Meeting để giải tỏa nỗi lo.</p>
                   </button>
                </div>
              </div>

              <button onClick={onClose} className="w-full py-3 bg-white text-slate-500 font-bold text-sm rounded-full text-center hover:bg-slate-50 border border-slate-200">
                Chưa làm bây giờ
              </button>
           </div>
         ) : (
           <div className="p-8 text-center space-y-4 py-12">
              <div className="text-6xl mb-4 animate-bounce-in">👏</div>
              <h2 className="text-2xl font-bold font-header text-slate-900">Tuyệt vời!</h2>
              <p className="text-sm text-slate-600 font-medium">Bạn vừa làm một hành động tạo ra sự an toàn tâm lý. Cuộc trò chuyện đã được log lại vào hệ thống.</p>
              <button onClick={onClose} className="w-full mt-4 py-4 bg-slate-900 text-white font-bold text-sm rounded-[24px] hover:bg-slate-800 shadow-md">
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
       <div className="p-6 text-center">
         <p className="text-sm text-slate-600 mb-5">Xác nhận gửi thông báo nhắc nhở 1-on-1 cho <br/><strong className="text-slate-900">{leader.leader?.name}</strong>?</p>
         <button onClick={onClose} className="w-full py-3 bg-amber-500 text-white font-bold text-sm rounded-xl">Đã gửi nhắc nhở</button>
       </div>
     </Modal>
  )
}

function CoachingModal({ leader, onClose }: { leader: LeaderMetrics & { coaching_flag: boolean }; onClose: () => void }) {
  return (
     <Modal isOpen title="Set lịch Coaching" onClose={onClose} size="sm">
       <div className="p-6 text-center">
         <p className="text-sm text-slate-600 mb-5">Team của <strong className="text-slate-900">{leader.leader?.name}</strong> đang có tỷ lệ nghỉ việc cao. Tạo request Coaching?</p>
         <button onClick={onClose} className="w-full py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl mb-3">Tạo lịch hẹn</button>
       </div>
     </Modal>
  )
}
