import React, { useState, useEffect, useRef, useCallback } from 'react'
import type { AuthUser, PassportProfile, CommHeatmapEntry, AnalyzeResult, RewriteResult, LeaderIntegrity } from '../../../shared/types'
import { passportService } from '../services/passport.service'
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner'
import { Badge } from '../../../shared/components/Badge'
import { LineChart } from '../../../shared/components/LineChart'
import { RadarChart } from '../../../shared/components/RadarChart'
import { HRPassportDashboard } from '../components/HRPassportDashboard'
import { Skeleton } from '../../../shared/components/Skeleton'
import { CultureHeatmap } from '../../../shared/components/CultureHeatmap'

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

  const { profile } = data
  const streakDays = profile.streak_days

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

      {/* Culture Heatmap — upgraded */}
      <CultureHeatmap streakDays={streakDays} />


      {showTraining && <TrainingSlides onClose={() => setShowTraining(false)} />}
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

// ── Regex Engine (real-time) ──
const RT_PATTERNS = {
  silence: /không sao|bình thường thôi|ok em|dạ được|chờ xem|thôi bỏ qua|để em xem|có lẽ|em sẽ cố|ngại|sợ offend/gi,
  vague:   /sẽ cố gắng|sẽ làm|sẽ xem|hy vọng|mong là|có thể|thử xem|cố thôi/gi,
  direct:  /tôi không đồng ý|cụ thể là|tôi cần|deadline là|vì lý do|giải pháp là|tôi sẽ gửi lúc|tôi không thể|tôi đề xuất/gi,
  faceSave:/ngại quá|người ta nghĩ gì|thôi không sao|để sau tính|không muốn làm khó/gi,
}

const REWRITE_MAP: Record<string, string> = {
  'không sao': 'tôi thấy có vấn đề ở điểm X',
  'sẽ cố gắng': 'cam kết hoàn thành vào [giờ cụ thể]',
  'hy vọng': 'xác nhận mốc [ngày]',
  'để em xem': '[Tên] sẽ phản hồi vào lúc [giờ]',
  'bình thường thôi': 'thực ra tôi thấy...',
  'ok em': 'tôi cần thêm thông tin về X trước khi xác nhận',
}

function computeScore(text: string) {
  if (!text || text.trim().length < 3) return null
  let score = 50
  const sil = text.match(RT_PATTERNS.silence) || []
  const vag = text.match(RT_PATTERNS.vague) || []
  const dir = text.match(RT_PATTERNS.direct) || []
  const face = text.match(RT_PATTERNS.faceSave) || []
  score -= sil.length * 15
  score -= vag.length * 10
  score -= face.length * 12
  score += dir.length * 20
  if (/\b\d{1,2}[:h]\d{0,2}\b/i.test(text)) score += 15
  return { score: Math.max(0, Math.min(100, score)), sil, vag, dir, face }
}

function buildRewriteSuggestion(text: string): string {
  let out = text
  for (const [pattern, replacement] of Object.entries(REWRITE_MAP)) {
    out = out.replace(new RegExp(pattern, 'gi'), `【${replacement}】`)
  }
  if (!/\b\d{1,2}[:h]\d{0,2}\b/i.test(text)) {
    out += ' (Cần bổ sung mốc thời gian cụ thể)'
  }
  return out
}

