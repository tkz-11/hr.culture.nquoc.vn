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

const tabs: { key: TabKey; label: string; roles?: string[] }[] = [
  { key: 'member',       label: 'Cá nhân' },
  { key: 'leader',       label: 'Quản lý',             roles: ['leader', 'hr_manager'] },
  { key: 'mirror',       label: 'Gương Soi',            roles: ['leader', 'hr_manager'] },
  { key: 'hr_dashboard', label: 'Góc nhìn HR',          roles: ['hr_manager'] },
  { key: 'train',        label: 'Phòng Tập Giao Tiếp' },
]

// ─── Training Slides ──────────────────────────────────────────────
const TRAINING_SLIDES = [
  {
    title: '2000 năm lập trình hành vi',
    body: 'Văn hóa Nho giáo dạy chúng ta: im lặng là lịch sự, tránh xung đột là khôn ngoan. Nhưng trong tổ chức hiện đại, im lặng = thông tin bị chặn = quyết định sai = chi phí tăng. Hành vi bạn học suốt 20 năm không phải là lỗi của bạn — nhưng thay đổi nó là trách nhiệm của bạn.',
    sub: 'Bước 1 / 3',
  },
  {
    title: 'Khi bạn im lặng, bạn đang gánh hộ',
    body: 'Mỗi lần bạn không nói ra — bạn giữ lại rủi ro cho riêng mình. Người ra quyết định không có đủ thông tin. Team tiếp tục đi theo hướng sai. Sau 7 ngày, chi phí sửa lỗi gấp 10 lần chi phí nói thẳng ngay lúc đầu. Im lặng không phải là an toàn — im lặng là tích lũy tổn thất ngầm.',
    sub: 'Bước 2 / 3',
  },
  {
    title: 'Nói thẳng sớm = tử tế nhất',
    body: 'Phản hồi thẳng không phải là thiếu tôn trọng. Đó là tôn trọng thời gian và công sức của nhau. "Tôi thấy có vấn đề ở điểm X" nói trong 15 giây — giúp tránh 3 ngày xử lý hậu quả. Giao tiếp thẳng thắn, cụ thể, có thời hạn rõ ràng = ngôn ngữ của người chuyên nghiệp.',
    sub: 'Bước 3 / 3',
  },
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
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.12em] mb-1">
          Hộ Chiếu Giao Tiếp
        </p>
        <h1 className="text-xl font-black text-[#1a1a2e] font-header tracking-tight">
          Hộ Chiếu Giao Tiếp
        </h1>
        <p className="text-[13px] text-[#5a6a85] mt-1 max-w-lg">
          Nơi bạn rèn luyện và đo lường độ phản xạ khi giải quyết vấn đề. Từ chối sự mập mờ, hướng tới thẳng thắn.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 flex-wrap bg-white p-1 rounded-[12px] border border-[#ebebeb] w-max shadow-card">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-[9px] text-[13px] font-bold transition-all duration-150 ${
              activeTab === tab.key
                ? 'bg-[#e53e3e] text-white shadow-sm'
                : 'text-[#5a6a85] hover:text-[#1a1a2e] hover:bg-[#f8fafc]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in" key={activeTab}>
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
  const [showSlides, setShowSlides] = useState(false)

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
    <div className="space-y-5">
      {/* Câu hỏi khai phá hôm nay */}
      <div className="bg-[#1a1a2e] rounded-[16px] p-5 flex items-start gap-4">
        <div className="w-8 h-8 rounded-[8px] bg-white/10 flex-shrink-0 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.12em] mb-1">
            Câu hỏi khai phá hôm nay
          </p>
          <p className="text-[13px] font-medium text-white leading-relaxed">{todayPrompt}</p>
        </div>
        <button
          onClick={() => setShowSlides(true)}
          className="flex-shrink-0 text-[11px] font-bold text-[#e53e3e] bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-[8px] whitespace-nowrap transition-colors"
        >
          Ôn lại bài
        </button>
      </div>

      {/* XP Hero */}
      <div className="bg-[#e53e3e] rounded-[16px] p-7 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 right-8 w-20 h-20 bg-white/5 rounded-full translate-y-6" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-white/70 text-[10px] uppercase tracking-[0.12em] font-bold mb-2">Điểm Văn Hóa Tích Lũy</p>
            <h2 className="text-5xl font-black font-header mb-3 animate-count-up">
              {xpDisplay} <span className="text-lg text-white/60 font-bold">XP</span>
            </h2>
            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-[8px]">
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
              <span className="text-[12px] font-bold">Giữ nhịp: {profile.streak_days} ngày</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-[16px] border border-[#ebebeb] p-5 shadow-card hover:shadow-card-hover transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-[#fff0f0] rounded-[10px] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e53e3e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-[#1a1a2e]">Chỉ số Thẳng Thắn</h3>
              <p className="text-[10px] text-[#94a3b8] font-medium">Điểm đánh giá cá nhân</p>
            </div>
          </div>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-3xl font-black font-header text-[#e53e3e]">{profile.directness_score.toFixed(1)}</span>
            <span className="text-[#94a3b8] font-bold mb-1 text-sm">/ 10</span>
          </div>
          <div className="h-2 bg-[#f5f6fa] rounded-full overflow-hidden mb-2">
            <div className="h-full rounded-full transition-all duration-1000 bg-[#e53e3e]" style={{ width: `${profile.directness_score * 10}%` }} />
          </div>
          <p className="text-[11px] text-[#94a3b8]">Tiếp tục rèn luyện trong Phòng Tập để tăng điểm.</p>
        </div>

        <div className="bg-white rounded-[16px] border border-[#ebebeb] p-5 shadow-card hover:shadow-card-hover transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-[#f0fdf4] rounded-[10px] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-[#1a1a2e]">Cảm giác An Toàn</h3>
              <p className="text-[10px] text-[#94a3b8] font-medium">Biểu đồ 7 ngày</p>
            </div>
          </div>
          <div className="h-[100px] w-full">
            <LineChart
              labels={['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']}
              datasets={[{ label: 'Chỉ số an toàn', data: [7.2, 7.5, 7.1, 7.8, 8.2, 8.0, 8.5], color: '#10b981', fill: true }]}
              max={10}
            />
          </div>
        </div>
      </div>

      <CultureHeatmap streakDays={profile.streak_days} />

      {showSlides && <TrainingSlides onClose={() => setShowSlides(false)} />}
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
    <div className="space-y-5">
      <div className={`rounded-[16px] p-7 text-white relative overflow-hidden ${isGood ? 'bg-[#059669]' : 'bg-[#1a1a2e]'}`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
        <div className="relative z-10">
          <p className="text-white/60 text-[10px] uppercase tracking-[0.12em] font-bold mb-2">Độ tin cậy của Quản lý</p>
          <h2 className="text-5xl font-black font-header mb-1 animate-count-up">
            {score} <span className="text-lg opacity-50">/ 100</span>
          </h2>
          <p className="text-[13px] font-medium mt-2 text-white/70">Dẫn dắt bằng sự Thẳng Thắn. Đội ngũ sẽ học theo bạn.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-[16px] border border-[#ebebeb] p-5 shadow-card hover:shadow-card-hover transition-all">
          <div className="mb-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-[#fff0f0] rounded-[10px] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e53e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <h3 className="text-[13px] font-bold text-[#1a1a2e]">Ma trận Chuyên Nghiệp</h3>
          </div>
          <div className="h-[260px]">
            <RadarChart
              labels={['Tốc độ PH', 'Minh bạch', 'Ngôn ngữ', 'Hoàn thành', 'Thẳng thắn']}
              data={[
                leaderData.integrity.feedback_timeliness || 7,
                leaderData.integrity.wyfl_compliance || 8,
                leaderData.integrity.language_standard || 6,
                leaderData.integrity.scenario_completion || 9,
                leaderData.integrity.directness || 5,
              ]}
              max={10}
              color="#e53e3e"
            />
          </div>
        </div>

        <div className="bg-white rounded-[16px] border border-[#ebebeb] p-5 shadow-card hover:shadow-card-hover transition-all">
          <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.12em] mb-4">
            Gợi ý thay đổi hành vi
          </p>
          <div className="space-y-3">
            {leaderData.improvement_suggestions.map((s, i) => (
              <div key={i} className="flex gap-3 p-3.5 bg-[#f5f6fa] border border-[#ebebeb] rounded-[10px]">
                <span className="text-[#e53e3e] font-bold text-base mt-0.5 flex-shrink-0">→</span>
                <span className="text-[13px] text-[#5a6a85] leading-relaxed">{s}</span>
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

  const leaderColor = leaderScore >= 70 ? '#10b981' : leaderScore >= 50 ? '#f59e0b' : '#e53e3e'
  const teamColor   = teamScore >= 70 ? '#10b981' : teamScore >= 50 ? '#f59e0b' : '#e53e3e'

  let gapBadge = { cls: 'bg-[#f0fdf4] text-[#059669] border border-[#bbf7d0]', text: 'Đang đồng thuận tốt' }
  if (diff > 10) gapBadge = { cls: 'bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]', text: 'Leader đang dẫn đầu về thẳng thắn' }
  if (diff < -10) gapBadge = { cls: 'bg-[#fff0f0] text-[#e53e3e] border border-[#fecaca]', text: 'Cảnh báo: Đội ngũ đang thẳng thắn hơn leader — hãy dẫn đầu bằng ví dụ.' }

  return (
    <div className="space-y-5">
      <div className="bg-[#1a1a2e] rounded-[16px] p-5 text-white">
        <p className="text-[13px] text-white/70 leading-relaxed italic">
          "Trước khi xem data của team – đây là data của bạn."
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Leader score */}
        <div className="bg-white rounded-[16px] border border-[#ebebeb] p-6 shadow-card text-center hover:shadow-card-hover transition-all">
          <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.12em] mb-4">Chỉ số của leader</p>
          <div className="relative w-28 h-28 mx-auto mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f5f6fa" strokeWidth="10" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={leaderColor} strokeWidth="10"
                strokeDasharray={`${leaderScore * 2.638} 263.8`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-black text-[#1a1a2e] font-header">{leaderDisplay}</span>
            </div>
          </div>
          <p className="text-[12px] text-[#94a3b8]">/ 100 điểm thẳng thắn</p>
        </div>

        {/* Team score */}
        <div className="bg-white rounded-[16px] border border-[#ebebeb] p-6 shadow-card text-center hover:shadow-card-hover transition-all">
          <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.12em] mb-4">Chỉ số trung bình đội nhóm</p>
          <div className="relative w-28 h-28 mx-auto mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f5f6fa" strokeWidth="10" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={teamColor} strokeWidth="10"
                strokeDasharray={`${teamScore * 2.638} 263.8`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-black text-[#1a1a2e] font-header">{teamDisplay}</span>
            </div>
          </div>
          <p className="text-[12px] text-[#94a3b8]">/ 100 điểm thẳng thắn</p>
        </div>
      </div>

      {/* Gap analysis */}
      <div className="bg-white rounded-[16px] border border-[#ebebeb] p-5 shadow-card">
        <div className="mb-4">
          <span className={`text-[11px] font-bold px-3 py-1.5 rounded-[8px] ${gapBadge.cls}`}>
            {gapBadge.text}
          </span>
        </div>
        <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.12em] mb-3">
          Cụm từ mơ hồ leader dùng tuần này
        </p>
        <div className="flex flex-wrap gap-2">
          {MOCK_MIRROR.leaderVaguePhrases.map((phrase, i) => (
            <span key={i} className="text-[11px] font-bold px-3 py-1.5 rounded-[8px] bg-[#fff0f0] text-[#e53e3e] border border-[#fecaca]">
              "{phrase}"
            </span>
          ))}
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
  const [showSlides, setShowSlides] = useState(false)
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 rounded-[16px] border border-[#ebebeb] shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#fff0f0] rounded-[10px] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e53e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-[14px] font-black text-[#1a1a2e] font-header">Phòng Tập Giao Tiếp</h2>
            <p className="text-[12px] text-[#94a3b8] mt-0.5">Viết thử vào ô bên dưới, hệ thống sẽ chỉ ra lỗi né tránh của bạn.</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowSlides(true)}
            className="px-4 py-2 border border-[#ebebeb] bg-[#f5f6fa] text-[#5a6a85] font-bold text-[12px] rounded-[10px] hover:bg-[#f0f0f0] transition-all"
          >
            Ôn lại bài
          </button>
          <button
            onClick={() => setShowSilenceCalc(true)}
            className="px-4 py-2 border border-[#fecaca] bg-[#fff0f0] text-[#e53e3e] font-bold text-[12px] rounded-[10px] hover:bg-[#ffe4e4] transition-all"
          >
            Xem Thiệt Hại Của Im Lặng
          </button>
        </div>
      </div>

      {/* Score bar */}
      {scoreNum !== null && (
        <div className="bg-white rounded-[12px] border border-[#ebebeb] p-3 shadow-card flex items-center gap-4">
          <div className={`px-3 py-1.5 rounded-[8px] font-bold text-[11px] uppercase tracking-wide bg-[#f5f6fa] ${statusColor}`}>{statusLabel}</div>
          <div className="flex-1 h-2 bg-[#f5f6fa] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${scoreNum}%`, backgroundColor: isDirect ? '#10b981' : isVague ? '#f59e0b' : '#e53e3e' }} />
          </div>
          <div className={`font-black font-header text-xl pr-2 ${statusColor}`}>{scoreNum}</div>
        </div>
      )}

      {/* Main input / output panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="bg-white rounded-[16px] border border-[#ebebeb] p-5 shadow-card flex flex-col gap-3">
          <h3 className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.12em] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#e53e3e]" /> Bản Nháp
          </h3>
          <textarea
            value={inputText}
            onChange={e => handleInput(e.target.value)}
            className="w-full h-44 bg-[#f5f6fa] border border-transparent focus:border-[#e53e3e]/30 focus:bg-white rounded-[12px] p-4 text-[13px] text-[#1a1a2e] resize-none outline-none transition-all placeholder-[#c0ccd8]"
            placeholder="VD: Tuần này chắc sẽ hơi trễ xíu, mong mọi người thông cảm bình thường thôi vì task nhiều quá..."
          />
        </div>

        {/* Output */}
        <div className="bg-white rounded-[16px] border border-[#ebebeb] p-5 shadow-card flex flex-col gap-3">
          {!inputText.trim() ? (
            <div className="flex-1 border-2 border-dashed border-[#ebebeb] rounded-[12px] flex flex-col items-center justify-center text-[#c0ccd8] p-6 text-center min-h-[180px]">
              <div className="w-10 h-10 bg-[#f5f6fa] rounded-[10px] flex items-center justify-center mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <p className="text-[12px] font-medium text-[#94a3b8]">Bắt đầu gõ để nhận phân tích từ hệ thống</p>
            </div>
          ) : (
            <div className="flex-1 space-y-4">
              {/* Highlight panel */}
              <div>
                <h3 className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.12em] flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#e53e3e]" /> Phát hiện rào cản
                </h3>
                <div className="bg-[#f5f6fa] rounded-[12px] p-4 text-[13px] leading-loose border border-[#ebebeb]">
                  {highlights.map((seg, i) =>
                    seg.group
                      ? <span key={i} className={highlightClass[seg.group]}>{seg.text}</span>
                      : <span key={i}>{seg.text}</span>
                  )}
                </div>
              </div>

              {/* Rewrite panel */}
              <div>
                <h3 className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.12em] flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" /> Gợi ý viết lại
                </h3>
                <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-[12px] p-4 text-[13px] text-[#065f46] leading-relaxed">
                  {rewritten}
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-[#f0f0f0]">
                <span className="text-[10px] px-2 py-1 rounded-[6px] bg-red-50 text-red-700 font-bold">Im lặng</span>
                <span className="text-[10px] px-2 py-1 rounded-[6px] bg-amber-50 text-amber-700 font-bold">Mơ hồ</span>
                <span className="text-[10px] px-2 py-1 rounded-[6px] bg-green-50 text-green-700 font-bold">Thẳng thắn</span>
                <span className="text-[10px] px-2 py-1 rounded-[6px] bg-purple-50 text-purple-700 font-bold">Giữ thể diện</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scenario practice */}
      <div className="bg-white rounded-[16px] border border-[#ebebeb] p-5 shadow-card">
        <h3 className="text-[14px] font-black text-[#1a1a2e] font-header mb-4">
          Luyện Phản Xạ Tình Huống
        </h3>

        {/* Group tabs */}
        <div className="flex gap-1 mb-4 bg-[#f5f6fa] p-1 rounded-[10px] w-max border border-[#ebebeb]">
          {([['A', 'Leader & Bạn'], ['B', 'Đồng nghiệp'], ['C', 'Tự chịu trách nhiệm']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setScenarioGroup(key); setScenarioIdx(0); setScenarioResponse(''); setScenarioScore(null) }}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-[8px] transition-all ${
                scenarioGroup === key
                  ? 'bg-white text-[#1a1a2e] shadow-sm border border-[#ebebeb]'
                  : 'text-[#94a3b8] hover:text-[#5a6a85]'
              }`}
            >
              {key} – {label}
            </button>
          ))}
        </div>

        {/* Scenario card */}
        <div className="bg-[#f5f6fa] border border-[#ebebeb] rounded-[12px] p-4 mb-3">
          <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.12em] mb-1.5">Tình huống</p>
          <p className="text-[13px] text-[#1a1a2e] leading-relaxed">{currentScenario}</p>
        </div>

        <textarea
          value={scenarioResponse}
          onChange={e => handleScenarioResponse(e.target.value)}
          rows={3}
          className="w-full bg-[#f5f6fa] border border-transparent focus:border-[#e53e3e]/30 focus:bg-white rounded-[12px] p-4 text-[13px] text-[#1a1a2e] resize-none outline-none transition-all placeholder-[#c0ccd8] mb-3"
          placeholder="Gõ phản hồi của bạn..."
        />

        <div className="flex items-center justify-between flex-wrap gap-3">
          {sScoreNum !== null && (
            <span className={`text-[11px] font-bold px-3 py-1.5 rounded-[8px] bg-[#f5f6fa] ${sColor}`}>{sLabel}</span>
          )}
          <button
            onClick={pickNextScenario}
            className="ml-auto px-4 py-2 bg-[#1a1a2e] text-white font-bold text-[12px] rounded-[10px] hover:bg-[#2d2d4e] transition-all active:scale-[0.97]"
          >
            Kịch bản tiếp theo
          </button>
        </div>
      </div>

      {showSilenceCalc && <SilenceCostModal onClose={() => setShowSilenceCalc(false)} />}
      {showSlides && <TrainingSlides onClose={() => setShowSlides(false)} />}
    </div>
  )
}

// ─── Silence Cost Modal ───────────────────────────────────────────
function SilenceCostModal({ onClose }: { onClose: () => void }) {
  const [days, setDays] = useState(3)
  const [people, setPeople] = useState(3)
  const costMoney = Math.round((days * people * 200000) / 1000) * 1000
  const costHours = Math.round(days * people * 2)

  const hoursDisplay = useCountUp(costHours, 600)
  const moneyDisplay = useCountUp(costMoney, 600)

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#1a1a2e]/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-[18px] shadow-modal overflow-hidden border border-[#ebebeb]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0]">
          <h3 className="text-[14px] font-black text-[#1a1a2e] font-header">Tính Tổn Thất Của Im Lặng</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-[7px] bg-[#f5f6fa] flex items-center justify-center text-[#5a6a85] hover:bg-[#f0f0f0] transition-colors text-[12px] font-bold">✕</button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-[#f5f6fa] p-4 rounded-[12px] border border-[#ebebeb]">
            <label className="text-[11px] font-bold text-[#5a6a85] block mb-3">Bạn đã trì hoãn nói chuyện bao nhiêu ngày?</label>
            <div className="flex items-center gap-4">
              <input type="range" min={1} max={30} value={days} onChange={e => setDays(Number(e.target.value))} className="flex-1 accent-[#e53e3e]" />
              <span className="w-14 text-right font-black text-[#e53e3e] text-[18px]">{days}D</span>
            </div>
          </div>

          <div className="bg-[#f5f6fa] p-4 rounded-[12px] border border-[#ebebeb]">
            <label className="text-[11px] font-bold text-[#5a6a85] block mb-3">Vấn đề này dính líu bao nhiêu người?</label>
            <div className="flex items-center gap-4">
              <input type="range" min={1} max={20} value={people} onChange={e => setPeople(Number(e.target.value))} className="flex-1 accent-[#1a1a2e]" />
              <span className="w-14 text-right font-black text-[#1a1a2e] text-[18px]">{people}P</span>
            </div>
          </div>

          <div className="border-t border-[#f0f0f0] pt-4">
            <p className="text-center text-[10px] uppercase font-bold text-[#94a3b8] mb-3 tracking-[0.12em]">Sự mập mờ đang gây thiệt hại</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center bg-[#fff0f0] rounded-[12px] p-4 border border-[#fecaca]">
                <p className="text-[10px] font-bold text-[#e53e3e] mb-1">Lãng phí</p>
                <p className="text-3xl font-black font-header text-[#e53e3e]">{hoursDisplay}h</p>
                <p className="text-[10px] text-[#e53e3e]/70 mt-1">xử lý hậu quả</p>
              </div>
              <div className="text-center bg-[#fffbeb] rounded-[12px] p-4 border border-[#fde68a]">
                <p className="text-[10px] font-bold text-[#d97706] mb-1">Ước tính</p>
                <p className="text-xl font-black font-header text-[#d97706] mt-1">{moneyDisplay.toLocaleString('vi-VN')}₫</p>
                <p className="text-[10px] text-[#d97706]/70 mt-1">mất trắng</p>
              </div>
            </div>
          </div>

          <button onClick={onClose} className="w-full py-3 bg-[#e53e3e] text-white rounded-[12px] font-bold text-[13px] shadow-red-glow hover:bg-[#c53030] active:scale-[0.98] transition-all">
            Tôi Sẽ Nói Thẳng Ngay Bây Giờ
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Training Slides ──────────────────────────────────────────────
function TrainingSlides({ onClose }: { onClose: () => void }) {
  const [slide, setSlide] = useState(0)
  const [countdown, setCountdown] = useState(5)
  const isLast = slide === TRAINING_SLIDES.length - 1
  const canClose = !isLast || countdown === 0

  useEffect(() => {
    if (!isLast) return
    if (countdown === 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [isLast, countdown])

  useEffect(() => {
    if (slide !== TRAINING_SLIDES.length - 1) setCountdown(5)
  }, [slide])

  const current = TRAINING_SLIDES[slide]

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4" style={{ background: 'rgba(15, 23, 42, 0.95)' }}>
      <div className="w-full max-w-lg animate-slide-up">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {TRAINING_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`transition-all duration-300 rounded-full ${
                i === slide ? 'w-8 h-2.5 bg-[#10b981]' : 'w-2.5 h-2.5 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Slide card */}
        <div className="bg-[#1e293b] rounded-[18px] p-8 border border-white/10 shadow-modal">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-3">{current.sub}</p>
          <h2 className="text-2xl font-black text-white font-header leading-tight mb-4">{current.title}</h2>
          <p className="text-[14px] text-white/70 leading-relaxed">{current.body}</p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setSlide(s => Math.max(0, s - 1))}
            disabled={slide === 0}
            className="px-4 py-2.5 text-[12px] font-bold text-white/50 hover:text-white/80 disabled:opacity-30 transition-colors"
          >
            Quay lại
          </button>

          {isLast ? (
            <button
              onClick={onClose}
              disabled={!canClose}
              className={`px-6 py-3 rounded-[12px] text-[13px] font-bold transition-all ${
                canClose
                  ? 'bg-[#10b981] text-white hover:bg-[#059669] shadow-lg active:scale-[0.97]'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              {canClose ? 'Tôi hiểu — bắt đầu luyện tập' : `Tiếp tục đọc (${countdown}s)`}
            </button>
          ) : (
            <button
              onClick={() => setSlide(s => s + 1)}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-[13px] font-bold rounded-[12px] transition-all"
            >
              Tiếp theo
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
