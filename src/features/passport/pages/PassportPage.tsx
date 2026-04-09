import { useState, useEffect, useRef, useCallback } from 'react'
import type { AuthUser, PassportProfile, CommHeatmapEntry, LeaderIntegrity } from '../../../shared/types'
import { passportService } from '../services/passport.service'
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner'
import { HRPassportDashboard } from '../components/HRPassportDashboard'
import { CultureHeatmap } from '../../../shared/components/CultureHeatmap'
import { LineChart } from '../../../shared/components/LineChart'
import { RadarChart } from '../../../shared/components/RadarChart'
import { useCountUp } from '../../../shared/hooks/useCountUp'

interface PassportPageProps {
  user: AuthUser
}

type TabKey = 'member' | 'leader' | 'mirror' | 'train' | 'hr_dashboard'

const tabs: { key: TabKey; label: string; icon: string; roles?: string[] }[] = [
  { key: 'member',       label: 'Cá nhân',         icon: '👤' },
  { key: 'leader',       label: 'Quản lý',          icon: '🎖️',  roles: ['leader', 'hr_manager'] },
  { key: 'mirror',       label: 'Gương Soi',        icon: '🔍',  roles: ['leader', 'hr_manager'] },
  { key: 'hr_dashboard', label: 'Góc nhìn HR',      icon: '📊',  roles: ['hr_manager'] },
  { key: 'train',        label: 'Phòng Tập Giao Tiếp', icon: '✍️' },
]

// ─── Pattern libraries ───────────────────────────────────────────
const SILENCE_PATTERNS = [
  'không sao', 'bình thường thôi', 'ok em', 'dạ được',
  'em sẽ cố', 'để em xem', 'có lẽ', 'thôi được',
  'không dám', 'ngại nói', 'sợ offend', 'chờ xem',
]
const VAGUE_PATTERNS = [
  'sẽ cố gắng', 'sẽ làm', 'sẽ xem', 'hy vọng',
  'mong là', 'có thể', 'thử xem', 'cố thôi',
]
const DIRECT_PATTERNS = [
  'tôi không thể', 'tôi không đồng ý', 'cụ thể là',
  'theo tôi thấy', 'tôi cần', 'deadline là', 'bước 1',
  'tôi sẽ gửi lúc', 'vấn đề là', 'giải pháp là',
  'tôi hiểu nhưng', 'tôi cần làm rõ',
]
const FACE_SAVING_PATTERNS = [
  'thôi không sao', 'để sau tính', 'không cần thiết',
  'ngại quá', 'kỳ cục lắm', 'người ta nghĩ gì',
]

const REWRITE_RULES: Record<string, string> = {
  'sẽ cố gắng hoàn thành': 'sẽ hoàn thành và gửi lúc 17:00 hôm nay',
  'có lẽ ok': 'được, tôi xác nhận',
  'để em xem': 'tôi sẽ kiểm tra và phản hồi trước 15:00 hôm nay',
  'không biết': 'tôi cần thêm thông tin về phần còn thiếu. Bạn có thể gửi rõ yêu cầu đầu ra?',
  'thôi được': 'tôi đồng ý với điều kiện chúng ta chốt lại bằng văn bản',
  'không sao': 'Tôi thấy có điểm chưa hợp lý tại...',
  'sẽ cố gắng': 'Tôi cam kết hoàn thành vào [Thứ/Giờ]',
  'hy vọng': 'Hãy xác nhận chính xác thời gian',
  'bình thường': 'Thực tế tôi mong đợi...',
}

type PatternGroup = 'silence' | 'vague' | 'direct' | 'face'

