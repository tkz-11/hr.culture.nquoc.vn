import React, { useState, useEffect } from 'react'
import type { AuthUser, PassportProfile, CommHeatmapEntry, AnalyzeResult, RewriteResult, LeaderIntegrity } from '../../../shared/types'
import { passportService } from '../services/passport.service'
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner'
import { Badge } from '../../../shared/components/Badge'
import { LineChart } from '../../../shared/components/LineChart'
import { RadarChart } from '../../../shared/components/RadarChart'
import { HRPassportDashboard } from '../components/HRPassportDashboard'
import { Skeleton } from '../../../shared/components/Skeleton'

interface PassportPageProps {
  user: AuthUser
}

type TabKey = 'member' | 'leader' | 'mirror' | 'train' | 'hr_dashboard'

const tabs: { key: TabKey; label: string; icon: string; roles?: string[] }[] = [
  { key: 'member', label: 'Bảng thành viên', icon: '👤' },
  { key: 'leader', label: 'Bảng leader', icon: '🎖️', roles: ['leader', 'hr_manager'] },
  { key: 'hr_dashboard', label: 'Quản trị HR', icon: '📊', roles: ['hr_manager'] },
  { key: 'mirror', label: 'Đối chiếu', icon: '🔭' },
  { key: 'train', label: 'Rewrite Lab', icon: '✍️' },
]

