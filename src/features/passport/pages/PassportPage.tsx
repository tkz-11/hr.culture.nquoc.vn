import React, { useState, useEffect } from 'react'
import type { AuthUser, PassportProfile, CommHeatmapEntry, AnalyzeResult, RewriteResult, LeaderIntegrity } from '../../../shared/types'
import { passportService } from '../services/passport.service'
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner'
import { Badge } from '../../../shared/components/Badge'
import { LineChart } from '../../../shared/components/LineChart'
import { RadarChart } from '../../../shared/components/RadarChart'
import { HRPassportDashboard } from '../components/HRPassportDashboard'

interface PassportPageProps {
  user: AuthUser
}

type TabKey = 'member' | 'leader' | 'mirror' | 'train' | 'hr_dashboard'

const tabs: { key: TabKey; label: string; roles?: string[] }[] = [
  { key: 'member', label: 'Bảng thành viên' },
  { key: 'leader', label: 'Bảng leader', roles: ['leader', 'hr_manager'] },
  { key: 'hr_dashboard', label: 'Quản trị HR', roles: ['hr_manager'] },
  { key: 'mirror', label: 'Đối chiếu chung' },
  { key: 'train', label: 'Giao tiếp thẳng thắn' },
]

export function PassportPage({ user }: PassportPageProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('member')

  const visibleTabs = tabs.filter(
    (t) => !t.roles || t.roles.includes(user.role)
  )

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-nquoc-text font-header">Communication Passport</h1>
        <p className="text-sm text-nquoc-muted mt-1">Rèn luyện giao tiếp thẳng thắn trong tổ chức</p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-nquoc-bg border border-nquoc-border rounded-xl p-1 w-fit">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-nquoc-blue shadow-sm'
                : 'text-nquoc-muted hover:text-nquoc-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-8">
        {activeTab === 'member' && <MemberDashboard user={user} />}
        {activeTab === 'leader' && <LeaderDashboard user={user} />}
        {activeTab === 'mirror' && (
          <div className="bg-white rounded-[32px] border border-nquoc-border p-16 text-center shadow-sm">
            <p className="text-5xl mb-4">🔭</p>
            <h3 className="text-lg font-bold text-nquoc-text font-header">Tính năng đang phát triển</h3>
            <p className="text-sm text-nquoc-muted mt-2 max-w-sm mx-auto">Bảng đối chiếu chung sẽ ra mắt trong thời gian tới để giúp bạn so sánh chuẩn mực giao tiếp.</p>
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

  if (loading) return <LoadingSpinner />
  if (!data) return null

  const { profile, heatmap } = data

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="relative overflow-hidden bg-nquoc-blue rounded-[32px] p-8 text-white shadow-xl shadow-blue-100">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Giao tiếp thẳng thắn hôm nay</p>
              <h2 className="text-3xl font-extrabold font-header">Culture XP: {profile.culture_xp}</h2>
            </div>
            <div className="text-right">
              <Badge variant="emerald" size="md" className="font-bold border-white/20">🔥 {profile.streak_days} ngày liên tiếp</Badge>
            </div>
          </div>
          
          {/* XP Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-2 opacity-80">
              <span>Cấp độ: Người học việc</span>
              <span>{profile.culture_xp % 100}/100 XP tới cấp tiếp theo</span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-1000" 
                style={{ width: `${profile.culture_xp % 100}%` }}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowTraining(true)}
              className="px-6 py-2.5 bg-white text-nquoc-blue rounded-2xl text-sm font-bold hover:bg-blue-50 transition-all active:scale-95 shadow-lg"
            >
              Mở bài luyện tập
            </button>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-[32px] border border-nquoc-border p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-nquoc-text font-header">
            Bản đồ nhiệt văn hóa — 14 ngày gần nhất
          </h2>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5">
               <div className="w-3 h-3 rounded-sm bg-blue-100" />
               <span className="text-[10px] font-medium text-nquoc-muted">Low</span>
             </div>
             <div className="flex items-center gap-1.5">
               <div className="w-3 h-3 rounded-sm bg-blue-600" />
               <span className="text-[10px] font-medium text-nquoc-muted">High</span>
             </div>
          </div>
        </div>
        <HeatmapGrid heatmap={heatmap} />
      </div>

      {/* Stats and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <StatCard label="Điểm giao tiếp" value={profile.directness_score.toFixed(1)} unit="/10" />
          <StatCard label="Streak hiện tại" value={String(profile.streak_days)} unit=" ngày" />
          <StatCard label="Kịch bản" value={String(data.scenarios_done)} unit=" buổi" />
        </div>
        
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-nquoc-border p-8 shadow-sm">
          <h3 className="text-sm font-bold text-nquoc-text font-header mb-4 uppercase tracking-wider">Chỉ số an toàn tâm lý (7 ngày)</h3>
          <div className="h-[180px]">
            <LineChart 
              labels={['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']}
              datasets={[{
                label: 'Safety Index',
                data: [7.2, 7.5, 7.1, 7.8, 8.2, 8.0, 8.5], // Demo data
                color: '#8b5cf6',
                fill: true
              }]}
              max={10}
            />
          </div>
        </div>
      </div>

      {/* Silence cost calculator */}
      <SilenceCostCalc />

      {/* Training slides overlay */}
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
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.key} className="flex items-center gap-3">
          <span className="text-xs text-nquoc-muted w-40 flex-shrink-0">{row.label}</span>
          <div className="flex gap-1">
            {heatmap.map((entry, i) => {
              let intensity = 0
              if (row.type === 'bool') {
                intensity = entry[row.key as 'deadline_met' | 'wyfl_done'] ? 1 : 0.15
              } else {
                const count = entry.banned_word_count
                intensity = count === 0 ? 1 : count <= 2 ? 0.5 : 0.15
              }
              return (
                <div
                  key={i}
                  title={entry.date}
                  className="w-5 h-5 rounded-[4px] border border-nquoc-border"
                  style={{ backgroundColor: `rgba(59, 130, 246, ${intensity})` }}
                />
              )
            })}
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between text-[10px] text-nquoc-muted pt-1">
        <span>14 NGÀY TRƯỚC ←</span>
        <span>LOW ←→ HIGH</span>
        <span>→ HÔM NAY</span>
      </div>
    </div>
  )
}