// ── Rewrite Lab — Real-time Behavior Coaching ──
function RewriteLab() {
  const [inputText, setInputText] = useState('')
  const [rtScore, setRtScore] = useState<ReturnType<typeof computeScore>>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [rewrite, setRewrite] = useState<RewriteResult | null>(null)
  const [showTraining, setShowTraining] = useState(false)
  const [showSilenceCalc, setShowSilenceCalc] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Real-time compute — debounced 200ms
  const handleInput = useCallback((val: string) => {
    setInputText(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setRtScore(computeScore(val)), 200)
  }, [])

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

  const scoreNum = rtScore?.score ?? null
  const scoreColor = scoreNum === null ? '#94a3b8' : scoreNum >= 70 ? '#10b981' : scoreNum >= 50 ? '#f59e0b' : '#e11d48'
  const scoreLabel = scoreNum === null ? '—' : scoreNum >= 70 ? 'Thẳng thắn ✅' : scoreNum >= 50 ? 'Mơ hồ ⚠️' : 'Im lặng 🔴'

  // First match for hint
  const firstHintKey = inputText ? Object.keys(REWRITE_MAP).find(k => inputText.toLowerCase().includes(k)) : null

  const ratingConfig: Record<string, { color: string; bg: string; icon: string; label: string }> = {
    direct:         { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: '🟢', label: 'Thẳng thắn' },
    vague:          { color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',   icon: '🟡', label: 'Mơ hồ' },
    silent:         { color: 'text-rose-700',    bg: 'bg-rose-50 border-rose-200',     icon: '🔴', label: 'Im lặng' },
    'face-saving':  { color: 'text-orange-700',  bg: 'bg-orange-50 border-orange-200', icon: '🟠', label: 'Mặt nạ' },
  }

  return (
    <div className="space-y-5">
      {/* Lab header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-sm">✍️</div>
            <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-widest">Behavior Coaching Engine</p>
          </div>
          <h2 className="text-xl font-bold text-nquoc-text font-header">Rewrite Lab</h2>
          <p className="text-sm text-nquoc-muted mt-1">Gõ tin nhắn — AI highlight <strong>ngay lập tức</strong> và gợi ý cách viết lại theo chuẩn "Nói thẳng"</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSilenceCalc(true)}
            className="text-xs font-bold text-rose-600 border border-rose-200 rounded-xl px-4 py-2 hover:bg-rose-50 transition-all whitespace-nowrap"
          >
            🔕 Chi phí im lặng
          </button>
          <button
            onClick={() => setShowTraining(true)}
            className="text-xs font-bold text-indigo-600 border border-indigo-200 rounded-xl px-4 py-2 hover:bg-indigo-50 transition-all whitespace-nowrap"
          >
            📖 Ôn lý thuyết
          </button>
        </div>
      </div>

      {/* Real-time score bar */}
      {scoreNum !== null && (
        <div className="flex items-center gap-4 p-4 bg-white border border-nquoc-border rounded-[24px] shadow-card animate-fade-in">
          <div className="flex items-center gap-3 flex-1">
            <div className="text-sm font-bold" style={{ color: scoreColor }}>Directness Score</div>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${scoreNum}%`, backgroundColor: scoreColor }}
              />
            </div>
            <div className="text-xl font-extrabold font-header tabular-nums" style={{ color: scoreColor }}>
              {scoreNum}
            </div>
          </div>
          <div className="text-xs font-bold px-3 py-1 rounded-full text-white" style={{ backgroundColor: scoreColor }}>
            {scoreLabel}
          </div>
        </div>
      )}

      {/* Pattern legend */}
      <div className="flex gap-3 flex-wrap">
        {[
          { icon: '🔴', label: 'Im lặng', example: '"không sao ạ"', cls: 'bg-rose-50 border-rose-200 text-rose-700', count: rtScore?.sil.length ?? 0 },
          { icon: '🟡', label: 'Mơ hồ', example: '"sẽ cố gắng"', cls: 'bg-amber-50 border-amber-200 text-amber-700', count: rtScore?.vag.length ?? 0 },
          { icon: '🟢', label: 'Thẳng thắn', example: '"Tôi cần X lúc Y"', cls: 'bg-emerald-50 border-emerald-200 text-emerald-700', count: rtScore?.dir.length ?? 0 },
        ].map((p) => (
          <div key={p.label} className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold ${p.cls}`}>
            <span>{p.icon}</span>
            <span>{p.label}</span>
            {p.count > 0 && <span className="font-extrabold">({p.count})</span>}
            <span className="opacity-60 font-normal italic hidden lg:inline">— {p.example}</span>
          </div>
        ))}
      </div>

      {/* Before → After Shock — side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Input with real-time highlights */}
        <div className="bg-white rounded-[32px] border border-nquoc-border p-7 shadow-card space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-widest">Bản gốc của bạn</p>
            </div>
            {scoreNum !== null && scoreNum < 70 && (
              <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wider">Cách bạn đang nói</span>
            )}
          </div>
          <textarea
            id="rewrite-input"
            value={inputText}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="Ví dụ: Tôi sẽ cố hoàn thành sớm, hy vọng xong trước cuối tuần thôi ạ. Không sao nếu quá deadline..."
            className="w-full h-36 border-2 border-nquoc-border rounded-2xl px-4 py-3.5 text-sm text-nquoc-text resize-none
              focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all placeholder-slate-300"
          />

          {/* Real-time hint */}
          {firstHintKey && REWRITE_MAP[firstHintKey] && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-2xl animate-fade-in">
              <span className="text-sm flex-shrink-0">💡</span>
              <p className="text-xs text-amber-800 leading-relaxed">
                Thay <strong>"{firstHintKey}"</strong> → <strong>"{REWRITE_MAP[firstHintKey]}"</strong>
              </p>
            </div>
          )}

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
                Đang phân tích sâu...
              </>
            ) : (
              '🔍 Phân tích chuyên sâu & Viết lại'
            )}
          </button>
        </div>

        {/* Right: Live suggestion OR API result */}
        <div className="bg-white rounded-[32px] border border-nquoc-border p-7 shadow-card space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-widest">Phiên bản Lãnh đạo</p>
            </div>
            {scoreNum !== null && scoreNum < 70 && (
              <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Cách bạn NÊN nói</span>
            )}
          </div>

          {/* Before → After Shock */}
          {inputText.length > 5 && !result && (
            <div className="space-y-3 animate-fade-in">
              {/* Mini live-rewrite */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">Gợi ý nhanh (real-time):</p>
                <p className="text-sm text-emerald-900 leading-relaxed font-medium">
                  {buildRewriteSuggestion(inputText)}
                </p>
              </div>

              {scoreNum !== null && scoreNum < 50 && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-1">🚨 Cảnh báo hành vi:</p>
                  <p className="text-xs text-rose-800 leading-relaxed">
                    Ngôn ngữ này có thể tạo ra sự mơ hồ và làm chậm quyết định của team.
                    Nhấn "Phân tích chuyên sâu" để nhận hướng dẫn đầy đủ.
                  </p>
                </div>
              )}

              <p className="text-[11px] text-nquoc-muted italic text-center">
                Nhấn "Phân tích chuyên sâu" để nhận đề xuất chi tiết từ AI
              </p>
            </div>
          )}

          {/* API Result */}
          {result && rewrite && (
            <div className="space-y-4 animate-slide-up">
              <div className={`flex items-center gap-3 p-3.5 rounded-2xl border ${ratingConfig[result.rating]?.bg ?? 'bg-slate-50 border-slate-200'}`}>
                <span className="text-xl">{ratingConfig[result.rating]?.icon ?? '⚪'}</span>
                <div>
                  <p className={`text-sm font-bold ${ratingConfig[result.rating]?.color ?? 'text-nquoc-text'}`}>
                    {ratingConfig[result.rating]?.label}
                  </p>
                  <p className="text-xs text-nquoc-muted">{result.xp_delta >= 0 ? '+' : ''}{result.xp_delta} XP</p>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">Phiên bản Lãnh đạo:</p>
                <p className="text-sm text-emerald-900 leading-relaxed font-medium">{rewrite.rewritten}</p>
              </div>

              {result.rewrite_suggestion && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                  <p className="text-xs font-bold text-indigo-600 mb-1">💡 Tại sao cách nói này tốt hơn:</p>
                  <p className="text-xs text-indigo-800 leading-relaxed">{result.rewrite_suggestion}</p>
                </div>
              )}

              <button
                onClick={() => navigator.clipboard.writeText(rewrite.rewritten)}
                className="w-full py-2.5 border border-nquoc-border text-nquoc-muted rounded-2xl text-xs font-bold hover:bg-nquoc-hover transition-all"
              >
                📋 Copy bản viết lại
              </button>
            </div>
          )}

          {/* Empty state */}
          {!inputText && !result && (
            <div className="text-center py-10 text-nquoc-muted">
              <p className="text-3xl mb-3">✍️</p>
              <p className="text-sm font-medium">Bắt đầu gõ ở bên trái</p>
              <p className="text-xs mt-1">AI sẽ phân tích real-time và gợi ý ngay</p>
            </div>
          )}
        </div>
      </div>

      {showTraining && <TrainingSlides onClose={() => setShowTraining(false)} />}
      {showSilenceCalc && <SilenceCostModal onClose={() => setShowSilenceCalc(false)} />}
    </div>
  )
}