function parseHighlights(text: string) {
  const all: Array<{ term: string; group: PatternGroup }> = [
    ...SILENCE_PATTERNS.map(term => ({ term, group: 'silence' as PatternGroup })),
    ...VAGUE_PATTERNS.map(term => ({ term, group: 'vague' as PatternGroup })),
    ...DIRECT_PATTERNS.map(term => ({ term, group: 'direct' as PatternGroup })),
    ...FACE_SAVING_PATTERNS.map(term => ({ term, group: 'face' as PatternGroup })),
  ]

  const lower = text.toLowerCase()
  const ranges: Array<{ start: number; end: number; group: PatternGroup }> = []

  all.forEach(item => {
    let idx = lower.indexOf(item.term)
    while (idx !== -1) {
      ranges.push({ start: idx, end: idx + item.term.length, group: item.group })
      idx = lower.indexOf(item.term, idx + item.term.length)
    }
  })

  ranges.sort((a, b) => a.start - b.start || b.end - a.end)
  const merged: typeof ranges = []
  ranges.forEach(r => {
    const last = merged[merged.length - 1]
    if (!last || r.start >= last.end) merged.push(r)
  })

  const segments: Array<{ text: string; group?: PatternGroup }> = []
  let cursor = 0
  merged.forEach(r => {
    if (r.start > cursor) segments.push({ text: text.slice(cursor, r.start) })
    segments.push({ text: text.slice(r.start, r.end), group: r.group })
    cursor = r.end
  })
  if (cursor < text.length) segments.push({ text: text.slice(cursor) })
  return segments
}

function buildProfessionalRewrite(text: string): string {
  let rewritten = text.trim()
  const lower = rewritten.toLowerCase()

  Object.entries(REWRITE_RULES).forEach(([key, value]) => {
    if (lower.includes(key)) rewritten = rewritten.replace(new RegExp(key, 'gi'), value)
  })

  VAGUE_PATTERNS.forEach(p => {
    rewritten = rewritten.replace(new RegExp(p, 'gi'), 'tôi sẽ')
  })
  SILENCE_PATTERNS.forEach(p => {
    rewritten = rewritten.replace(new RegExp(p, 'gi'), 'tôi cần nêu rõ')
  })
  FACE_SAVING_PATTERNS.forEach(p => {
    rewritten = rewritten.replace(new RegExp(p, 'gi'), 'tôi sẽ nói thẳng để cùng xử lý')
  })

  if (!/\b\d{1,2}[:h]\d{0,2}|\b\d+\s*(giờ|phút|h|pm|am)\b/i.test(rewritten)) {
    rewritten += ' Tôi sẽ phản hồi mốc tiếp theo lúc 16:00 hôm nay.'
  }
  if (!/tôi\s+sẽ|tôi\s+không\s+thể|tôi\s+cần/i.test(rewritten)) {
    rewritten = `Tôi cần làm rõ như sau: ${rewritten}`
  }
  return rewritten
}

// ─── Legacy score engine (still used) ───────────────────────────
const RT_PATTERNS = {
  silence: /không sao|bình thường|ok em|dạ được|chờ xem|thôi bỏ qua|để tính|có lẽ|sợ mất lòng/gi,
  vague:   /cố gắng|sẽ làm|hy vọng|mong là|có thể|thử xem|cố thôi/gi,
  direct:  /không đồng ý|cụ thể là|cần|thời hạn|vì lý do|giải pháp|chốt|đề xuất/gi,
}

function computeScore(text: string) {
  if (!text || text.trim().length < 3) return null
  let score = 50
  const sil = text.match(RT_PATTERNS.silence) || []
  const vag = text.match(RT_PATTERNS.vague) || []
  const dir = text.match(RT_PATTERNS.direct) || []
  score -= sil.length * 15
  score -= vag.length * 10
  score += dir.length * 20
  if (/\d{1,2}[:h]\d{0,2}/i.test(text)) score += 15
  return { score: Math.max(0, Math.min(100, score)), sil, vag, dir }
}

// ─── Scenario groups ─────────────────────────────────────────────
const SCENARIO_GROUPS = {
  A: [
    'Leader giao thêm task khi bạn đang quá tải. Bạn sẽ nói gì?',
    'Bạn không đồng ý với quyết định của leader nhưng cuộc họp đang diễn ra. Bạn làm gì?',
    'Leader giải thích quy trình mà bạn thấy có lỗ hổng. Bạn phản hồi thế nào?',
  ],
  B: [
    'Đồng đội nộp bài thiếu thông tin lần thứ 3. Tin nhắn bạn gửi là gì?',
    'Bạn thấy đồng nghiệp dùng từ mơ hồ trong nhóm chat. Bạn phản hồi công khai hay riêng tư?',
    'Đồng đội hỏi câu mà bạn nghĩ họ nên tự tìm hiểu trước. Bạn trả lời thế nào?',
  ],
  C: [
    'Bạn phát hiện mình sẽ trễ deadline 2 tiếng. Bạn nhắn gì và nhắn lúc nào?',
    'Bạn không hiểu yêu cầu task nhưng đã hỏi 1 lần rồi. Bạn làm gì tiếp theo?',
    'Bạn phát hiện lỗi do người khác gây ra nhưng team sẽ thấy là lỗi chung. Bạn xử lý thế nào?',
  ],
}