// ── Stat Card ──
function StatCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="bg-white rounded-3xl border border-nquoc-border p-6 shadow-sm hover:shadow-md transition-all">
      <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-wider mb-2">{label}</p>
      <p className="text-3xl font-extrabold text-nquoc-text font-header leading-none">
        {value}<span className="text-sm font-normal text-nquoc-muted ml-0.5">{unit}</span>
      </p>
    </div>
  )
}

// ── Silence Cost Calculator ──
function SilenceCostCalc() {
  const [days, setDays] = useState(3)
  const [people, setPeople] = useState(5)
  const [severity, setSeverity] = useState(3)

  const wastedHours = (days * people * severity * 0.5).toFixed(1)

  return (
    <div className="bg-amber-50/50 border border-amber-100 rounded-[32px] p-8 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xl">💰</span>
        <h2 className="text-base font-bold text-amber-900 font-header uppercase tracking-tight">Chi phí im lặng</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div>
          <label className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block mb-2 px-1">Số ngày giữ im</label>
          <input
            type="number" min={1} max={30} value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full border border-amber-200 rounded-2xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all font-medium"
          />
        </div>
        <div>
          <label className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block mb-2 px-1">Số người ảnh hưởng</label>
          <input
            type="number" min={1} max={100} value={people}
            onChange={(e) => setPeople(Number(e.target.value))}
            className="w-full border border-amber-200 rounded-2xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all font-medium"
          />
        </div>
        <div>
          <label className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block mb-2 px-1">Mức độ bế tắc (1-5)</label>
          <input
            type="range" min={1} max={5} value={severity}
            onChange={(e) => setSeverity(Number(e.target.value))}
            className="w-full mt-3 h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
          <div className="text-[10px] font-bold text-amber-600 text-center mt-2 uppercase tracking-widest">{severity}/5 - {severity > 3 ? 'Nghiêm trọng' : 'Trung bình'}</div>
        </div>
      </div>
      <div className="bg-white rounded-[24px] p-5 text-center shadow-inner border border-amber-100 flex flex-col sm:flex-row items-center justify-center gap-2">
        <p className="text-sm text-amber-900 font-medium">
          Im lặng {days} ngày = <span className="font-extrabold text-red-600 text-lg">{wastedHours} giờ</span> lãng phí
        </p>
        <span className="hidden sm:inline text-amber-200">|</span>
        <p className="text-sm text-emerald-700 font-bold">
          Chỉ mất <span className="underline decoration-wavy">~15 phút</span> nếu nói thẳng sớm!
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
      <div className="bg-nquoc-lead rounded-2xl p-5 text-white">
        <p className="text-sm opacity-80 mb-1">Trước khi xem data của team – đây là data của bạn.</p>
        <p className="text-3xl font-bold font-header">{score} <span className="text-lg font-normal opacity-70">/ 1000</span></p>
        <p className="text-sm opacity-80 mt-1">Điểm liêm chính của leader</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[32px] border border-nquoc-border p-8 shadow-sm">
          <h3 className="text-sm font-bold text-nquoc-text font-header mb-6 uppercase tracking-wider">Ma trận liêm chính Leader</h3>
          <div className="h-[300px]">
            <RadarChart 
              labels={['Phản hồi', 'WYFLS', 'Ngôn ngữ', 'Kịch bản', 'Thẳng thắn']}
              data={[
                leaderData.integrity.feedback_timeliness || 7,
                leaderData.integrity.wyfl_compliance || 8,
                leaderData.integrity.language_standard || 6,
                leaderData.integrity.scenario_completion || 9,
                leaderData.integrity.directness || 5
              ]}
              max={10}
              color="#8b5cf6"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[32px] border border-nquoc-border p-8 shadow-sm">
            <p className="text-[10px] font-bold text-nquoc-muted mb-4 uppercase tracking-widest">Gợi ý từ AI</p>
            <div className="space-y-4">
              {leaderData.improvement_suggestions.map((s, i) => (
                <div key={i} className="flex gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-nquoc-muted leading-relaxed group hover:border-nquoc-blue/20 transition-all">
                  <span className="text-nquoc-blue font-bold text-lg leading-none group-hover:scale-125 transition-transform">→</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-slate-50 border border-nquoc-border rounded-[32px] p-6 text-sm text-nquoc-muted italic flex items-center gap-4">
            <span className="text-2xl">💡</span>
            <p>"Leader là người đặt chuẩn ngôn ngữ cho cả team. Khi leader nói thẳng, cả tổ chức sẽ chuyển động nhanh hơn."</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Rewrite Lab ──
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

  const ratingColor: Record<string, string> = {
    direct: 'text-emerald-600', vague: 'text-amber-600',
    silent: 'text-red-600', 'face-saving': 'text-rose-600',
  }
  const ratingIcon: Record<string, string> = {
    direct: '🟢', vague: '🟡', silent: '🔴', 'face-saving': '🟠',
  }
  const xpSign = result && result.xp_delta >= 0 ? '+' : ''

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-nquoc-text font-header">Rewrite Lab: Rèn luyện Giao tiếp Thẳng</h2>
          <p className="text-xs text-nquoc-muted mt-0.5">Nhập tin nhắn bạn định gửi — AI sẽ highlight rào cản & viết lại</p>
        </div>
        <button
          onClick={() => setShowTraining(true)}
          className="text-xs font-medium text-nquoc-blue border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
        >
          Ôn lại bài
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-nquoc-border p-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-nquoc-muted block mb-1.5">Nhập tin nhắn (nháp) bạn định gửi:</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ví dụ: Tôi sẽ cố hoàn thành sớm, hy vọng xong trước cuối tuần..."
            className="w-full h-28 border border-nquoc-border rounded-xl px-3 py-2.5 text-sm text-nquoc-text resize-none focus:outline-none focus:border-nquoc-blue transition-colors"
          />
        </div>
        <button
          onClick={handleAnalyze}
          disabled={!inputText.trim() || analyzing}
          className="px-6 py-2.5 bg-nquoc-blue text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {analyzing ? 'Đang phân tích...' : 'Phân tích'}
        </button>
      </div>

      {result && rewrite && (
        <>
          {/* Highlight panel */}
          <div className="bg-white rounded-2xl border border-nquoc-border p-5">
            <p className="text-xs font-semibold text-nquoc-muted mb-3">Highlight các rào cản:</p>
            <p className="text-sm leading-relaxed">
              <PatternHighlight text={inputText} patterns={result.patterns_detected} />
            </p>
            <div className="flex gap-3 mt-3 pt-3 border-t border-nquoc-border">
              <span className="text-xs"><span className="hl-silence">im lặng</span> Im lặng 🔴</span>
              <span className="text-xs"><span className="hl-vague">mơ hồ</span> Mơ hồ 🟡</span>
              <span className="text-xs"><span className="hl-direct">thẳng</span> Thẳng thắn 🟢</span>
            </div>
          </div>

          {/* Rewrite panel */}
          <div className="bg-white rounded-2xl border border-nquoc-border p-5">
            <p className="text-xs font-semibold text-nquoc-muted mb-3">Nên chỉnh lại thành (Direct & Honest):</p>
            <p className="text-sm text-nquoc-text leading-relaxed bg-nquoc-active rounded-xl p-3">
              {rewrite.rewritten}
            </p>
            <div className="flex items-center gap-3 mt-3">
              <span className={`text-sm font-semibold ${ratingColor[result.rating]}`}>
                {xpSign}{result.xp_delta} XP · {ratingIcon[result.rating]}
              </span>
              {result.rewrite_suggestion && (
                <span className="text-xs text-nquoc-muted">{result.rewrite_suggestion}</span>
              )}
            </div>
          </div>
        </>
      )}

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

  let result = text
  const parts: React.ReactNode[] = []
  let lastIndex = 0

  // Simple highlight: find snippets and wrap
  for (const pattern of patterns) {
    const idx = result.toLowerCase().indexOf(pattern.snippet.toLowerCase())
    if (idx !== -1) {
      const cls = pattern.type === 'silent' ? 'hl-silence' : pattern.type === 'vague' ? 'hl-vague' : 'hl-direct'
      parts.push(text.slice(lastIndex, lastIndex + idx))
      parts.push(<span key={idx} className={cls}>{text.slice(lastIndex + idx, lastIndex + idx + pattern.snippet.length)}</span>)
      lastIndex += idx + pattern.snippet.length
      result = result.slice(idx + pattern.snippet.length)
    }
  }
  parts.push(result)
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
    },
    {
      title: 'Khi bạn im lặng, bạn đang gánh hộ',
      content: 'Mỗi ngày bạn không nói ra vấn đề, cả team phải gánh thêm chi phí ẩn: deadline trễ, rework, hiểu nhầm chồng chất. Im lặng không phải lịch sự — đó là chuyển rủi ro cho người khác.',
      emoji: '⚖️',
    },
    {
      title: 'Nói thẳng sớm = tử tế nhất',
      content: 'Nói thẳng không phải vô lễ. Nói thẳng sớm = cho team cơ hội điều chỉnh sớm. Câu nói thẳng thắn nhất là câu nói ra sớm nhất, với thông tin rõ ràng và cụ thể nhất.',
      emoji: '💚',
    },
  ]

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)' }}>
      <div className="w-full max-w-lg rounded-2xl p-8 space-y-6" style={{ backgroundColor: '#1e293b' }}>
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === slide ? 'bg-emerald-400' : 'bg-slate-600'}`} />
          ))}
        </div>

        {/* Slide */}
        <div className="text-center space-y-4">
          <div className="text-5xl">{slides[slide].emoji}</div>
          <h2 className="text-xl font-bold text-white font-header">{slides[slide].title}</h2>
          <p className="text-slate-300 text-sm leading-relaxed">{slides[slide].content}</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {slide > 0 && (
            <button
              onClick={() => setSlide(s => s - 1)}
              className="flex-1 py-2.5 border border-slate-600 text-slate-300 rounded-xl text-sm font-medium hover:border-slate-400"
            >
              Quay lại
            </button>
          )}
          {!isLastSlide ? (
            <button
              onClick={() => setSlide(s => s + 1)}
              className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600"
            >
              Tiếp theo →
            </button>
          ) : (
            <button
              onClick={onClose}
              disabled={countdown > 0}
              className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 disabled:opacity-60 transition-all"
            >
              {countdown > 0 ? `Tôi hiểu - bắt đầu luyện tập (${countdown}s)` : 'Tôi hiểu - bắt đầu luyện tập'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
