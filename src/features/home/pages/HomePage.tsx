import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AuthUser } from '../../../shared/types'
import { LineChart } from '../../../shared/components/LineChart'
import { Badge } from '../../../shared/components/Badge'

interface HomePageProps {
  user: AuthUser
}

const MOCK_RETENTION = {
  high_risk: 2,
  stuck_count: 3,
  checkpoints_due: 5,
  total_members: 24,
  top_risks: [
    {
      id: '1', name: 'Nguyễn Minh Anh', team: 'Marketing',
      stuck_days: 16, risk: 'high',
      emotional_state: 'Có thể đang cảm thấy cô lập và mất định hướng',
      last_note: 'Ít tương tác với team trong 2 tuần gần nhất',
    },
    {
      id: '2', name: 'Trần Văn Bình', team: 'Dev Team',
      stuck_days: 9, risk: 'high',
      emotional_state: 'Có thể đang chịu áp lực deadline mà không dám nói',
      last_note: 'Deadline trễ 2 sprint liên tiếp',
    },
    {
      id: '3', name: 'Lê Thị Cát', team: 'Sales',
      stuck_days: 4, risk: 'medium',
      emotional_state: 'Có thể đang điều chỉnh với nhịp làm việc mới',
      last_note: 'Tuần đầu sau khi chuyển team',
    },
  ],
}

const MOCK_CULTURE = {
  total_xp: 1240,
  streak: 7,
  directness_score: 74,
  latest_stories: [
    {
      id: '1', name: 'Phạm Đức Dũng', team: 'Product',
      type: 'Dám làm', courage: 'breakthrough',
      content: 'Tôi đã chủ động đề xuất thay đổi quy trình review code sau 3 tuần nhận ra bottleneck.',
      xp: 30, reactions: { fire: 18, brave: 12, respect: 7 },
    },
    {
      id: '2', name: 'Nguyễn Thu Hà', team: 'HR',
      type: 'Dám sai', courage: 'big',
      content: 'Tuần trước tôi gửi nhầm template onboarding cũ. Tôi đã xin lỗi trực tiếp và tạo checklist.',
      xp: 20, reactions: { fire: 9, brave: 15, respect: 11 },
    },
  ],
}

const SAFETY_DATA = [6.8, 7.1, 7.4, 7.0, 7.8, 8.1, 8.4]

const IDENTITY_CHOICES = [
  {
    id: 'direct',
    emoji: '🎯',
    label: 'Người dám nói thẳng',
    desc: 'Hôm nay tôi sẽ nói rõ ý kiến, kể cả khi khó.',
    color: 'border-indigo-400 bg-gradient-to-br from-indigo-50 to-violet-50',
    badge: 'text-indigo-700 bg-indigo-100',
    xp: '+20 XP',
  },
  {
    id: 'learn',
    emoji: '💥',
    label: 'Người dám sai và học',
    desc: 'Hôm nay tôi sẽ thử điều chưa chắc, và ghi lại bài học.',
    color: 'border-rose-400 bg-gradient-to-br from-rose-50 to-pink-50',
    badge: 'text-rose-700 bg-rose-100',
    xp: '+15 XP',
  },
  {
    id: 'support',
    emoji: '🤝',
    label: 'Người chủ động hỗ trợ',
    desc: 'Hôm nay tôi sẽ hỏi thăm ít nhất 1 người trong team.',
    color: 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50',
    badge: 'text-emerald-700 bg-emerald-100',
    xp: '+10 XP',
  },
]

const SAFETY_ACTIONS = [
  'Hỏi thăm 1 thành viên có vẻ im lặng trong meeting hôm nay',
  'Nói thẳng về 1 vấn đề bạn đã im lặng từ tuần trước',
  'Chia sẻ 1 sai lầm nhỏ của mình với team trước 12h trưa',
  'Ghi nhận công khai 1 đồng nghiệp đã làm tốt',
]

function getSessionKey() { return `identity-chosen-${new Date().toDateString()}` }
function getSavedIdentity() { return sessionStorage.getItem(getSessionKey()) }