// ─── Daily unlock prompts ─────────────────────────────────────────
const UNLOCK_PROMPTS = [
  'Có điều gì bạn biết nhưng chưa nói với team trong 3 ngày qua không? Hôm nay là ngày để nói.',
  'Bạn có đang tránh né một cuộc trò chuyện khó nào không? Mô tả nó trong 1 câu.',
  'Tin nhắn nào bạn đã gõ nhưng xóa đi vì ngại? Hãy gõ lại và gửi hôm nay.',
]

// ─── Mock mirror data ─────────────────────────────────────────────
const MOCK_MIRROR = {
  leaderDirectness: 61,
  teamDirectness: 74,
  leaderVaguePhrases: ['sẽ xem', 'để tính sau', 'ok thôi', 'có thể'],
}

// ─── Highlight color classes ──────────────────────────────────────
const highlightClass: Record<PatternGroup, string> = {
  silence: 'bg-red-100 text-red-800 border-b-2 border-red-500 rounded px-0.5',
  vague:   'bg-amber-100 text-amber-800 border-b-2 border-amber-500 rounded px-0.5',
  direct:  'bg-green-100 text-green-800 border-b-2 border-green-500 rounded px-0.5',
  face:    'bg-purple-100 text-purple-800 border-b-2 border-purple-500 rounded px-0.5',
}


export function PassportPage({ user }: PassportPageProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('member')
  const visibleTabs = tabs.filter((t) => !t.roles || t.roles.includes(user.role))

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 bg-[#f1f5f9]">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          Hộ Chiếu Giao Tiếp
        </p>
        <h1 className="text-2xl font-black text-slate-900 font-header tracking-tight">
          Hộ Chiếu Giao Tiếp
        </h1>
        <p className="text-sm font-medium text-slate-500 max-w-lg mb-2">
          Nơi bạn rèn luyện và đo lường độ phản xạ khi giải quyết vấn đề. Từ chối sự mập mờ, hướng tới thẳng thắn.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 flex-wrap bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-max">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-[#0f172a] text-white shadow-md'
                : 'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <span className="text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in mt-6" key={activeTab}>
        {activeTab === 'member'       && <MemberDashboard user={user} />}
        {activeTab === 'leader'       && <LeaderDashboard user={user} />}
        {activeTab === 'mirror'       && <MirrorView />}
        {activeTab === 'train'        && <RewriteLab />}
        {activeTab === 'hr_dashboard' && <HRPassportDashboard />}
      </div>
    </div>
  )
}

