import React, { useState, useEffect } from 'react'
import type {
  AuthUser, CultureStory, Challenge, BehaviorScores,
  JourneyMilestoneRecord, TeamHealth, TeamAnalysis,
  ExperienceType, CourageLevel, SupportType, OrgStructure,
} from '../../../shared/types'
import { cultureService } from '../services/culture.service'
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner'
import { Badge } from '../../../shared/components/Badge'
import { Modal } from '../../../shared/components/Modal'
import { EmptyState } from '../../../shared/components/EmptyState'
import { RadarChart } from '../../../shared/components/RadarChart'
import { LineChart } from '../../../shared/components/LineChart'
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary'
import { Skeleton, CardSkeleton } from '../../../shared/components/Skeleton'

interface CulturePageProps {
  user: AuthUser
}

type TabKey = 'home' | 'challenges' | 'share' | 'knowledge' | 'journey' | 'health'

const tabs: { key: TabKey; label: string; icon: string; roles?: string[] }[] = [
  { key: 'home', label: 'Trang chủ', icon: '🏡' },
  { key: 'challenges', label: 'Thử thách', icon: '⚡' },
  { key: 'share', label: 'Chia sẻ', icon: '📖' },
  { key: 'knowledge', label: 'Kho bài học', icon: '💡' },
  { key: 'journey', label: 'Hành trình', icon: '🗺️' },
  { key: 'health', label: 'Sức khỏe Team', icon: '💚', roles: ['hr_manager'] },
]

// Journey Memory mock data
const JOURNEY_MEMORIES: Record<string, {
  title: string
  story: string
  date: string
  xp: number
  courage: string
}> = {
  '1m': {
    title: 'Bài đầu tiên tôi dám hỏi',
    story: 'Đây là lần đầu tiên tôi dám giơ tay hỏi trong meeting team, dù trước đó tôi đã ngồi im 3 tuần liên tiếp vì sợ hỏi câu ngớ ngẩn. Kết quả: câu hỏi của tôi đã giải quyết được một vấn đề mà cả team đang thắc mắc.',
    date: '2026-01-15',
    xp: 50,
    courage: 'big',
  },
  '3m': {
    title: 'Tôi nói thẳng với leader lần đầu tiên',
    story: 'Sau 3 tháng, tôi đã dám nói thẳng với leader rằng deadline đang bất khả thi. Trước đây tôi sẽ chỉ "cố gắng" và im lặng. Lần này, tôi đưa ra timeline thực tế và đề xuất giải pháp. Cả team đều cảm ơn tôi vì sự thẳng thắn đó.',
    date: '2026-03-10',
    xp: 80,
    courage: 'breakthrough',
  },
  '6m': {
    title: 'Bài học từ sự thất bại đầu tiên',
    story: 'Tháng thứ 6, tôi thất bại trong một pitch quan trọng. Thay vì giữ im, tôi chia sẻ với team về những gì tôi đã học được từ thất bại đó. Được nhận 12 react "🤗" — nhiều nhất từ trước đến nay.',
    date: '2026-06-05',
    xp: 120,
    courage: 'breakthrough',
  },
  '1y': {
    title: '1 năm: Tôi đã trở thành người khác',
    story: 'Nhìn lại 1 năm: từ một người sợ hỏi câu ngớ ngẩn, tôi đã trở thành người đầu tiên lên tiếng trong mỗi buổi meeting. Culture XP của tôi đã đạt 1240, và điều tôi tự hào nhất không phải con số đó — mà là sự bình thản khi nói thật.',
    date: '2026-12-01',
    xp: 200,
    courage: 'breakthrough',
  },
}