// ── Silence Cost Calculator Modal ──
function SilenceCostModal({ onClose }: { onClose: () => void }) {
  const [days, setDays] = useState(3)
  const [people, setPeople] = useState(3)
  const cost = Math.round(days * people * 2.8)
  const resolved = Math.round(days * 0.5)

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden">
        <div className="bg-rose-50 border-b border-rose-100 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-rose-700 font-header">🔕 Chi phí của Im lặng</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors text-lg">✕</button>
          </div>
          <p className="text-xs text-rose-500 mt-1">Tính toán tổn thất khi bạn không nói ra vấn đề</p>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="text-[10px] font-bold text-nquoc-muted uppercase tracking-widest block mb-2">
              Bạn đã im lặng bao nhiêu ngày?
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range" min={1} max={14} value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="flex-1 accent-rose-500"
              />
              <span className="text-sm font-bold text-rose-600 w-16 text-right">{days} ngày</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-nquoc-muted uppercase tracking-widest block mb-2">
              Bao nhiêu người bị ảnh hưởng?
            </label>
            <input
              type="number" min={1} max={20} value={people}
              onChange={(e) => setPeople(Math.max(1, Number(e.target.value)))}
              className="w-full border-2 border-nquoc-border rounded-2xl px-4 py-3 text-sm font-bold
                focus:outline-none focus:border-rose-400 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center">
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1">Thiệt hại ước tính</p>
              <p className="text-3xl font-extrabold text-rose-600 font-header">{cost}h</p>
              <p className="text-[10px] text-rose-400">giờ công lãng phí</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Nếu nói sớm</p>
              <p className="text-3xl font-extrabold text-emerald-600 font-header">{resolved}h</p>
              <p className="text-[10px] text-emerald-500">là đủ để giải quyết</p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl p-4 text-white">
            <p className="text-xs leading-relaxed opacity-90 italic">
              "Im lặng {days} ngày với {people} người = lãng phí <strong>{cost} giờ</strong>.
              Chỉ cần nói thẳng <strong>ngay hôm nay</strong> = tiết kiệm {cost - resolved} giờ cho team."
            </p>
          </div>

          <button
            onClick={() => { onClose() }}
            className="w-full py-3.5 bg-rose-500 text-white rounded-2xl text-sm font-bold hover:bg-rose-600 transition-all active:scale-95 shadow-lg shadow-rose-200"
          >
            Tôi cam kết nói thẳng hôm nay
          </button>
        </div>
      </div>
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