function IdentityGate({ onUnlock }: { onUnlock: (identity: string) => void }) {
  const [chosen, setChosen] = useState<string | null>(null)
  const [unlocking, setUnlocking] = useState(false)
  const [reflection, setReflection] = useState('')
  const [step, setStep] = useState<'choose' | 'reflect'>('choose')

  const handleProceed = () => {
    if (!chosen) return
    if (step === 'choose') { setStep('reflect'); return }
    if (reflection.trim().length < 10) return
    setUnlocking(true)
    setTimeout(() => {
      sessionStorage.setItem(getSessionKey(), chosen)
      onUnlock(chosen)
    }, 700)
  }

  const identityConfig = IDENTITY_CHOICES.find(i => i.id === chosen)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-6 animate-fade-in">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4 animate-float inline-block">🌅</div>
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">
            Buổi Sáng · NhiLe Culture
          </p>
          <h1 className="text-3xl font-bold text-white font-header leading-tight">
            {step === 'choose'
              ? <>Hôm nay bạn <span className="text-gradient-indigo">là ai?</span></>
              : <>Cam kết của bạn là <span className="text-gradient-indigo">gì?</span></>
            }
          </h1>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            {step === 'choose'
              ? 'Chọn một identity cho ngày hôm nay. Đây là bước đầu tiên của thay đổi.'
              : <>Bạn chọn là <strong className="text-white">{identityConfig?.label}</strong>. Hôm nay bạn sẽ làm gì cụ thể?</>
            }
          </p>
        </div>

        {step === 'choose' ? (
          <div className="space-y-3 mb-6">
            {IDENTITY_CHOICES.map((choice) => (
              <button
                key={choice.id}
                onClick={() => setChosen(choice.id)}
                className={`w-full text-left p-5 rounded-[28px] border-2 transition-all duration-300
                  ${chosen === choice.id
                    ? `${choice.color} scale-[1.02] shadow-lg shadow-indigo-900/30`
                    : 'border-slate-700 bg-slate-800/60 hover:border-slate-600 hover:bg-slate-800'
                  }`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl flex-shrink-0 mt-0.5">{choice.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`text-sm font-bold ${chosen === choice.id ? 'text-slate-900' : 'text-white'}`}>
                        {choice.label}
                      </p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        chosen === choice.id ? choice.badge : 'text-slate-500 bg-slate-700'
                      }`}>
                        {choice.xp}
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed ${chosen === choice.id ? 'text-slate-600' : 'text-slate-400'}`}>
                      {choice.desc}
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 flex items-center justify-center transition-all ${
                    chosen === choice.id ? 'border-indigo-500 bg-indigo-500' : 'border-slate-600'
                  }`}>
                    {chosen === choice.id && <span className="text-white text-[10px]">✓</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-slate-800/80 border border-slate-700 rounded-[28px] p-6 mb-5 backdrop-blur-md">
            <div className={`flex items-center gap-3 mb-4 p-3 rounded-2xl ${identityConfig?.color.split(' ')[1] ?? 'bg-indigo-50'} border ${identityConfig?.color.split(' ')[0] ?? 'border-indigo-200'}`}>
              <span className="text-2xl">{identityConfig?.emoji}</span>
              <div>
                <p className="text-sm font-bold text-slate-900">{identityConfig?.label}</p>
                <p className="text-xs text-slate-600">{identityConfig?.desc}</p>
              </div>
            </div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Hôm nay cụ thể tôi sẽ...
            </label>
            <textarea
              id="identity-reflection"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              autoFocus
              placeholder="Ví dụ: Tôi sẽ nói thẳng với leader về deadline bất khả thi của task A trước 11h sáng..."
              className="w-full h-24 bg-slate-900 text-white border-2 border-slate-700 rounded-2xl px-4 py-3 text-sm resize-none
                focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-600"
            />
            <p className={`text-xs mt-2 transition-colors ${reflection.length >= 10 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
              {reflection.length >= 10 ? '✓ Cam kết cụ thể — sẵn sàng!' : `Cần ít nhất ${10 - reflection.length} ký tự nữa...`}
            </p>
          </div>
        )}

        <button
          id="identity-proceed-btn"
          onClick={handleProceed}
          disabled={(step === 'choose' && !chosen) || (step === 'reflect' && reflection.trim().length < 10) || unlocking}
          className="w-full py-4 bg-gradient-indigo text-white rounded-2xl font-bold text-sm
            hover:opacity-90 disabled:opacity-40 transition-all active:scale-95 shadow-nquoc
            flex items-center justify-center gap-2"
        >
          {unlocking ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Đang khởi động hệ thống...
            </>
          ) : step === 'choose' ? '→ Tôi chọn identity này' : '🚀 Bắt đầu ngày mới!'}
        </button>

        {step === 'reflect' && (
          <button onClick={() => setStep('choose')} className="mt-3 w-full text-center text-xs text-slate-500 hover:text-slate-400 transition-colors">
            ← Chọn lại identity
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main Home Page ──
export function HomePage({ user }: HomePageProps) {
  const navigate = useNavigate()
  const [unlocked, setUnlocked] = useState(() => !!getSavedIdentity())
  const [identity, setIdentity] = useState<string | null>(() => getSavedIdentity())
  const [greeting, setGreeting] = useState('')
  const [safetyAction] = useState(() => SAFETY_ACTIONS[Math.floor(Math.random() * SAFETY_ACTIONS.length)])
  const [interventionOpen, setInterventionOpen] = useState<string | null>(null)

  useEffect(() => {
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Chào buổi sáng' : h < 18 ? 'Buổi chiều tốt lành' : 'Chào buổi tối')
  }, [])

  if (!unlocked) {
    return <IdentityGate onUnlock={(id) => { setIdentity(id); setUnlocked(true) }} />
  }

  const roleLabel: Record<string, string> = {
    hr_manager: 'HR Manager', leader: 'Team Leader', member: 'Thành viên',
  }

  const identityConfig = IDENTITY_CHOICES.find(i => i.id === identity)

  const directnessProgress = MOCK_CULTURE.directness_score
  const dpColor = directnessProgress >= 70 ? '#10b981' : directnessProgress >= 50 ? '#f59e0b' : '#e11d48'

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5 animate-fade-in">
      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden bg-gradient-indigo rounded-[32px] p-8 text-white shadow-nquoc-lg noise">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between gap-6 flex-wrap">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-75 mb-1">{greeting}, {roleLabel[user.role]}</p>
            <h1 className="text-3xl font-bold font-header leading-tight">
              {user.name} <span className="text-2xl animate-wave inline-block">👋</span>
            </h1>
            {identityConfig && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-base">{identityConfig.emoji}</span>
                <p className="text-sm opacity-90 font-semibold">{identityConfig.label} hôm nay</p>
              </div>
            )}
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="glass rounded-2xl px-5 py-3 text-center">
              <p className="text-xs font-bold uppercase tracking-wider opacity-75 mb-1">Culture XP</p>
              <p className="text-2xl font-extrabold font-header">{MOCK_CULTURE.total_xp}</p>
            </div>
            <div className="glass rounded-2xl px-5 py-3 text-center">
              <p className="text-xs font-bold uppercase tracking-wider opacity-75 mb-1">Streak</p>
              <p className="text-2xl font-extrabold font-header">{MOCK_CULTURE.streak} 🔥</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Directness Score + Safety Action ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Directness Score */}
        <div className="bg-white rounded-[28px] border border-nquoc-border p-6 shadow-card card-lift">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-base flex items-center justify-center">🎯</div>
            <div>
              <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-widest">Chỉ số cá nhân</p>
              <p className="text-sm font-bold text-nquoc-text font-header">Directness Score</p>
            </div>
          </div>

          <div className="flex items-end gap-3 mb-3">
            <p className="text-5xl font-extrabold font-header leading-none" style={{ color: dpColor }}>
              {directnessProgress}
            </p>
            <p className="text-sm text-nquoc-muted mb-1">/ 100</p>
            <p className="text-xs font-bold ml-auto mb-1" style={{ color: dpColor }}>
              {directnessProgress >= 70 ? '🟢 Tốt' : directnessProgress >= 50 ? '🟡 Khá' : '🔴 Cần cải thiện'}
            </p>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${directnessProgress}%`, backgroundColor: dpColor }}
            />
          </div>
          <p className="text-[10px] text-nquoc-muted mt-2">
            Tăng điểm: dùng Rewrite Lab, chia sẻ story, làm challenge
          </p>
        </div>

        {/* Safety Action */}
        <div className="lg:col-span-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[28px] p-6 text-white shadow-card card-lift relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 pointer-events-none">💚</div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-base">⚡</div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">1 Hành động ngay bây giờ</p>
            </div>
            <p className="text-base font-bold leading-relaxed mb-4">
              "{safetyAction}"
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/culture')}
                className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-2xl text-sm font-bold border border-white/20 transition-all active:scale-95 backdrop-blur-sm"
              >
                ✅ Tôi đã làm &  chia sẻ story
              </button>
              <button
                onClick={() => navigate('/passport')}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-sm font-bold border border-white/20 transition-all active:scale-95"
              >
                ✍️ Luyện Rewrite
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bento Grid ── */}
      <div className="grid grid-cols-12 gap-5">
        {/* KPI Cards */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-4 gap-4">
          {[
            { label: 'Rủi ro cao', value: MOCK_RETENTION.high_risk, icon: '🚨', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', urgent: true, action: () => navigate('/retention') },
            { label: 'Đang bế tắc', value: MOCK_RETENTION.stuck_count, icon: '🔴', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', urgent: false, action: () => navigate('/retention') },
            { label: 'CP đến hạn', value: MOCK_RETENTION.checkpoints_due, icon: '📅', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', urgent: false, action: () => navigate('/retention') },
            { label: 'Tổng nhân sự', value: MOCK_RETENTION.total_members, icon: '👥', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', urgent: false, action: () => {} },
          ].map((kpi) => (
            <button
              key={kpi.label}
              onClick={kpi.action}
              className={`${kpi.bg} border ${kpi.border} rounded-[28px] p-5 text-left card-lift group relative overflow-hidden ${kpi.urgent ? 'ring-1 ring-rose-300' : ''}`}
            >
              {kpi.urgent && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{kpi.icon}</span>
                <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-wider">{kpi.label}</p>
              </div>
              <p className={`text-4xl font-extrabold font-header leading-none ${kpi.color}`}>{kpi.value}</p>
              <p className="text-[10px] text-nquoc-muted mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                Xem chi tiết →
              </p>
            </button>
          ))}
        </div>

        {/* Safety Index Chart */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-[32px] border border-nquoc-border p-6 shadow-card card-lift">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-widest">An toàn tâm lý</p>
              <p className="text-xl font-bold text-nquoc-text font-header mt-0.5">Safety Index</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-lg">🛡️</div>
          </div>
          <div className="h-[90px]">
            <LineChart
              labels={['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']}
              datasets={[{ label: 'Safety Index', data: SAFETY_DATA, color: '#10b981', fill: true }]}
              max={10}
            />
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="text-[11px] text-nquoc-muted">7 ngày gần nhất</p>
            <p className="text-sm font-bold text-emerald-600">8.4 / 10 ↑</p>
          </div>
        </div>

        {/* Top Risk — với Emotional State */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-[32px] border border-nquoc-border shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-nquoc-border">
            <div>
              <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-widest">Cần chú ý ngay</p>
              <h2 className="text-base font-bold text-nquoc-text font-header mt-0.5">Rủi ro nhân sự</h2>
            </div>
            <button onClick={() => navigate('/retention')}
              className="text-xs font-bold text-indigo-600 border border-indigo-200 rounded-xl px-3 py-1.5 hover:bg-indigo-50 transition-all">
              Xem tất cả
            </button>
          </div>
          <div className="divide-y divide-nquoc-border">
            {MOCK_RETENTION.top_risks.map((m) => {
              const isUrgent = m.stuck_days >= 14
              const isWarning = m.stuck_days >= 7 && m.stuck_days < 14

              return (
                <div key={m.id} className="group hover:bg-nquoc-hover transition-colors">
                  <div className="flex items-center gap-4 px-6 py-4">
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0
                      ${m.risk === 'high' ? 'bg-rose-500' : 'bg-amber-500'}`}>
                      {m.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-nquoc-text truncate">{m.name}</p>
                      <p className="text-[11px] text-nquoc-muted">{m.team}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${isUrgent ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-slate-500'}`}>
                        {m.stuck_days > 0 ? `${m.stuck_days} ngày` : '—'}
                      </p>
                      {isUrgent && (
                        <p className="text-[9px] font-bold text-rose-500 uppercase animate-pulse">URGENT</p>
                      )}
                      {isWarning && (
                        <p className="text-[9px] font-bold text-amber-500 uppercase">WARNING</p>
                      )}
                    </div>
                    {m.risk === 'high' && (
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isUrgent ? 'bg-rose-500 animate-pulse' : 'bg-amber-400'}`} />
                    )}
                  </div>
                  {/* AI Emotional State */}
                  {m.stuck_days > 0 && (
                    <div className="px-6 pb-3">
                      <p className="text-[11px] text-slate-500 italic flex items-start gap-1.5 bg-slate-50 rounded-xl px-3 py-2">
                        <span className="flex-shrink-0">🤖</span>
                        <span>{m.emotional_state}</span>
                      </p>
                      {user.role === 'hr_manager' && (
                        <button
                          onClick={() => setInterventionOpen(m.id)}
                          className={`mt-2 text-[11px] font-bold w-full py-1.5 rounded-xl transition-all active:scale-95
                            ${isUrgent
                              ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-soft'
                              : 'bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100'
                            }`}
                        >
                          {isUrgent ? '🚨 Can thiệp ngay (1 click)' : '🤝 Lên kế hoạch hỗ trợ'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Culture Stories Feed */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-widest">Mới nhất</p>
              <h2 className="text-base font-bold text-nquoc-text font-header">Bảng tin văn hóa</h2>
            </div>
            <button onClick={() => navigate('/culture')}
              className="text-xs font-bold text-indigo-600 border border-indigo-200 rounded-xl px-3 py-1.5 hover:bg-indigo-50 transition-all">
              Xem tất cả
            </button>
          </div>
          {MOCK_CULTURE.latest_stories.map((story) => (
            <div key={story.id} className="bg-white rounded-[28px] border border-nquoc-border p-5 shadow-card card-lift">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-xl bg-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {story.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-nquoc-text truncate">{story.name}</p>
                  <p className="text-[10px] text-nquoc-muted">{story.team}</p>
                </div>
                <Badge variant={story.courage === 'breakthrough' ? 'emerald' : 'indigo'} size="sm">
                  {story.type}
                </Badge>
              </div>
              <p className="text-xs text-nquoc-muted leading-relaxed line-clamp-2">{story.content}</p>
              {/* Culture-specific reactions */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-nquoc-border">
                {[
                  { icon: '🔥', key: 'fire', label: 'Bùng cháy' },
                  { icon: '💪', key: 'brave', label: 'Dám làm' },
                  { icon: '🙌', key: 'respect', label: 'Tôn trọng' },
                ].map(r => (
                  <span key={r.key} className="flex items-center gap-1 text-[11px] text-nquoc-muted hover:text-slate-700 cursor-pointer transition-colors" title={r.label}>
                    {r.icon} <span className="font-medium">{story.reactions[r.key as keyof typeof story.reactions]}</span>
                  </span>
                ))}
                <div className="ml-auto">
                  <Badge variant="emerald" size="sm">+{story.xp} XP</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rewrite Lab Quick */}
        <div className="col-span-12 lg:col-span-3 bg-white rounded-[32px] border border-nquoc-border p-6 shadow-card flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 flex items-center justify-center text-base">✍️</div>
            <div>
              <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-widest">Real-time Lab</p>
              <p className="text-sm font-bold text-nquoc-text font-header">Giao tiếp thẳng</p>
            </div>
          </div>
          <p className="text-xs text-nquoc-muted leading-relaxed mb-3">
            Gõ tin nhắn → hệ thống highlight rào cản <strong>ngay lập tức</strong>. Không cần click.
          </p>
          {/* Live mini rewrite widget preview */}
          <MiniRewritePreview onExpand={() => navigate('/passport')} />
        </div>
      </div>

      {/* ── Pillars Banner ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: '⚡', label: 'Dám Làm', desc: 'Chuyển dịch từ quan sát sang chủ động', color: 'from-indigo-500 to-violet-600', xp: '+30 XP' },
          { icon: '💥', label: 'Dám Sai', desc: 'Công khai bài học từ sai lầm để đội ngũ cùng lớn', color: 'from-rose-500 to-pink-600', xp: '+20 XP' },
          { icon: '🎯', label: 'Nói Thẳng', desc: 'Loại bỏ sự im lặng độc hại và ngôn ngữ mơ hồ', color: 'from-emerald-500 to-teal-600', xp: '+15 XP' },
        ].map((pillar) => (
          <div key={pillar.label} className={`bg-gradient-to-br ${pillar.color} rounded-[28px] p-6 text-white card-lift relative overflow-hidden`}>
            <div className="absolute -right-4 -bottom-4 text-6xl opacity-10 pointer-events-none">{pillar.icon}</div>
            <div className="relative z-10">
              <span className="text-2xl mb-3 block">{pillar.icon}</span>
              <h3 className="text-base font-bold font-header">{pillar.label}</h3>
              <p className="text-xs opacity-80 mt-1 leading-relaxed">{pillar.desc}</p>
              <div className="mt-3">
                <Badge variant="emerald" size="sm" className="border-white/30 bg-white/20 text-white">{pillar.xp}</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 1-click Intervention Modal */}
      {interventionOpen && (
        <QuickInterventionModal
          member={MOCK_RETENTION.top_risks.find(m => m.id === interventionOpen)!}
          onClose={() => setInterventionOpen(null)}
        />
      )}
    </div>
  )
}

// ── Mini Rewrite Preview Widget ──
const PATTERNS = {
  silence: /không sao|bình thường thôi|ok em|dạ được|để em xem|có lẽ|em sẽ cố|ngại|sợ/gi,
  vague: /sẽ cố gắng|sẽ làm|sẽ xem|hy vọng|mong là|có thể|thử xem|cố thôi/gi,
  direct: /tôi không đồng ý|cụ thể là|tôi cần|deadline là|vì lý do|tôi sẽ gửi lúc/gi,
}

const REWRITE_HINTS: Record<string, string> = {
  'không sao': '"tôi thấy có vấn đề ở điểm X"',
  'sẽ cố gắng': '"cam kết hoàn thành vào [giờ cụ thể]"',
  'hy vọng': '"xác nhận mốc [ngày]"',
  'để em xem': '"[tên] sẽ phản hồi vào lúc [giờ]"',
}

function MiniRewritePreview({ onExpand }: { onExpand: () => void }) {
  const [text, setText] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const analyze = useCallback((val: string) => {
    if (val.length < 3) { setScore(null); return }
    let s = 50
    const sil = val.match(PATTERNS.silence) || []
    const vag = val.match(PATTERNS.vague) || []
    const dir = val.match(PATTERNS.direct) || []
    s -= sil.length * 15
    s -= vag.length * 10
    s += dir.length * 20
    if (/\d{1,2}[:h]\d{0,2}/i.test(val)) s += 15
    setScore(Math.max(0, Math.min(100, s)))
  }, [])

  const handleChange = (val: string) => {
    setText(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => analyze(val), 200)
  }

  const scoreColor = score === null ? '#94a3b8' : score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#e11d48'
  const scoreLabel = score === null ? '—' : score >= 70 ? 'Thẳng thắn' : score >= 50 ? 'Mơ hồ' : 'Im lặng'

  // Find first bad pattern to suggest hint
  const firstBad = text ? Object.keys(REWRITE_HINTS).find(k => text.toLowerCase().includes(k)) : null

  return (
    <div className="flex-1 flex flex-col gap-2">
      <div className="relative flex-1">
        <textarea
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Gõ tin nhắn để kiểm tra..."
          className="w-full h-20 border-2 border-nquoc-border rounded-2xl px-3 py-2.5 text-xs text-nquoc-text resize-none
            focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all placeholder-slate-300"
        />
        {score !== null && (
          <div
            className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold text-white transition-all"
            style={{ backgroundColor: scoreColor }}
          >
            {score} {scoreLabel}
          </div>
        )}
      </div>
      {firstBad && REWRITE_HINTS[firstBad] && (
        <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 leading-relaxed">
          💡 Thay <strong>"{firstBad}"</strong> → {REWRITE_HINTS[firstBad]}
        </div>
      )}
      <button
        onClick={onExpand}
        className="mt-1 w-full py-2.5 bg-gradient-indigo text-white rounded-2xl text-xs font-bold hover:opacity-90 transition-all active:scale-95 shadow-nquoc"
      >
        Mở Rewrite Lab đầy đủ →
      </button>
    </div>
  )
}

// ── 1-click Quick Intervention Modal ──
function QuickInterventionModal({ member, onClose }: {
  member: { id: string; name: string; team: string; stuck_days: number; emotional_state: string; last_note: string }
  onClose: () => void
}) {
  const [script, setScript] = useState(0)
  const [sent, setSent] = useState(false)
  const isUrgent = member.stuck_days >= 14

  const scripts = [
    {
      tone: 'Nhẹ nhàng & Quan tâm',
      icon: '🤝',
      msg: `"Mình để ý ${member.name} có vẻ đang bận tâm điều gì đó. Mình có thể nghe bạn kể không? Không cần phải có giải pháp ngay — chỉ cần nói ra là okay."`,
    },
    {
      tone: 'Trực tiếp & Rõ ràng',
      icon: '🎯',
      msg: `"${member.name}, ${member.last_note}. Mình muốn ngồi với bạn 15 phút để hiểu rõ hơn và tìm giải pháp cùng nhau. Bạn có thể sắp xếp hôm nay không?"`,
    },
    {
      tone: 'Khẩn cấp (${member.stuck_days} ngày)',
      icon: '🚨',
      msg: `"${member.name} — mình cần nói thẳng: team nhận thấy có điều gì đó đang chặn bạn ${member.stuck_days} ngày rồi. Mình không phán xét — nhưng cần hiểu để hỗ trợ. Họp ngay hôm nay nhé?"`,
    },
  ]

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className={`p-6 ${isUrgent ? 'bg-rose-50 border-b border-rose-100' : 'bg-indigo-50 border-b border-indigo-100'}`}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-[10px] font-bold uppercase tracking-widest ${isUrgent ? 'text-rose-600' : 'text-indigo-600'}`}>
              {isUrgent ? '🚨 Can thiệp khẩn cấp' : '🤝 Kế hoạch hỗ trợ'}
            </p>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
          </div>
          <h3 className="text-lg font-bold text-nquoc-text font-header">{member.name}</h3>
          <p className="text-xs text-nquoc-muted">{member.team} · Bế tắc {member.stuck_days} ngày</p>
          <div className="mt-3 bg-white rounded-xl p-3 flex items-start gap-2">
            <span className="text-sm flex-shrink-0">🤖</span>
            <p className="text-xs text-slate-600 italic">{member.emotional_state}</p>
          </div>
        </div>

        {!sent ? (
          <div className="p-6 space-y-4">
            <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-widest">Chọn script giao tiếp:</p>
            <div className="space-y-2">
              {scripts.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setScript(i)}
                  className={`w-full text-left p-4 rounded-2xl border-2 text-xs leading-relaxed transition-all ${
                    script === i
                      ? 'border-indigo-400 bg-indigo-50'
                      : 'border-nquoc-border hover:bg-nquoc-hover'
                  }`}
                >
                  <p className="font-bold text-nquoc-text mb-1">{s.icon} {s.tone}</p>
                  <p className="text-nquoc-muted italic">{s.msg}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setSent(true)}
              className={`w-full py-3.5 text-white rounded-2xl text-sm font-bold transition-all active:scale-95 shadow-nquoc
                ${isUrgent ? 'bg-rose-500 hover:bg-rose-600' : 'bg-gradient-indigo hover:opacity-90'}`}
            >
              🚀 Gửi kế hoạch can thiệp
            </button>
          </div>
        ) : (
          <div className="p-6 text-center space-y-4 animate-bounce-in">
            <div className="text-5xl">✅</div>
            <p className="font-bold text-nquoc-text font-header">Đã ghi nhận!</p>
            <p className="text-xs text-nquoc-muted leading-relaxed">Leader {member.name.split(' ')[0]} đã được thông báo. Hệ thống sẽ theo dõi trong 48h.</p>
            <button onClick={onClose} className="w-full py-3 bg-gradient-indigo text-white rounded-2xl text-sm font-bold transition-all shadow-nquoc">
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