export function CulturePage({ user }: CulturePageProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('home')
  const [showShareModal, setShowShareModal] = useState(false)

  const visibleTabs = tabs.filter((t) => !t.roles || t.roles.includes(user.role))

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-sm">🌱</div>
            <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-widest">HR Tool</p>
          </div>
          <h1 className="text-2xl font-bold text-nquoc-text font-header">NhiLe Culture OS</h1>
          <p className="text-sm text-nquoc-muted mt-1">Xây dựng văn hóa tổ chức từ những hành động nhỏ mỗi ngày</p>
        </div>
        {(activeTab === 'home' || activeTab === 'share') && (
          <button
            id="share-story-btn"
            onClick={() => setShowShareModal(true)}
            className="px-5 py-2.5 bg-gradient-indigo text-white rounded-2xl text-sm font-bold hover:opacity-90 transition-all active:scale-95 shadow-nquoc"
          >
            + Chia sẻ câu chuyện
          </button>
        )}
      </div>

      {/* Tab nav */}
      <div className="flex gap-1.5 flex-wrap">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            id={`culture-tab-${tab.key}`}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-gradient-indigo text-white shadow-nquoc scale-[1.03]'
                : 'bg-white text-nquoc-muted border border-nquoc-border hover:text-nquoc-text hover:bg-nquoc-hover'
            }`}
          >
            <span className="text-base leading-none">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in" key={activeTab}>
        {activeTab === 'home' && <HomeFeed user={user} />}
        {activeTab === 'challenges' && <ChallengesTab />}
        {activeTab === 'share' && (
          <div className="bg-white rounded-[32px] border border-nquoc-border p-16 text-center shadow-card">
            <div className="text-5xl mb-4 animate-float inline-block">📖</div>
            <h3 className="text-xl font-bold text-nquoc-text font-header">Chia sẻ câu chuyện của bạn</h3>
            <p className="text-sm text-nquoc-muted mt-2 max-w-xs mx-auto leading-relaxed">
              Dùng nút "Chia sẻ câu chuyện" ở góc trên phải để đăng bài.
            </p>
            <button
              onClick={() => setShowShareModal(true)}
              className="mt-6 px-8 py-3 bg-gradient-indigo text-white rounded-2xl text-sm font-bold hover:opacity-90 transition-all shadow-nquoc"
            >
              + Bắt đầu chia sẻ
            </button>
          </div>
        )}
        {activeTab === 'knowledge' && <KnowledgeBase />}
        {activeTab === 'journey' && <JourneyTab user={user} />}
        {activeTab === 'health' && <TeamHealthTab />}
      </div>

      {showShareModal && (
        <ShareStoryModal user={user} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  )
}

// ── Home Feed — Bento asymmetric grid ──
function HomeFeed({ user: _user }: { user: AuthUser }) {
  const [stories, setStories] = useState<CultureStory[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [meta, setMeta] = useState<{ next_cursor?: string; has_next: boolean } | null>(null)

  useEffect(() => {
    cultureService.getFeed().then((res) => {
      setStories(res.items)
      setMeta(res.meta)
      setLoading(false)
    })
  }, [])

  const loadMore = async () => {
    if (!meta?.next_cursor || loadingMore) return
    setLoadingMore(true)
    try {
      const res = await cultureService.getFeed({ cursor: meta.next_cursor })
      setStories(prev => [...prev, ...res.items])
      setMeta(res.meta)
    } finally {
      setLoadingMore(false)
    }
  }

  if (loading) return (
    <div className="space-y-4">
      <CardSkeleton />
      <div className="grid grid-cols-2 gap-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  )

  if (stories.length === 0) {
    return <EmptyState icon="📖" title="Chưa có câu chuyện" description="Hãy là người đầu tiên chia sẻ câu chuyện!" />
  }

  return (
    <div className="pb-10">
      <ErrorBoundary feature="Bảng tin Văn hóa">
        {/* Bento-style grid: first item full-width (if breakthrough), rest in columns */}
        <div className="space-y-4">
          {stories.map((story, index) => (
            <StoryCard
              key={story.id}
              story={story}
              featured={index === 0 && story.courage_level === 'breakthrough'}
            />
          ))}
        </div>

        {meta?.has_next && (
          <div className="pt-6 flex justify-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-8 py-3 bg-white border border-nquoc-border rounded-2xl text-sm font-bold text-indigo-600
                hover:bg-indigo-50 hover:border-indigo-200 transition-all active:scale-95 shadow-card"
            >
              {loadingMore ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                  Đang tải...
                </span>
              ) : 'Xem thêm câu chuyện →'}
            </button>
          </div>
        )}
      </ErrorBoundary>
    </div>
  )
}

// ── Story Card ──
function StoryCard({ story, featured }: { story: CultureStory; featured?: boolean }) {
  const [reacted, setReacted] = useState<string | null>(null)
  const [reactions, setReactions] = useState({ fire: 12, idea: 8, hug: 5 })

  const expLabels: Record<string, string> = {
    judgement: 'Phán đoán', communication: 'Giao tiếp',
    execution: 'Thực thi', priority: 'Ưu tiên',
    late_ask: 'Thiếu hỏi sớm', overstepping: 'Vượt quyền',
  }
  const courageConfig: Record<string, { label: string; variant: 'blue' | 'indigo' | 'emerald'; gradient: string }> = {
    small: { label: 'Làm nhỏ', variant: 'blue', gradient: 'from-blue-500 to-indigo-600' },
    big: { label: 'Làm lớn', variant: 'indigo', gradient: 'from-indigo-500 to-violet-600' },
    breakthrough: { label: '🚀 Breakthrough', variant: 'emerald', gradient: 'from-emerald-500 to-teal-600' },
  }

  const courage = courageConfig[story.courage_level] ?? courageConfig.small

  const handleReact = (type: string) => {
    if (reacted === type) {
      setReacted(null)
      setReactions(r => ({ ...r, [type]: r[type as keyof typeof r] - 1 }))
    } else {
      if (reacted) setReactions(r => ({ ...r, [reacted]: r[reacted as keyof typeof r] - 1 }))
      setReacted(type)
      setReactions(r => ({ ...r, [type]: r[type as keyof typeof r] + 1 }))
    }
  }

  return (
    <div className={`bg-white border border-nquoc-border shadow-card card-lift animate-slide-up
      ${featured ? 'rounded-[32px] p-7' : 'rounded-[28px] p-6'}`}>

      {/* Featured tag */}
      {featured && (
        <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold text-white uppercase tracking-wider
          px-3 py-1 rounded-full mb-4 bg-gradient-to-r ${courage.gradient}`}>
          ✨ Câu chuyện nổi bật
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm
          bg-gradient-to-br ${courage.gradient} ${featured ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm'}`}>
          {story.user?.name?.charAt(0) ?? '?'}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-nquoc-text">{story.user?.name ?? 'Ẩn danh'}</p>
          <p className="text-[10px] text-nquoc-muted font-medium">
            {story.team?.name} · {new Date(story.created_at).toLocaleDateString('vi-VN')}
          </p>
        </div>
        <Badge variant={courage.variant} size="sm" className="font-bold">{courage.label}</Badge>
      </div>

      {/* Tags */}
      <div className="flex gap-2 flex-wrap mb-3">
        <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-bold border border-indigo-100">
          #{expLabels[story.experience_type] ?? story.experience_type}
        </span>
        {story.courage_level === 'breakthrough' && (
          <span className="text-xs bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full font-bold border border-amber-100">
            #DámSai
          </span>
        )}
        <span className="text-xs bg-slate-50 text-slate-500 px-2.5 py-1 rounded-full border border-slate-100">#DámLàm</span>
      </div>

      {/* Content */}
      <p className={`text-sm text-nquoc-text leading-relaxed ${featured ? '' : 'line-clamp-3'}`}>
        {story.content}
      </p>

      {/* Reactions */}
      <div className="flex items-center gap-3 pt-3 mt-3 border-t border-nquoc-border">
        {[
          { key: 'fire', icon: '🔥', label: 'Bùng cháy' },
          { key: 'idea', icon: '💡', label: 'Học được' },
          { key: 'hug', icon: '🤗', label: 'Đồng cảm' },
        ].map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => handleReact(key)}
            title={label}
            className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all active:scale-95 ${
              reacted === key
                ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                : 'text-nquoc-muted hover:bg-slate-50 hover:text-slate-600'
            }`}
          >
            {icon} <span>{reactions[key as keyof typeof reactions]}</span>
          </button>
        ))}
        <div className="ml-auto">
          <Badge variant="emerald" size="sm" className="font-bold">+{story.courage_level === 'breakthrough' ? 30 : story.courage_level === 'big' ? 20 : 10} XP</Badge>
        </div>
      </div>
    </div>
  )
}

// ── Challenges Tab ──
function ChallengesTab() {
  const [data, setData] = useState<{ weekly: Challenge; daily: Challenge[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitChallenge, setSubmitChallenge] = useState<Challenge | null>(null)

  useEffect(() => {
    cultureService.getChallenges().then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingSpinner />
  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Weekly challenge — Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[32px] p-8 text-white shadow-nquoc-lg noise">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold uppercase tracking-widest opacity-70">Thử thách tuần này</span>
            <Badge variant="emerald" size="sm" className="bg-white/20 border-white/20 text-white">{data.weekly.points} XP</Badge>
          </div>
          <p className="text-lg font-bold font-header leading-snug mb-5">{data.weekly.text}</p>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs opacity-70">
              ⏰ Hết hạn: {new Date(data.weekly.active_until).toLocaleDateString('vi-VN')}
            </p>
            <button
              onClick={() => setSubmitChallenge(data.weekly)}
              className="px-6 py-2.5 bg-white text-violet-700 rounded-2xl text-sm font-bold hover:bg-violet-50 transition-all active:scale-95 shadow-sm"
            >
              ✅ Nộp bằng chứng
            </button>
          </div>
        </div>
      </div>

      {/* Daily challenges */}
      <div>
        <h2 className="text-sm font-bold text-nquoc-text font-header mb-3 flex items-center gap-2">
          ⚡ Thử thách hôm nay
          <Badge variant="blue" size="sm">Hàng ngày</Badge>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.daily.map((ch) => (
            <div key={ch.id} className="bg-white rounded-[24px] border border-nquoc-border p-5 space-y-3 card-lift shadow-card">
              <p className="text-sm text-nquoc-text leading-relaxed font-medium">{ch.text}</p>
              <div className="flex items-center justify-between">
                <Badge variant="indigo" size="sm" className="font-bold">{ch.points} XP</Badge>
                <button
                  onClick={() => setSubmitChallenge(ch)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 border border-indigo-200 rounded-xl px-3 py-1.5 hover:bg-indigo-50 transition-all"
                >
                  Nộp bằng chứng →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {submitChallenge && (
        <SubmitEvidenceModal challenge={submitChallenge} onClose={() => setSubmitChallenge(null)} />
      )}
    </div>
  )
}

// ── Submit Evidence Modal ──
function SubmitEvidenceModal({ challenge, onClose }: { challenge: Challenge; onClose: () => void }) {
  const [proof, setProof] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ approved: boolean; awarded_points: number; ai_feedback: string; ai_reason: string } | null>(null)

  const handleSubmit = async () => {
    if (proof.length < 50) return
    setLoading(true)
    try {
      const r = await cultureService.submitChallenge({ challenge_id: challenge.id, proof_text: proof })
      setResult(r)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen title="Nộp bằng chứng" onClose={onClose} size="md">
      <div className="p-6 space-y-4">
        <div className="bg-nquoc-bg rounded-2xl p-4 border border-nquoc-border">
          <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-wider mb-2">Thử thách</p>
          <p className="text-sm text-nquoc-text leading-relaxed">{challenge.text}</p>
          <Badge variant="indigo" size="sm" className="mt-2 font-bold">{challenge.points} điểm tối đa</Badge>
        </div>

        {!result ? (
          <>
            <div>
              <label className="text-[10px] font-bold text-nquoc-muted uppercase tracking-wider block mb-2">
                Mô tả bằng chứng
                <span className="normal-case font-normal text-nquoc-muted ml-1">(tối thiểu 50 ký tự)</span>
              </label>
              <textarea
                value={proof}
                onChange={(e) => setProof(e.target.value)}
                placeholder="Mô tả hành động cụ thể bạn đã thực hiện, có thể đo lường được..."
                className="w-full h-32 border-2 border-nquoc-border rounded-2xl px-4 py-3 text-sm text-nquoc-text resize-none
                  focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all placeholder-slate-300"
              />
              <p className={`text-xs mt-1 ${proof.length >= 50 ? 'text-emerald-600 font-bold' : 'text-nquoc-muted'}`}>
                {proof.length}/50 ký tự {proof.length >= 50 ? '✓' : `(cần thêm ${50 - proof.length})`}
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={proof.length < 50 || loading}
              className="w-full py-3.5 bg-gradient-indigo text-white rounded-2xl text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-all active:scale-95 shadow-nquoc"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  AI đang chấm điểm...
                </span>
              ) : '🚀 Nộp bằng chứng'}
            </button>
          </>
        ) : (
          <div className="space-y-4 animate-bounce-in">
            <div className={`rounded-2xl p-5 text-center ${
              result.approved ? 'bg-emerald-50 border border-emerald-200' : 'bg-rose-50 border border-rose-200'
            }`}>
              <div className="text-4xl mb-3">{result.approved ? '🏆' : '💪'}</div>
              <p className={`font-bold font-header text-lg ${result.approved ? 'text-emerald-700' : 'text-rose-700'}`}>
                {result.approved ? `Xuất sắc! +${result.awarded_points} XP` : 'Chưa đạt — Thử lại!'}
              </p>
              <p className="text-sm mt-2 text-nquoc-muted leading-relaxed">{result.ai_feedback}</p>
              {result.ai_reason && (
                <p className="text-xs mt-2 italic text-nquoc-muted">{result.ai_reason}</p>
              )}
            </div>
            {!result.approved && (
              <button onClick={() => setResult(null)}
                className="w-full py-3 border-2 border-nquoc-border text-nquoc-muted rounded-2xl text-sm font-bold hover:bg-nquoc-hover transition-all">
                Viết lại bằng chứng
              </button>
            )}
            <button onClick={onClose}
              className="w-full py-3 bg-gradient-indigo text-white rounded-2xl text-sm font-bold hover:opacity-90 transition-all shadow-nquoc">
              Đóng
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}

// ── Knowledge Base ──
function KnowledgeBase() {
  const [stories, setStories] = useState<CultureStory[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => {
    cultureService.getLessons().then((s) => {
      setStories(s)
      setLoading(false)
    })
  }, [])

  const filtered = stories.filter(
    (s) => !q || s.content.toLowerCase().includes(q.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-5">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
        <input
          id="knowledge-search"
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm kiếm bài học, loại công việc, từ khóa..."
          className="w-full border-2 border-nquoc-border rounded-2xl pl-10 pr-4 py-3 text-sm
            focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 bg-white transition-all"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🔍" title="Không tìm thấy" description="Thử từ khóa khác." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((story) => (
            <div key={story.id} className="bg-white rounded-[28px] border border-nquoc-border p-6 space-y-3 card-lift shadow-card">
              <div className="flex items-center gap-2">
                <Badge variant="indigo" size="sm" className="font-bold">{story.experience_type}</Badge>
                {story.courage_level === 'breakthrough' && (
                  <Badge variant="emerald" size="sm" className="font-bold">🚀 Breakthrough</Badge>
                )}
              </div>
              <p className="text-sm text-nquoc-text leading-relaxed line-clamp-3">{story.content}</p>
              <p className="text-xs text-nquoc-muted italic flex items-center gap-1.5">
                <span>💡</span>
                <span>{story.team?.name} · {new Date(story.created_at).toLocaleDateString('vi-VN')}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Journey Tab — với Memory Feature ──
function JourneyTab({ user: _user }: { user: AuthUser }) {
  const [data, setData] = useState<{
    milestones: JourneyMilestoneRecord[]
    current_scores: BehaviorScores
    radar_data: { try: number; share: number; learn: number; help: number }
  } | null>(null)
  const [trend, setTrend] = useState<{ week_of: string; try_score: number; help_score: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMemory, setSelectedMemory] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      cultureService.getJourneyMe(),
      cultureService.getJourneyTrend(),
    ]).then(([d, t]) => {
      setData(d)
      setTrend(t as { week_of: string; try_score: number; help_score: number }[])
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-40 w-full rounded-[32px]" />
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-[28px]" />)}
      </div>
    </div>
  )
  if (!data) return null

  const milestoneOrder: JourneyMilestoneRecord['milestone'][] = ['1m', '3m', '6m', '1y', 'out']
  const milestoneConfig: Record<string, { label: string; icon: string; gradient: string }> = {
    '1m':  { label: '1 Tháng',  icon: '🌱', gradient: 'from-emerald-400 to-teal-500' },
    '3m':  { label: '3 Tháng',  icon: '🌿', gradient: 'from-blue-400 to-indigo-500' },
    '6m':  { label: '6 Tháng',  icon: '🌲', gradient: 'from-violet-400 to-purple-600' },
    '1y':  { label: '1 Năm',    icon: '🏆', gradient: 'from-amber-400 to-orange-500' },
    'out': { label: 'Out Team', icon: '🦋', gradient: 'from-rose-400 to-pink-600' },
  }

  return (
    <ErrorBoundary feature="Hành trình Văn hóa">
      <div className="space-y-6">

        {/* Journey Timeline — Milestone with Memory */}
        <div className="bg-white rounded-[32px] border border-nquoc-border p-8 shadow-card">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-widest">Dòng thời gian</p>
              <h2 className="text-base font-bold text-nquoc-text font-header mt-0.5">Cột mốc hành trình</h2>
            </div>
            <p className="text-xs text-nquoc-muted italic">Click vào mốc đã đạt để xem kỷ niệm 💭</p>
          </div>

          <div className="flex items-start overflow-x-auto pb-4">
            {milestoneOrder.map((m, i) => {
              const record = data.milestones.find((r) => r.milestone === m)
              const completed = !!record
              const hasMemory = !!JOURNEY_MEMORIES[m]
              const cfg = milestoneConfig[m]

              return (
                <React.Fragment key={m}>
                  <div className="flex flex-col items-center min-w-[80px]">
                    <button
                      onClick={() => completed && hasMemory ? setSelectedMemory(m) : undefined}
                      className={`w-16 h-16 rounded-[20px] flex items-center justify-center text-2xl
                        transition-all duration-300 relative
                        ${completed
                          ? `bg-gradient-to-br ${cfg.gradient} shadow-nquoc-md scale-110 hover:scale-125 cursor-pointer`
                          : 'bg-slate-100 cursor-default opacity-50'
                        }`}
                      title={completed && hasMemory ? 'Click để xem kỷ niệm' : undefined}
                    >
                      {completed ? cfg.icon : <span className="text-slate-400 text-xl font-bold">{i + 1}</span>}
                      {completed && hasMemory && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-[8px] text-white font-bold shadow-sm">
                          💭
                        </span>
                      )}
                    </button>
                    <p className="text-[10px] font-bold text-nquoc-muted mt-3 text-center uppercase tracking-tight">
                      {cfg.label}
                    </p>
                    {record && (
                      <p className="text-[10px] text-indigo-500 font-bold mt-0.5">
                        {new Date(record.completed_at).toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' })}
                      </p>
                    )}
                  </div>
                  {i < milestoneOrder.length - 1 && (
                    <div className={`flex-1 h-0.5 mt-8 mx-1 transition-all duration-700 ${
                      completed ? `bg-gradient-to-r ${cfg.gradient}` : 'bg-slate-100'
                    }`} />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* Behavior scores */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1 bg-white rounded-[32px] border border-nquoc-border p-8 shadow-card">
            <div className="mb-5">
              <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-widest">Nhận diện</p>
              <h3 className="text-base font-bold text-nquoc-text font-header mt-0.5">Định danh văn hóa</h3>
            </div>
            <div className="h-[240px]">
              <RadarChart
                labels={['Dám làm', 'Chia sẻ', 'Học hỏi', 'Hỗ trợ']}
                data={[data.radar_data.try, data.radar_data.share, data.radar_data.learn, data.radar_data.help]}
                max={10}
                color="#4f46e5"
              />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: 'try_score', label: 'Dám làm', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: '⚡' },
                { key: 'share_score', label: 'Chia sẻ', color: 'text-violet-600', bg: 'bg-violet-50', icon: '💬' },
                { key: 'learn_score', label: 'Học hỏi', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '📚' },
                { key: 'help_score', label: 'Hỗ trợ', color: 'text-amber-600', bg: 'bg-amber-50', icon: '🤝' },
              ].map((dim) => (
                <div key={dim.key} className={`${dim.bg} rounded-[24px] p-5 border border-white card-lift`}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span>{dim.icon}</span>
                    <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-wider">{dim.label}</p>
                  </div>
                  <p className={`text-3xl font-extrabold font-header ${dim.color}`}>
                    {(data.current_scores[dim.key as keyof BehaviorScores] as number).toFixed(1)}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-[28px] border border-nquoc-border p-6 shadow-card h-[180px]">
              <LineChart
                labels={trend.slice(-6).map(t => t.week_of)}
                datasets={[
                  { label: 'Dám làm', data: trend.slice(-6).map(t => t.try_score), color: '#4f46e5' },
                  { label: 'Hỗ trợ', data: trend.slice(-6).map(t => t.help_score), color: '#f59e0b' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* XP Banner */}
        <div className="bg-gradient-indigo rounded-[32px] p-8 flex items-center justify-between text-white shadow-nquoc-lg relative overflow-hidden noise">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <span className="text-[120px] font-extrabold">XP</span>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Uy tín cá nhân</p>
            <div className="flex items-baseline gap-2">
              <p className="text-6xl font-extrabold font-header tracking-tighter">{data.current_scores.total_xp}</p>
              <p className="text-2xl font-bold opacity-70 font-header">Culture XP</p>
            </div>
          </div>
          <div className="text-right relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Chuỗi ngày bền bỉ</p>
            <div className="glass rounded-2xl px-6 py-3 border border-white/20">
              <p className="text-3xl font-extrabold font-header">{data.current_scores.streak} 🔥</p>
            </div>
          </div>
        </div>
      </div>

      {/* Journey Memory Modal */}
      {selectedMemory && JOURNEY_MEMORIES[selectedMemory] && (
        <JourneyMemoryModal
          milestone={selectedMemory}
          memory={JOURNEY_MEMORIES[selectedMemory]}
          config={milestoneConfig[selectedMemory]}
          onClose={() => setSelectedMemory(null)}
        />
      )}
    </ErrorBoundary>
  )
}

// ── Journey Memory Modal ──
function JourneyMemoryModal({ memory, config, onClose }: {
  milestone?: string
  memory: { title: string; story: string; date: string; xp: number; courage: string }
  config: { label: string; icon: string; gradient: string }
  onClose: () => void
}) {
  return (
    <Modal isOpen title="" onClose={onClose} size="md">
      <div className="p-6 animate-scale-in">
        {/* Memory header */}
        <div className={`bg-gradient-to-br ${config.gradient} rounded-[28px] p-6 text-white mb-5 relative overflow-hidden`}>
          <div className="absolute -right-6 -bottom-6 text-7xl opacity-20 pointer-events-none">{config.icon}</div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Kỷ niệm tại · {config.label}</p>
            <h3 className="text-xl font-bold font-header leading-tight">{memory.title}</h3>
            <div className="flex items-center gap-3 mt-3">
              <p className="text-xs opacity-80">{new Date(memory.date).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <Badge variant="emerald" size="sm" className="bg-white/20 border-white/20 text-white font-bold">+{memory.xp} XP</Badge>
            </div>
          </div>
        </div>

        {/* Memory content */}
        <div className="bg-nquoc-bg rounded-2xl p-5 border border-nquoc-border mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">💭</span>
            <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-wider">Bài đăng kỷ niệm của bạn</p>
          </div>
          <p className="text-sm text-nquoc-text leading-relaxed">{memory.story}</p>
        </div>

        {/* Courage badge */}
        <div className="flex items-center justify-between">
          <Badge variant={memory.courage === 'breakthrough' ? 'emerald' : 'indigo'} size="md" className="font-bold">
            {memory.courage === 'breakthrough' ? '🚀 Breakthrough' : memory.courage === 'big' ? '💪 Làm lớn' : '🌱 Làm nhỏ'}
          </Badge>
          <button onClick={onClose}
            className="px-5 py-2.5 bg-gradient-indigo text-white rounded-2xl text-sm font-bold hover:opacity-90 transition-all shadow-nquoc">
            Đóng lại
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Team Health Tab ──
function TeamHealthTab() {
  const [teams, setTeams] = useState<TeamHealth[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const [insights, setInsights] = useState<Record<string, TeamAnalysis>>({})

  useEffect(() => {
    cultureService.getTeamHealth().then((t) => {
      setTeams(t)
      setLoading(false)
    })
  }, [])

  const handleAnalyze = async (teamId: string) => {
    setAnalyzing(teamId)
    try {
      const result = await cultureService.analyzeTeamHealth({ team_id: teamId, period: '2026-04' })
      setInsights((prev) => ({ ...prev, [teamId]: result }))
    } finally {
      setAnalyzing(null)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      {teams.map((team) => (
        <div key={team.team_id} className="bg-white rounded-[32px] border border-nquoc-border p-7 shadow-card">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-nquoc-text font-header">{team.team_name}</h3>
              <p className="text-xs text-nquoc-muted">{team.member_count} thành viên</p>
            </div>
            <button
              onClick={() => handleAnalyze(team.team_id)}
              disabled={analyzing === team.team_id}
              className="text-xs font-bold text-indigo-600 border border-indigo-200 rounded-xl px-4 py-2
                hover:bg-indigo-50 disabled:opacity-50 transition-all active:scale-95"
            >
              {analyzing === team.team_id ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                  Đang phân tích...
                </span>
              ) : '✨ AI Phân tích'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div className="bg-indigo-50 rounded-2xl p-4">
              <p className="text-[10px] text-nquoc-muted font-bold uppercase tracking-wider mb-1">Health Index</p>
              <p className="text-2xl font-extrabold text-indigo-600 font-header">{team.health_index}%</p>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-4">
              <p className="text-[10px] text-nquoc-muted font-bold uppercase tracking-wider mb-1">Support Rate</p>
              <p className="text-2xl font-extrabold text-emerald-600 font-header">{team.support_rate}%</p>
            </div>
            {Object.entries(team.avg_scores_json).filter(([k]) => k !== 'insights').slice(0, 2).map(([k, v]) => (
              <div key={k} className="bg-nquoc-bg rounded-2xl p-4">
                <p className="text-[10px] text-nquoc-muted font-bold uppercase tracking-wider mb-1">{k}</p>
                <p className="text-2xl font-extrabold text-nquoc-text font-header">{(v as number).toFixed(1)}</p>
              </div>
            ))}
          </div>

          {/* Health bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-nquoc-muted">
              <span>Health Index</span>
              <span className="font-bold">{team.health_index}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${team.health_index}%`,
                  background: team.health_index >= 80
                    ? 'linear-gradient(90deg, #10b981, #34d399)'
                    : team.health_index >= 60
                    ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                    : 'linear-gradient(90deg, #e11d48, #f43f5e)',
                }}
              />
            </div>
          </div>

          {/* AI insights */}
          {insights[team.team_id] && (
            <div className="mt-5 bg-indigo-50 border border-indigo-100 rounded-2xl p-5 space-y-4 animate-slide-up">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">✨ Phân tích AI</p>
              <p className="text-sm text-nquoc-text leading-relaxed">{insights[team.team_id].insights}</p>
              <div>
                <p className="text-xs font-bold text-nquoc-muted mb-2">Pattern nổi bật:</p>
                <ul className="space-y-1.5">
                  {insights[team.team_id].patterns.map((p, i) => (
                    <li key={i} className="text-xs text-nquoc-muted flex gap-2">
                      <span className="text-indigo-400 mt-0.5">•</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold text-nquoc-muted mb-2">Khuyến nghị:</p>
                <ul className="space-y-1.5">
                  {insights[team.team_id].recommendations.map((r, i) => (
                    <li key={i} className="text-xs text-nquoc-muted flex gap-2">
                      <span className="text-emerald-500 mt-0.5">→</span>{r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Share Story Modal ──
function ShareStoryModal({ user: _user, onClose }: { user: AuthUser; onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [orgs, setOrgs] = useState<OrgStructure[]>([])
  const [form, setForm] = useState({
    team_id: '',
    experience_type: 'communication' as ExperienceType,
    courage_level: 'small' as CourageLevel,
    content: '',
    support_type: 'enough' as SupportType,
    is_public: true,
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    cultureService.getOrg().then(setOrgs)
  }, [])

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await cultureService.createStory(form)
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  const experienceOptions: { value: ExperienceType; label: string; icon: string }[] = [
    { value: 'judgement', label: 'Phán đoán', icon: '🧠' },
    { value: 'communication', label: 'Giao tiếp', icon: '💬' },
    { value: 'execution', label: 'Thực thi', icon: '⚡' },
    { value: 'priority', label: 'Ưu tiên', icon: '🎯' },
    { value: 'late_ask', label: 'Thiếu hỏi sớm', icon: '⏰' },
    { value: 'overstepping', label: 'Vượt quyền', icon: '🚧' },
  ]
  const courageOptions: { value: CourageLevel; label: string; desc: string; gradient: string }[] = [
    { value: 'small', label: 'Làm nhỏ', desc: 'Một hành động nhỏ nhưng có ý nghĩa', gradient: 'from-blue-400 to-indigo-500' },
    { value: 'big', label: 'Làm lớn', desc: 'Vượt qua sự do dự và thực hiện', gradient: 'from-violet-400 to-purple-600' },
    { value: 'breakthrough', label: '🚀 Breakthrough', desc: 'Đột phá bản thân hoàn toàn mới', gradient: 'from-emerald-400 to-teal-600' },
  ]
  const supportOptions: { value: SupportType; label: string }[] = [
    { value: 'many', label: 'Có nhiều' },
    { value: 'enough', label: 'Có vừa đủ' },
    { value: 'late', label: 'Có nhưng chậm' },
    { value: 'none', label: 'Hầu như không' },
  ]

  return (
    <Modal isOpen title="Chia sẻ câu chuyện" onClose={onClose} size="lg">
      <div className="p-6">
        {/* Steps indicator */}
        {!submitted && (
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className={`w-8 h-8 rounded-2xl flex items-center justify-center text-xs font-bold transition-all ${
                  s < step ? 'bg-emerald-500 text-white' : s === step ? 'bg-gradient-indigo text-white shadow-nquoc' : 'bg-slate-100 text-nquoc-muted'
                }`}>
                  {s < step ? '✓' : s}
                </div>
                {s < 3 && <div className={`flex-1 h-0.5 transition-all ${s < step ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
              </React.Fragment>
            ))}
          </div>
        )}

        {submitted ? (
          <div className="text-center py-8 space-y-4 animate-bounce-in">
            <div className="text-6xl animate-float inline-block">✅</div>
            <h3 className="text-xl font-bold text-nquoc-text font-header">Câu chuyện đã được chia sẻ!</h3>
            <p className="text-sm text-nquoc-muted">Cảm ơn bạn đã dũng cảm chia sẻ với cả team.</p>
            <Badge variant="emerald" size="md" className="font-bold">+10 XP Culture</Badge>
            <button onClick={onClose}
              className="mt-4 w-full py-3 bg-gradient-indigo text-white rounded-2xl text-sm font-bold transition-all shadow-nquoc">
              Tuyệt vời!
            </button>
          </div>

        ) : step === 1 ? (
          <div className="space-y-5 animate-slide-up">
            <h3 className="text-lg font-bold text-nquoc-text font-header">Bạn đã làm gì khác đi tuần này?</h3>

            <div>
              <label className="text-[10px] font-bold text-nquoc-muted uppercase tracking-wider block mb-2">Phòng ban</label>
              <select value={form.team_id} onChange={(e) => setForm((f) => ({ ...f, team_id: e.target.value }))}
                className="w-full border-2 border-nquoc-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 bg-white transition-all">
                <option value="">-- Chọn phòng ban --</option>
                {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-nquoc-muted uppercase tracking-wider block mb-2">Câu chuyện của bạn</label>
              <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Kể lại hành động dũng cảm bạn đã làm tuần này..."
                className="w-full h-28 border-2 border-nquoc-border rounded-2xl px-4 py-3 text-sm resize-none
                  focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all placeholder-slate-300"
              />
            </div>

            {/* Courage level selector */}
            <div>
              <label className="text-[10px] font-bold text-nquoc-muted uppercase tracking-wider block mb-2">Mức độ can đảm</label>
              <div className="grid grid-cols-3 gap-2">
                {courageOptions.map((o) => (
                  <button key={o.value} onClick={() => setForm((f) => ({ ...f, courage_level: o.value }))}
                    className={`p-3 rounded-2xl text-left border-2 transition-all ${
                      form.courage_level === o.value
                        ? 'border-indigo-400 bg-indigo-50 shadow-sm'
                        : 'border-nquoc-border hover:border-nquoc-muted'
                    }`}>
                    <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${o.gradient} flex items-center justify-center text-sm mb-2`}>
                      {o.value === 'small' ? '🌱' : o.value === 'big' ? '💪' : '🚀'}
                    </div>
                    <p className="text-xs font-bold text-nquoc-text">{o.label}</p>
                    <p className="text-[10px] text-nquoc-muted mt-0.5">{o.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Experience type */}
            <div>
              <label className="text-[10px] font-bold text-nquoc-muted uppercase tracking-wider block mb-2">Loại kinh nghiệm</label>
              <div className="grid grid-cols-3 gap-2">
                {experienceOptions.map((o) => (
                  <button key={o.value} onClick={() => setForm((f) => ({ ...f, experience_type: o.value }))}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                      form.experience_type === o.value
                        ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                        : 'border-nquoc-border text-nquoc-muted hover:border-nquoc-muted'
                    }`}>
                    <span>{o.icon}</span> {o.label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => setStep(2)} disabled={!form.content.trim() || !form.team_id}
              className="w-full py-3.5 bg-gradient-indigo text-white rounded-2xl text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-all shadow-nquoc">
              Tiếp theo →
            </button>
          </div>

        ) : step === 2 ? (
          <div className="space-y-5 animate-slide-up">
            <h3 className="text-lg font-bold text-nquoc-text font-header">Bạn có được hỗ trợ từ team/leader?</h3>
            <div className="space-y-2">
              {supportOptions.map((o) => (
                <label key={o.value} className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  form.support_type === o.value
                    ? 'border-indigo-400 bg-indigo-50'
                    : 'border-nquoc-border hover:bg-nquoc-hover'
                }`}>
                  <input type="radio" name="support" value={o.value} checked={form.support_type === o.value}
                    onChange={() => setForm((f) => ({ ...f, support_type: o.value as SupportType }))}
                    className="accent-indigo-600" />
                  <span className="text-sm font-bold text-nquoc-text">{o.label}</span>
                </label>
              ))}
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-xs text-indigo-700 italic">
              "Sự hỗ trợ đúng lúc giúp sai lầm nhỏ không thành vấn đề lớn."
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="flex-1 py-3 border-2 border-nquoc-border text-nquoc-muted rounded-2xl text-sm font-medium hover:bg-nquoc-hover transition-all">
                ← Quay lại
              </button>
              <button onClick={() => setStep(3)}
                className="flex-1 py-3 bg-gradient-indigo text-white rounded-2xl text-sm font-bold hover:opacity-90 transition-all shadow-nquoc">
                Tiếp theo →
              </button>
            </div>
          </div>

        ) : (
          <div className="space-y-5 animate-slide-up">
            <h3 className="text-lg font-bold text-nquoc-text font-header">Cài đặt chia sẻ</h3>
            <label className="flex items-center justify-between p-4 rounded-2xl border-2 border-nquoc-border cursor-pointer hover:bg-nquoc-hover transition-all">
              <div>
                <p className="text-sm font-bold text-nquoc-text">Công khai trên Feed</p>
                <p className="text-xs text-nquoc-muted mt-0.5">Cho phép cả team đọc và cảm xúc cùng câu chuyện</p>
              </div>
              <input type="checkbox" checked={form.is_public}
                onChange={(e) => setForm((f) => ({ ...f, is_public: e.target.checked }))}
                className="w-5 h-5 accent-indigo-600 rounded" />
            </label>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)}
                className="flex-1 py-3 border-2 border-nquoc-border text-nquoc-muted rounded-2xl text-sm font-medium hover:bg-nquoc-hover transition-all">
                ← Quay lại
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 py-3.5 bg-emerald-500 text-white rounded-2xl text-sm font-bold hover:bg-emerald-600 disabled:opacity-50 transition-all active:scale-95">
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Đang gửi...
                  </span>
                ) : '✨ Gửi câu chuyện'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