// ─── Member Dashboard ─────────────────────────────────────────────
function MemberDashboard({ user: _user }: { user: AuthUser }) {
  const [data, setData] = useState<{ profile: PassportProfile; heatmap: CommHeatmapEntry[]; scenarios_done: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    passportService.getMe().then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [])

  const todayPrompt = UNLOCK_PROMPTS[new Date().getDay() % 3]
  const xpDisplay = useCountUp(data?.profile.culture_xp ?? 0)

  if (loading) return <LoadingSpinner />
  if (!data) return null
  const { profile } = data

  return (
    <div className="space-y-6">
      {/* Câu hỏi khai phá hôm nay */}
      <div className="bg-[#0f172a] rounded-2xl p-5 flex items-start gap-4">
        <div className="text-2xl flex-shrink-0">💬</div>
        <div className="flex-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-1">
            CÂU HỎI KHAI PHÁ HÔM NAY
          </p>
          <p className="text-sm font-medium text-white leading-relaxed">{todayPrompt}</p>
        </div>
        <button className="flex-shrink-0 text-xs font-bold text-blue-400 hover:text-blue-300 whitespace-nowrap transition-colors">
          Vào Phòng Tập →
        </button>
      </div>

      {/* XP Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-10 text-white shadow-blue-200 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <span className="text-9xl font-bold">🎯</span>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-blue-100 text-[11px] uppercase tracking-widest font-bold mb-2">Điểm Văn Hóa Tích Lũy</p>
            <h2 className="text-6xl font-black font-header mb-4 animate-count-up">
              {xpDisplay} <span className="text-xl text-blue-200 font-bold">XP</span>
            </h2>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <span>🔥</span>
              <span className="text-sm font-bold">Giữ nhịp: {profile.streak_days} ngày</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl">🎯</div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-header">Chỉ số Thẳng Thắn</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] mt-0.5">Điểm đánh giá cá nhân</p>
            </div>
          </div>
          <div className="flex items-end gap-3 mb-3">
            <span className="text-4xl font-black font-header text-blue-600">{profile.directness_score.toFixed(1)}</span>
            <span className="text-slate-400 font-bold mb-1">/ 10</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-2">
            <div className="h-full rounded-full transition-all duration-1000 bg-blue-500" style={{ width: `${profile.directness_score * 10}%` }} />
          </div>
          <p className="text-xs font-medium text-slate-500">Tiếp tục rèn luyện trong Phòng Tập để tăng điểm.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl">🛡️</div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-header">Cảm giác An Toàn</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] mt-0.5">Biểu đồ 7 ngày</p>
            </div>
          </div>
          <div className="h-[120px] w-full">
            <LineChart
              labels={['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']}
              datasets={[{ label: 'Chỉ số an toàn', data: [7.2, 7.5, 7.1, 7.8, 8.2, 8.0, 8.5], color: '#10b981', fill: true }]}
              max={10}
            />
          </div>
        </div>
      </div>

      <CultureHeatmap streakDays={profile.streak_days} />
    </div>
  )
}

// ─── Leader Dashboard ─────────────────────────────────────────────
function LeaderDashboard({ user }: { user: AuthUser }) {
  const [leaderData, setLeaderData] = useState<{ integrity: LeaderIntegrity; improvement_suggestions: string[] } | null>(null)

  useEffect(() => {
    passportService.getLeaderProfile(user.id).then(setLeaderData)
  }, [user.id])

  const scoreRaw = Math.round((leaderData?.integrity.integrity_score ?? 0) * 100)
  const score = useCountUp(scoreRaw)
  const isGood = scoreRaw >= 70

  if (!leaderData) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className={`rounded-2xl p-8 md:p-10 text-white shadow-lg relative overflow-hidden ${isGood ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-blue-600 to-blue-700'}`}>
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-9xl">⚖️</div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-white/80 text-[11px] uppercase tracking-widest font-bold mb-2">Độ tin cậy của Quản lý</p>
            <h2 className="text-6xl font-black font-header mb-1 animate-count-up">
              {score} <span className="text-xl opacity-60">/ 100</span>
            </h2>
            <p className="text-sm font-medium mt-2">Dẫn dắt bằng sự Thẳng Thắn. Đội ngũ sẽ học theo bạn.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="mb-5 flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center text-xl">📊</div>
            <h3 className="text-base font-bold text-slate-900 font-header">Ma trận Chuyên Nghiệp</h3>
          </div>
          <div className="h-[280px]">
            <RadarChart
              labels={['Tốc độ Phản hồi', 'Minh bạch', 'Ngôn ngữ', 'Hoàn thành Hứa hẹn', 'Độ Thẳng Thắn']}
              data={[
                leaderData.integrity.feedback_timeliness || 7,
                leaderData.integrity.wyfl_compliance || 8,
                leaderData.integrity.language_standard || 6,
                leaderData.integrity.scenario_completion || 9,
                leaderData.integrity.directness || 5,
              ]}
              max={10}
              color="#1d4ed8"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-center hover:shadow-md transition-all">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-5 flex items-center gap-2">
            <span className="text-blue-500">✨</span> Gợi ý thay đổi hành vi
          </h3>
          <div className="space-y-3">
            {leaderData.improvement_suggestions.map((s, i) => (
              <div key={i} className="flex gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-blue-500 font-bold text-lg mt-0.5 flex-shrink-0">→</span>
                <span className="text-sm font-medium text-slate-700 leading-relaxed">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Mirror View ──────────────────────────────────────────────────
function MirrorView() {
  const leaderScore = MOCK_MIRROR.leaderDirectness
  const teamScore = MOCK_MIRROR.teamDirectness
  const diff = leaderScore - teamScore

  const leaderDisplay = useCountUp(leaderScore)
  const teamDisplay   = useCountUp(teamScore)

  const leaderColor = leaderScore >= 70 ? '#10b981' : leaderScore >= 50 ? '#f59e0b' : '#e11d48'
  const teamColor   = teamScore >= 70 ? '#10b981' : teamScore >= 50 ? '#f59e0b' : '#e11d48'

  let gapBadge = { color: 'bg-emerald-100 text-emerald-800 border border-emerald-300', text: 'Đang đồng thuận tốt' }
  if (diff > 10) gapBadge = { color: 'bg-blue-100 text-blue-800 border border-blue-300', text: 'Leader đang dẫn đầu về thẳng thắn' }
  if (diff < -10) gapBadge = { color: 'bg-red-100 text-red-800 border border-red-300', text: 'Cảnh báo: Đội ngũ đang thẳng thắn hơn leader. Hãy dẫn đầu bằng ví dụ.' }

  return (
    <div className="space-y-6">
      <div className="bg-[#0f172a] rounded-2xl p-6 text-white">
        <p className="text-sm font-medium text-slate-300 leading-relaxed">
          "Trước khi xem data của team – đây là data của bạn."
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Leader score */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center hover:shadow-md transition-all">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-4">Chỉ số của leader</p>
          <div className="relative w-28 h-28 mx-auto mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="10" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={leaderColor} strokeWidth="10"
                strokeDasharray={`${leaderScore * 2.638} 263.8`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-black text-slate-900 font-header">{leaderDisplay}</span>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-600">/ 100 điểm thẳng thắn</p>
        </div>

        {/* Team score */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center hover:shadow-md transition-all">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-4">Chỉ số trung bình đội nhóm</p>
          <div className="relative w-28 h-28 mx-auto mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="10" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={teamColor} strokeWidth="10"
                strokeDasharray={`${teamScore * 2.638} 263.8`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-black text-slate-900 font-header">{teamDisplay}</span>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-600">/ 100 điểm thẳng thắn</p>
        </div>
      </div>

      {/* Gap analysis */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${gapBadge.color}`}>
            {gapBadge.text}
          </span>
        </div>

        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-3">
            Cụm từ mơ hồ leader dùng tuần này
          </p>
          <div className="flex flex-wrap gap-2">
            {MOCK_MIRROR.leaderVaguePhrases.map((phrase, i) => (
              <span key={i} className="text-xs font-bold px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                "{phrase}"
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Rewrite Lab ──────────────────────────────────────────────────
function RewriteLab() {
  const [inputText, setInputText] = useState('')
  const [rtScore, setRtScore] = useState<ReturnType<typeof computeScore>>(null)
  const [showSilenceCalc, setShowSilenceCalc] = useState(false)
  const [scenarioGroup, setScenarioGroup] = useState<'A' | 'B' | 'C'>('A')
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [scenarioResponse, setScenarioResponse] = useState('')
  const [scenarioScore, setScenarioScore] = useState<ReturnType<typeof computeScore>>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleInput = useCallback((val: string) => {
    setInputText(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setRtScore(computeScore(val)), 200)
  }, [])

  const handleScenarioResponse = useCallback((val: string) => {
    setScenarioResponse(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setScenarioScore(computeScore(val)), 200)
  }, [])

  const pickNextScenario = () => {
    const list = SCENARIO_GROUPS[scenarioGroup]
    setScenarioIdx((scenarioIdx + 1) % list.length)
    setScenarioResponse('')
    setScenarioScore(null)
  }

  const scoreNum = rtScore?.score ?? null
  const isDirect = scoreNum !== null && scoreNum >= 70
  const isVague  = scoreNum !== null && scoreNum >= 50 && scoreNum < 70
  const isSilent = scoreNum !== null && scoreNum < 50

  const statusColor = isDirect ? 'text-emerald-600' : isVague ? 'text-amber-600' : isSilent ? 'text-rose-600' : 'text-slate-400'
  const statusLabel = isDirect ? 'NÓI THẲNG' : isVague ? 'CÒN MƠ HỒ' : isSilent ? 'ĐANG NÉ TRÁNH' : 'CHƯA ĐÁNH GIÁ'

  const highlights = inputText ? parseHighlights(inputText) : []
  const rewritten  = inputText.trim() ? buildProfessionalRewrite(inputText) : ''

  const currentScenarios = SCENARIO_GROUPS[scenarioGroup]
  const currentScenario  = currentScenarios[scenarioIdx % currentScenarios.length]
  const sScoreNum = scenarioScore?.score ?? null
  const sColor = sScoreNum !== null
    ? (sScoreNum >= 70 ? 'text-emerald-600' : sScoreNum >= 50 ? 'text-amber-600' : 'text-rose-600')
    : 'text-slate-400'
  const sLabel = sScoreNum !== null
    ? (sScoreNum >= 70 ? 'NÓI THẲNG ✅' : sScoreNum >= 50 ? 'CÒN MƠ HỒ 🟡' : 'ĐANG NÉ TRÁNH 🔴')
    : 'CHƯA ĐÁNH GIÁ'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center text-2xl">✍️</div>
          <div>
            <h2 className="text-base font-black text-slate-900 font-header tracking-tight">Phòng Tập Giao Tiếp</h2>
            <p className="text-sm font-medium text-slate-500 mt-0.5">Viết thử vào ô bên dưới, hệ thống sẽ chỉ ra lỗi né tránh của bạn.</p>
          </div>
        </div>
        <button
          onClick={() => setShowSilenceCalc(true)}
          className="w-full md:w-auto px-5 py-2.5 border-2 border-rose-100 bg-rose-50 text-rose-600 font-bold text-sm rounded-xl hover:bg-rose-100 hover:border-rose-200 transition-all"
        >
          🔕 Xem Thiệt Hại Của Sự Im Lặng
        </button>
      </div>

      {/* Score bar */}
      {scoreNum !== null && (
        <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm flex items-center gap-4">
          <div className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wide bg-slate-50 ${statusColor}`}>{statusLabel}</div>
          <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${scoreNum}%`, backgroundColor: isDirect ? '#10b981' : isVague ? '#f59e0b' : '#e11d48' }} />
          </div>
          <div className={`font-black font-header text-xl pr-4 ${statusColor}`}>{scoreNum}</div>
        </div>
      )}

      {/* Main input / output panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4 hover:shadow-md transition-all">
          <h3 className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.12em] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Bản Nháp
          </h3>
          <textarea
            value={inputText}
            onChange={e => handleInput(e.target.value)}
            className="w-full h-48 bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl p-5 text-sm font-medium text-slate-800 resize-none outline-none transition-all placeholder-slate-400"
            placeholder="VD: Tuần này chắc sẽ hơi trễ xíu, mong mọi người thông cảm bình thường thôi vì task nhiều quá..."
          />
        </div>

        {/* Output */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4 hover:shadow-md transition-all">
          {!inputText.trim() ? (
            <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-6 text-center h-full min-h-[200px]">
              <span className="text-4xl mb-4">🤖</span>
              <p className="text-sm font-medium">Bắt đầu gõ để nhận ngay phân tích từ hệ thống</p>
            </div>
          ) : (
            <div className="flex-1 space-y-4">
              {/* Highlight panel */}
              <div>
                <h3 className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.12em] flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span> Phát hiện rào cản
                </h3>
                <div className="bg-slate-50 rounded-2xl p-4 text-sm leading-loose border border-slate-200">
                  {highlights.map((seg, i) =>
                    seg.group
                      ? <span key={i} className={highlightClass[seg.group]}>{seg.text}</span>
                      : <span key={i}>{seg.text}</span>
                  )}
                </div>
              </div>

              {/* Rewrite panel */}
              <div>
                <h3 className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.12em] flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Gợi ý viết lại
                </h3>
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-sm font-medium text-emerald-900 leading-relaxed">
                  {rewritten}
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-bold">● Im lặng</span>
                <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-bold">● Mơ hồ</span>
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-bold">● Thẳng thắn</span>
                <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-bold">● Giữ thể diện</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scenario practice */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
        <h3 className="text-base font-black text-slate-900 font-header tracking-tight mb-4">
          Luyện Phản Xạ Tình Huống
        </h3>

        {/* Group tabs */}
        <div className="flex gap-2 mb-5 bg-slate-50 p-1.5 rounded-xl w-max border border-slate-200">
          {([['A', 'Leader & Bạn'], ['B', 'Đồng nghiệp'], ['C', 'Tự chịu trách nhiệm']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setScenarioGroup(key); setScenarioIdx(0); setScenarioResponse(''); setScenarioScore(null) }}
              className={`text-xs font-bold px-3 py-2 rounded-lg transition-all ${
                scenarioGroup === key ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {key} – {label}
            </button>
          ))}
        </div>

        {/* Scenario card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-2">Tình huống</p>
          <p className="text-sm font-medium text-slate-800 leading-relaxed">{currentScenario}</p>
        </div>

        <textarea
          value={scenarioResponse}
          onChange={e => handleScenarioResponse(e.target.value)}
          rows={3}
          className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl p-4 text-sm font-medium text-slate-800 resize-none outline-none transition-all placeholder-slate-400 mb-3"
          placeholder="Gõ phản hồi của bạn..."
        />

        <div className="flex items-center justify-between flex-wrap gap-3">
          {sScoreNum !== null && (
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 ${sColor}`}>{sLabel}</span>
          )}
          <button
            onClick={pickNextScenario}
            className="ml-auto px-5 py-2.5 bg-[#0f172a] text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition-all shadow-sm active:scale-[0.97]"
          >
            Kịch bản tiếp theo →
          </button>
        </div>
      </div>

      {showSilenceCalc && <SilenceCostModal onClose={() => setShowSilenceCalc(false)} />}
    </div>
  )
}

// ─── Silence Cost Modal ───────────────────────────────────────────
function SilenceCostModal({ onClose }: { onClose: () => void }) {
  const [days, setDays] = useState(3)
  const [people, setPeople] = useState(3)
  const costMoney = Math.round((days * people * 200000) / 1000) * 1000
  const costHours = Math.round(days * people * 2)

  const hoursDisplay  = useCountUp(costHours, 600)
  const moneyDisplay  = useCountUp(costMoney, 600)

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-black text-slate-900 font-header">Tính Tổn Thất</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors text-sm font-bold">✕</button>
        </div>

        <div className="space-y-5">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="text-xs font-bold text-slate-600 block mb-3">Bạn đã trì hoãn nói chuyện bao nhiêu ngày?</label>
            <div className="flex items-center gap-4">
              <input type="range" min={1} max={30} value={days} onChange={e => setDays(Number(e.target.value))} className="flex-1 accent-rose-500" />
              <span className="w-16 text-right font-black text-rose-600 text-lg">{days} D</span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="text-xs font-bold text-slate-600 block mb-3">Vấn đề này dính líu bao nhiêu người?</label>
            <div className="flex items-center gap-4">
              <input type="range" min={1} max={20} value={people} onChange={e => setPeople(Number(e.target.value))} className="flex-1 accent-blue-500" />
              <span className="w-16 text-right font-black text-blue-600 text-lg">{people} P</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <p className="text-center text-[10px] uppercase font-bold text-slate-400 mb-4 tracking-[0.12em]">Sự mập mờ đang gây thiệt hại</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center bg-rose-50 rounded-2xl p-4 text-rose-600 border border-rose-100">
                <p className="text-xs font-bold mb-1 opacity-80">Lãng phí</p>
                <p className="text-3xl font-black font-header">{hoursDisplay}h</p>
                <p className="text-[10px] font-medium mt-1">xử lý hậu quả</p>
              </div>
              <div className="text-center bg-amber-50 rounded-2xl p-4 text-amber-600 border border-amber-100">
                <p className="text-xs font-bold mb-1 opacity-80">Ước tính</p>
                <p className="text-xl font-black font-header mt-1">{moneyDisplay.toLocaleString('vi-VN')}₫</p>
                <p className="text-[10px] font-medium mt-1">mất trắng</p>
              </div>
            </div>
          </div>

          <button onClick={onClose} className="w-full py-4 bg-[#0f172a] text-white rounded-2xl font-bold shadow-lg hover:bg-slate-800 active:scale-[0.98] transition-all">
            Tôi Sẽ Nói Thẳng Ngay Bây Giờ
          </button>
        </div>
      </div>
    </div>
  )
}