export function PassportPage({ user }: PassportPageProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('member')

  const visibleTabs = tabs.filter((t) => !t.roles || t.roles.includes(user.role))

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center text-sm">🗂️</div>
            <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-widest">HR Tool</p>
          </div>
          <h1 className="text-2xl font-bold text-nquoc-text font-header">Communication Passport</h1>
          <p className="text-sm text-nquoc-muted mt-1">Rèn luyện giao tiếp thẳng thắn · Xây dựng văn hóa nói thật trong tổ chức</p>
        </div>
      </div>

      {/* Tab nav — Premium pill style */}
      <div className="flex gap-1.5 flex-wrap">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            id={`tab-${tab.key}`}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-gradient-indigo text-white shadow-nquoc scale-105'
                : 'bg-white text-nquoc-muted border border-nquoc-border hover:text-nquoc-text hover:bg-nquoc-hover'
            }`}
          >
            <span className="text-base leading-none">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in" key={activeTab}>
        {activeTab === 'member' && <MemberDashboard user={user} />}
        {activeTab === 'leader' && <LeaderDashboard user={user} />}
        {activeTab === 'mirror' && (
          <div className="bg-white rounded-[32px] border border-nquoc-border p-16 text-center shadow-card">
            <div className="text-6xl mb-5 animate-float inline-block">🔭</div>
            <h3 className="text-xl font-bold text-nquoc-text font-header">Tính năng đang phát triển</h3>
            <p className="text-sm text-nquoc-muted mt-3 max-w-sm mx-auto leading-relaxed">
              Bảng đối chiếu chung sẽ ra mắt sớm để so sánh chuẩn mực giao tiếp giữa các team.
            </p>
          </div>
        )}
        {activeTab === 'train' && <RewriteLab />}
        {activeTab === 'hr_dashboard' && <HRPassportDashboard />}
      </div>
    </div>
  )
}

// ── Member Dashboard ──
function MemberDashboard({ user: _user }: { user: AuthUser }) {
  const [data, setData] = useState<{
    profile: PassportProfile
    heatmap: CommHeatmapEntry[]
    scenarios_done: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTraining, setShowTraining] = useState(false)

  useEffect(() => {
    passportService.getMe().then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-48 rounded-[32px]" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-24 rounded-[28px]" />
        <Skeleton className="h-24 rounded-[28px]" />
        <Skeleton className="h-24 rounded-[28px]" />
      </div>
    </div>
  )
  if (!data) return null

  const { profile, heatmap } = data

  return (
    <div className="space-y-5">
      {/* Hero XP Card */}
      <div className="relative overflow-hidden bg-gradient-indigo rounded-[32px] p-8 text-white shadow-nquoc-lg noise">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Culture Score</p>
              <h2 className="text-4xl font-extrabold font-header">{profile.culture_xp} <span className="text-xl font-bold opacity-60">XP</span></h2>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="emerald" size="sm" className="bg-white/20 border-white/20 text-white font-bold">
                  🔥 {profile.streak_days} ngày liên tiếp
                </Badge>
                <p className="text-xs opacity-70">Cấp: Người học việc</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowTraining(true)}
                className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-2xl text-sm font-bold border border-white/20 transition-all active:scale-95 backdrop-blur-sm"
              >
                📖 Bài luyện tập
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-2 opacity-70">
              <span>Tiến trình cấp độ</span>
              <span>{profile.culture_xp % 100}/100 XP</span>
            </div>
            <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-1000"
                style={{ width: `${profile.culture_xp % 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid + Safety Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 space-y-3">
          {[
            { label: 'Điểm giao tiếp', value: profile.directness_score.toFixed(1), unit: '/10', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: '🎯' },
            { label: 'Streak hiện tại', value: String(profile.streak_days), unit: 'ngày', color: 'text-amber-600', bg: 'bg-amber-50', icon: '🔥' },
            { label: 'Kịch bản hoàn thành', value: String(data.scenarios_done), unit: 'buổi', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '🎭' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-[24px] p-5 border border-white card-lift`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{stat.icon}</span>
                <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-wider">{stat.label}</p>
              </div>
              <p className={`text-3xl font-extrabold font-header leading-none ${stat.color}`}>
                {stat.value}<span className="text-sm font-normal text-nquoc-muted ml-1">{stat.unit}</span>
              </p>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2 bg-white rounded-[32px] border border-nquoc-border p-7 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-widest">Biểu đồ xu hướng</p>
              <h3 className="text-base font-bold text-nquoc-text font-header mt-0.5">Chỉ số an toàn tâm lý</h3>
            </div>
            <Badge variant="emerald" size="sm">7 ngày gần nhất</Badge>
          </div>
          <div className="h-[190px]">
            <LineChart
              labels={['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']}
              datasets={[{
                label: 'Safety Index',
                data: [7.2, 7.5, 7.1, 7.8, 8.2, 8.0, 8.5],
                color: '#10b981',
                fill: true,
              }]}
              max={10}
            />
          </div>
        </div>
      </div>

      {/* Culture Heatmap */}
      <div className="bg-white rounded-[32px] border border-nquoc-border p-8 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-widest">Hoạt động 14 ngày</p>
            <h2 className="text-base font-bold text-nquoc-text font-header mt-0.5">Bản đồ nhiệt văn hóa</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-indigo-100" />
              <span className="text-[10px] font-medium text-nquoc-muted">Thấp</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-indigo-600" />
              <span className="text-[10px] font-medium text-nquoc-muted">Cao</span>
            </div>
          </div>
        </div>
        <HeatmapGrid heatmap={heatmap} />
      </div>

      {/* Silence Cost Calculator */}
      <SilenceCostCalc />

      {showTraining && <TrainingSlides onClose={() => setShowTraining(false)} />}
    </div>
  )
}

// ── Heatmap Grid ──
function HeatmapGrid({ heatmap }: { heatmap: CommHeatmapEntry[] }) {
  const rows = [
    { label: 'Tuân thủ Deadline', key: 'deadline_met' as const, type: 'bool' },
    { label: 'Tương tác WYFL', key: 'wyfl_done' as const, type: 'bool' },
    { label: 'Không dùng từ cấm', key: 'banned_word_count' as const, type: 'banned' },
  ]

  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div key={row.key} className="flex items-center gap-4">
          <span className="text-xs text-nquoc-muted font-medium w-44 flex-shrink-0">{row.label}</span>
          <div className="flex gap-1.5 flex-wrap">
            {heatmap.map((entry, i) => {
              let intensity = 0
              if (row.type === 'bool') {
                intensity = entry[row.key as 'deadline_met' | 'wyfl_done'] ? 1 : 0.12
              } else {
                const count = entry.banned_word_count
                intensity = count === 0 ? 1 : count <= 2 ? 0.5 : 0.12
              }
              return (
                <div
                  key={i}
                  title={entry.date}
                  className="w-5 h-5 rounded-md transition-all hover:scale-110"
                  style={{ backgroundColor: `rgba(79, 70, 229, ${intensity})` }}
                />
              )
            })}
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between text-[10px] text-nquoc-muted pt-2 border-t border-nquoc-border">
        <span className="font-bold">← 14 NGÀY TRƯỚC</span>
        <span>THẤP ←→ CAO</span>
        <span className="font-bold">HÔM NAY →</span>
      </div>
    </div>
  )
}

// ── Silence Cost Calculator ──
function SilenceCostCalc() {
  const [days, setDays] = useState(3)
  const [people, setPeople] = useState(5)
  const [severity, setSeverity] = useState(3)

  const wastedHours = (days * people * severity * 0.5).toFixed(1)
  const directMinutes = 15

  return (
    <div className="bg-amber-50 border border-amber-100 rounded-[32px] p-8 shadow-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-xl">💰</div>
        <div>
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Công cụ tính toán</p>
          <h2 className="text-base font-bold text-amber-900 font-header">Chi phí im lặng</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-7">
        <div>
          <label className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block mb-2">Số ngày giữ im</label>
          <input type="number" min={1} max={30} value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full border-2 border-amber-200 rounded-2xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all font-bold text-amber-900"
          />
        </div>
        <div>
          <label className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block mb-2">Số người ảnh hưởng</label>
          <input type="number" min={1} max={100} value={people}
            onChange={(e) => setPeople(Number(e.target.value))}
            className="w-full border-2 border-amber-200 rounded-2xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all font-bold text-amber-900"
          />
        </div>
        <div>
          <label className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block mb-2">
            Mức độ bế tắc: <span className="text-amber-600">{severity}/5</span>
          </label>
          <input type="range" min={1} max={5} value={severity}
            onChange={(e) => setSeverity(Number(e.target.value))}
            className="w-full mt-3 h-2 rounded-lg cursor-pointer accent-amber-600"
          />
          <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-2 text-center">
            {severity > 3 ? '🔴 Nghiêm trọng' : severity > 1 ? '🟡 Trung bình' : '🟢 Nhẹ'}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[28px] p-6 border border-amber-100 shadow-inner">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-wider mb-1">Im lặng {days} ngày tốn</p>
            <p className="text-3xl font-extrabold text-rose-600 font-header">{wastedHours}h</p>
            <p className="text-xs text-nquoc-muted mt-1">thời gian lãng phí</p>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-2xl">VS</div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-wider mb-1">Nói thẳng chỉ cần</p>
            <p className="text-3xl font-extrabold text-emerald-600 font-header">{directMinutes}p</p>
            <p className="text-xs text-nquoc-muted mt-1">để nói rõ vấn đề</p>
          </div>
        </div>
        <p className="text-center text-sm font-bold text-amber-800 mt-5 pt-4 border-t border-amber-100">
          🚀 Một câu nói thẳng sớm = tiết kiệm <span className="text-rose-600">{wastedHours}h</span> cho cả team!
        </p>
      </div>
    </div>
  )
}

// ── Leader Dashboard ──
function LeaderDashboard({ user }: { user: AuthUser }) {
  const [leaderData, setLeaderData] = useState<{
    integrity: LeaderIntegrity
    vague_phrases_this_week: string[]
    improvement_suggestions: string[]
  } | null>(null)

  useEffect(() => {
    passportService.getLeaderProfile(user.id).then(setLeaderData)
  }, [user.id])

  if (!leaderData) return <LoadingSpinner />

  const score = (leaderData.integrity.integrity_score * 100).toFixed(0)

  return (
    <div className="space-y-5">
      {/* Score Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 to-purple-700 rounded-[32px] p-8 text-white shadow-nquoc-lg noise">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">
              Trước khi xem data của team — đây là data của bạn.
            </p>
            <p className="text-5xl font-extrabold font-header">{score} <span className="text-xl font-bold opacity-60">/ 100</span></p>
            <p className="text-sm opacity-80 mt-1">Điểm liêm chính của leader</p>
          </div>
          <div className="glass rounded-2xl px-6 py-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">Xếp hạng</p>
            <p className="text-2xl font-bold">{Number(score) >= 70 ? '🥇 Tốt' : Number(score) >= 50 ? '🥈 Khá' : '🥉 Cần cải thiện'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Integrity Radar */}
        <div className="bg-white rounded-[32px] border border-nquoc-border p-8 shadow-card">
          <div className="mb-5">
            <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-widest mb-0.5">Integrity Matrix</p>
            <h3 className="text-base font-bold text-nquoc-text font-header">Ma trận liêm chính Leader</h3>
          </div>
          <div className="h-[280px]">
            <RadarChart
              labels={['Phản hồi', 'WYFLS', 'Ngôn ngữ', 'Kịch bản', 'Thẳng thắn']}
              data={[
                leaderData.integrity.feedback_timeliness || 7,
                leaderData.integrity.wyfl_compliance || 8,
                leaderData.integrity.language_standard || 6,
                leaderData.integrity.scenario_completion || 9,
                leaderData.integrity.directness || 5,
              ]}
              max={10}
              color="#8b5cf6"
            />
          </div>
        </div>

        {/* Suggestions */}
        <div className="space-y-4">
          <div className="bg-white rounded-[32px] border border-nquoc-border p-7 shadow-card">
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-5 flex items-center gap-2">
              <span>✨</span> Gợi ý từ AI
            </p>
            <div className="space-y-3">
              {leaderData.improvement_suggestions.map((s, i) => (
                <div key={i} className="flex gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-nquoc-muted leading-relaxed
                  group hover:border-indigo-200 hover:bg-indigo-50 transition-all cursor-default">
                  <span className="text-indigo-500 font-bold text-lg leading-none group-hover:scale-125 transition-transform mt-0.5">→</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[28px] p-6 text-white">
            <p className="text-2xl mb-3">💡</p>
            <p className="text-sm leading-relaxed opacity-90 italic">
              "Leader là người đặt chuẩn ngôn ngữ cho cả team. Khi leader nói thẳng, cả tổ chức sẽ chuyển động nhanh hơn."
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Rewrite Lab — Split Panel ──
function RewriteLab() {
  const [inputText, setInputText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [rewrite, setRewrite] = useState<RewriteResult | null>(null)
  const [showTraining, setShowTraining] = useState(false)

  const handleAnalyze = async () => {
    if (!inputText.trim()) return
    setAnalyzing(true)
    try {
      const [analysisResult, rewriteResult] = await Promise.all([
        passportService.analyze(inputText),
        passportService.rewrite(inputText),
      ])
      setResult(analysisResult)
      setRewrite(rewriteResult)
    } finally {
      setAnalyzing(false)
    }
  }

  const ratingConfig: Record<string, { color: string; bg: string; icon: string; label: string }> = {
    direct:         { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: '🟢', label: 'Thẳng thắn' },
    vague:          { color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',   icon: '🟡', label: 'Mơ hồ' },
    silent:         { color: 'text-rose-700',    bg: 'bg-rose-50 border-rose-200',     icon: '🔴', label: 'Im lặng' },
    'face-saving':  { color: 'text-orange-700',  bg: 'bg-orange-50 border-orange-200', icon: '🟠', label: 'Mặt nạ' },
  }

  return (
    <div className="space-y-5">
      {/* Lab header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-sm">✍️</div>
            <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-widest">Phòng thực hành</p>
          </div>
          <h2 className="text-xl font-bold text-nquoc-text font-header">Rewrite Lab</h2>
          <p className="text-sm text-nquoc-muted mt-1">Nhập tin nhắn bạn định gửi — AI phát hiện rào cản & viết lại theo chuẩn "Nói thẳng"</p>
        </div>
        <button
          onClick={() => setShowTraining(true)}
          className="text-xs font-bold text-indigo-600 border border-indigo-200 rounded-xl px-4 py-2 hover:bg-indigo-50 transition-all whitespace-nowrap"
        >
          📖 Ôn lý thuyết
        </button>
      </div>

      {/* Pattern legend */}
      <div className="flex gap-3 flex-wrap">
        {[
          { icon: '🔴', label: 'Im lặng', example: '"không sao ạ"', cls: 'bg-rose-50 border-rose-200 text-rose-700' },
          { icon: '🟡', label: 'Mơ hồ', example: '"sẽ cố gắng"', cls: 'bg-amber-50 border-amber-200 text-amber-700' },
          { icon: '🟢', label: 'Thẳng thắn', example: '"Tôi cần X lúc Y"', cls: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
        ].map((p) => (
          <div key={p.label} className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold ${p.cls}`}>
            <span>{p.icon}</span>
            <span>{p.label}</span>
            <span className="opacity-60 font-normal italic">— {p.example}</span>
          </div>
        ))}
      </div>

      {/* Split panel */}
      <div className={`grid gap-5 ${result ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>

        {/* Left: Input */}
        <div className="bg-white rounded-[32px] border border-nquoc-border p-7 shadow-card space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-widest">Tin nhắn nháp của bạn</p>
          </div>
          <textarea
            id="rewrite-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ví dụ: Tôi sẽ cố hoàn thành sớm, hy vọng xong trước cuối tuần thôi ạ. Không sao nếu quá deadline..."
            className="w-full h-36 border-2 border-nquoc-border rounded-2xl px-4 py-3.5 text-sm text-nquoc-text resize-none
              focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all placeholder-slate-300"
          />

          {result && (
            <div className="mt-2">
              <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-wider mb-2">Highlight rào cản:</p>
              <div className="text-sm leading-relaxed p-3 bg-nquoc-bg rounded-xl">
                <PatternHighlight text={inputText} patterns={result.patterns_detected} />
              </div>
            </div>
          )}

          <button
            id="analyze-btn"
            onClick={handleAnalyze}
            disabled={!inputText.trim() || analyzing}
            className="w-full py-3.5 bg-gradient-indigo text-white rounded-2xl text-sm font-bold
              hover:opacity-90 disabled:opacity-40 transition-all active:scale-95 shadow-nquoc
              flex items-center justify-center gap-2"
          >
            {analyzing ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Đang phân tích...
              </>
            ) : (
              '🔍 Phân tích & Viết lại'
            )}
          </button>
        </div>

        {/* Right: Result */}
        {result && rewrite && (
          <div className="bg-white rounded-[32px] border border-nquoc-border p-7 shadow-card space-y-5 animate-slide-up">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-widest">Bản viết lại (Direct & Honest)</p>
            </div>

            {/* Rating */}
            <div className={`flex items-center gap-3 p-3.5 rounded-2xl border ${ratingConfig[result.rating]?.bg ?? 'bg-slate-50 border-slate-200'}`}>
              <span className="text-xl">{ratingConfig[result.rating]?.icon ?? '⚪'}</span>
              <div>
                <p className={`text-sm font-bold ${ratingConfig[result.rating]?.color ?? 'text-nquoc-text'}`}>
                  {ratingConfig[result.rating]?.label}
                </p>
                <p className="text-xs text-nquoc-muted">{result.xp_delta >= 0 ? '+' : ''}{result.xp_delta} XP</p>
              </div>
            </div>

            {/* Rewritten */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <p className="text-sm text-emerald-900 leading-relaxed font-medium">{rewrite.rewritten}</p>
            </div>

            {/* Suggestion */}
            {result.rewrite_suggestion && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                <p className="text-xs font-bold text-indigo-600 mb-1">💡 Lý do:</p>
                <p className="text-xs text-indigo-800 leading-relaxed">{result.rewrite_suggestion}</p>
              </div>
            )}

            {/* Copy button */}
            <button
              onClick={() => navigator.clipboard.writeText(rewrite.rewritten)}
              className="w-full py-2.5 border border-nquoc-border text-nquoc-muted rounded-2xl text-xs font-bold hover:bg-nquoc-hover transition-all"
            >
              📋 Copy bản viết lại
            </button>
          </div>
        )}
      </div>

      {showTraining && <TrainingSlides onClose={() => setShowTraining(false)} />}
    </div>
  )
}

// ── Pattern Highlighter ──
function PatternHighlight({ text, patterns }: {
  text: string
  patterns: { type: string; snippet: string }[]
}) {
  if (patterns.length === 0) {
    return <span className="hl-direct">{text}</span>
  }

  const parts: React.ReactNode[] = []
  let remaining = text
  let lastIndex = 0

  for (const pattern of patterns) {
    const idx = remaining.toLowerCase().indexOf(pattern.snippet.toLowerCase())
    if (idx !== -1) {
      const cls = pattern.type === 'silent' ? 'hl-silence' : pattern.type === 'vague' ? 'hl-vague' : 'hl-direct'
      parts.push(text.slice(lastIndex, lastIndex + idx))
      parts.push(<span key={idx} className={cls}>{text.slice(lastIndex + idx, lastIndex + idx + pattern.snippet.length)}</span>)
      lastIndex += idx + pattern.snippet.length
      remaining = remaining.slice(idx + pattern.snippet.length)
    }
  }
  parts.push(remaining)
  return <>{parts}</>
}

// ── Training Slides ──
function TrainingSlides({ onClose }: { onClose: () => void }) {
  const [slide, setSlide] = useState(0)
  const [countdown, setCountdown] = useState(5)
  const isLastSlide = slide === 2

  useEffect(() => {
    if (isLastSlide && countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [isLastSlide, countdown])

  const slides = [
    {
      title: '2000 năm lập trình hành vi',
      content: 'Văn hóa Nho giáo dạy chúng ta giữ hòa khí, tránh đối đầu. Nhưng trong tổ chức hiện đại, im lặng không phải là tôn trọng — im lặng là rào cản phát triển.',
      emoji: '🧠',
      tag: 'Bối cảnh',
    },
    {
      title: 'Khi bạn im lặng, bạn đang gánh hộ',
      content: 'Mỗi ngày bạn không nói ra vấn đề, cả team phải gánh thêm chi phí ẩn: deadline trễ, rework, hiểu nhầm chồng chất. Im lặng không phải lịch sự — đó là chuyển rủi ro cho người khác.',
      emoji: '⚖️',
      tag: 'Chi phí',
    },
    {
      title: 'Nói thẳng sớm = tử tế nhất',
      content: 'Nói thẳng không phải vô lễ. Nói thẳng sớm = cho team cơ hội điều chỉnh sớm. Câu nói thẳng thắn nhất là câu nói ra sớm nhất, với thông tin rõ ràng và cụ thể nhất.',
      emoji: '💚',
      tag: 'Hành động',
    },
  ]

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-fade-in"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.96)' }}
    >
      <div className="w-full max-w-lg bg-slate-800 rounded-[32px] p-8 space-y-7 shadow-2xl border border-slate-700">
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <div key={i} className={`transition-all duration-300 rounded-full ${
              i === slide ? 'w-8 h-2 bg-emerald-400' : 'w-2 h-2 bg-slate-600'
            }`} />
          ))}
        </div>

        {/* Slide */}
        <div className="text-center space-y-4" key={slide}>
          <div className="w-20 h-20 rounded-[24px] bg-slate-700 flex items-center justify-center text-5xl mx-auto">
            {slides[slide].emoji}
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{slides[slide].tag}</span>
            <h2 className="text-xl font-bold text-white font-header mt-2">{slides[slide].title}</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">{slides[slide].content}</p>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          {slide > 0 && (
            <button
              onClick={() => setSlide(s => s - 1)}
              className="flex-1 py-3 border border-slate-600 text-slate-300 rounded-2xl text-sm font-medium hover:border-slate-400 transition-colors"
            >
              ← Quay lại
            </button>
          )}
          {!isLastSlide ? (
            <button
              onClick={() => setSlide(s => s + 1)}
              className="flex-1 py-3 bg-emerald-500 text-white rounded-2xl text-sm font-bold hover:bg-emerald-600 transition-all active:scale-95"
            >
              Tiếp theo →
            </button>
          ) : (
            <button
              onClick={onClose}
              disabled={countdown > 0}
              className="flex-1 py-3 bg-emerald-500 text-white rounded-2xl text-sm font-bold hover:bg-emerald-600 disabled:opacity-60 transition-all active:scale-95"
            >
              {countdown > 0 ? `Tôi hiểu — bắt đầu (${countdown}s)` : '✅ Bắt đầu luyện tập!'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
