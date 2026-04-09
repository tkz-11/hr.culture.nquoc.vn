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

const tabs: { key: TabKey; label: string; roles?: string[] }[] = [
  { key: 'home', label: 'Trang chủ' },
  { key: 'challenges', label: 'Thử thách' },
  { key: 'share', label: 'Chia sẻ' },
  { key: 'knowledge', label: 'Kho bài học' },
  { key: 'journey', label: 'Hành trình' },
  { key: 'health', label: 'Sức khỏe Team', roles: ['hr_manager'] },
]

export function CulturePage({ user }: CulturePageProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('home')
  const [showShareModal, setShowShareModal] = useState(false)

  const visibleTabs = tabs.filter((t) => !t.roles || t.roles.includes(user.role))

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nquoc-text font-header">NhiLe Culture OS</h1>
          <p className="text-sm text-nquoc-muted mt-1">Xây dựng văn hóa tổ chức từ những hành động nhỏ</p>
        </div>
        {activeTab === 'home' && (
          <button
            onClick={() => setShowShareModal(true)}
            className="px-4 py-2 bg-nquoc-blue text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            + Chia sẻ
          </button>
        )}
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 flex-wrap">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-nquoc-blue text-white shadow-lg shadow-blue-100 scale-105'
                : 'bg-white text-nquoc-muted border border-nquoc-border hover:text-nquoc-text hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'home' && <HomeFeed user={user} />}
      {activeTab === 'challenges' && <ChallengesTab />}
      {activeTab === 'share' && <div className="bg-white rounded-2xl border border-nquoc-border p-6 text-center text-nquoc-muted text-sm">Bấm "Chia sẻ" ở góc trên để đăng câu chuyện.</div>}
      {activeTab === 'knowledge' && <KnowledgeBase />}
      {activeTab === 'journey' && <JourneyTab user={user} />}
      {activeTab === 'health' && <TeamHealthTab />}

      {showShareModal && (
        <ShareStoryModal
          user={user}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  )
}

// ── Home Feed ──
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

  if (loading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  if (stories.length === 0) {
    return <EmptyState icon="📖" title="Chưa có câu chuyện" description="Hãy là người đầu tiên chia sẻ câu chuyện của bạn!" />
  }

  return (
    <div className="space-y-4 pb-12">
      <ErrorBoundary feature="Bảng tin Văn hóa">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
        {meta?.has_next && (
          <div className="pt-4 flex justify-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-8 py-3 bg-white border border-nquoc-border rounded-2xl text-sm font-bold text-nquoc-blue hover:bg-nquoc-bg transition-all active:scale-95 shadow-sm shadow-blue-50"
            >
              {loadingMore ? 'Đang tải...' : 'Xem thêm câu chuyện'}
            </button>
          </div>
        )}
      </ErrorBoundary>
    </div>
  )
}

// ── Story Card ──
function StoryCard({ story }: { story: CultureStory }) {
  const expLabels: Record<string, string> = {
    judgement: 'Phán đoán', communication: 'Giao tiếp',
    execution: 'Thực thi', priority: 'Ưu tiên',
    late_ask: 'Thiếu hỏi sớm', overstepping: 'Vượt quyền',
  }
  const courageLabels: Record<string, string> = {
    small: 'Làm nhỏ', big: 'Làm lớn', breakthrough: 'Breakthrough',
  }
  const courageVariant: Record<string, 'blue' | 'indigo' | 'emerald'> = {
    small: 'blue', big: 'indigo', breakthrough: 'emerald',
  }

  return (
      <div className="bg-white rounded-[32px] border border-nquoc-border p-6 space-y-4 shadow-sm hover:shadow-md transition-all">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-nquoc-lead flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-100">
            {story.user?.name?.charAt(0) ?? '?'}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-nquoc-text">{story.user?.name ?? 'Ẩn danh'}</p>
            <p className="text-[10px] text-nquoc-muted font-medium">{story.team?.name} · {new Date(story.created_at).toLocaleDateString('vi-VN')}</p>
          </div>
          <Badge variant={courageVariant[story.courage_level] ?? 'blue'} size="sm" className="font-bold">
            {courageLabels[story.courage_level]}
          </Badge>
        </div>

      {/* Tags */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
          #{expLabels[story.experience_type]}
        </span>
        <span className="text-xs bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full">#DámLàm</span>
      </div>

      {/* Content */}
      <p className="text-sm text-nquoc-text leading-relaxed">{story.content}</p>

      {/* Reactions */}
      <div className="flex items-center gap-4 pt-1 border-t border-nquoc-border">
        <button className="flex items-center gap-1 text-xs text-nquoc-muted hover:text-amber-500 transition-colors">
          🔥 <span>12</span>
        </button>
        <button className="flex items-center gap-1 text-xs text-nquoc-muted hover:text-amber-400 transition-colors">
          💡 <span>8</span>
        </button>
        <button className="flex items-center gap-1 text-xs text-nquoc-muted hover:text-rose-400 transition-colors">
          🤗 <span>5</span>
        </button>
        <div className="ml-auto">
          <Badge variant="emerald" size="sm">+10 XP</Badge>
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
    <div className="space-y-5">
      {/* Weekly */}
      <div>
        <h2 className="text-sm font-semibold text-nquoc-text font-header mb-3">Thử thách tuần này</h2>
        <div className="bg-white rounded-[32px] border border-nquoc-border p-6 space-y-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm text-nquoc-text leading-relaxed flex-1 font-medium">{data.weekly.text}</p>
            <Badge variant="indigo" size="md" className="font-bold whitespace-nowrap">{data.weekly.points} XP</Badge>
          </div>
          <div className="flex items-center justify-between pt-2">
            <p className="text-[10px] text-nquoc-muted font-bold uppercase tracking-wider">Hết hạn: {new Date(data.weekly.active_until).toLocaleDateString('vi-VN')}</p>
            <button
              onClick={() => setSubmitChallenge(data.weekly)}
              className="px-6 py-2.5 bg-nquoc-blue text-white rounded-2xl text-xs font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100"
            >
              Nộp bằng chứng
            </button>
          </div>
        </div>
      </div>

      {/* Daily */}
      <div>
        <h2 className="text-sm font-semibold text-nquoc-text font-header mb-3">Thử thách hôm nay</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.daily.map((ch) => (
            <div key={ch.id} className="bg-white rounded-xl border border-nquoc-border p-4 space-y-3">
              <p className="text-sm text-nquoc-text leading-relaxed">{ch.text}</p>
              <div className="flex items-center justify-between">
                <Badge variant="blue" size="sm">{ch.points} điểm</Badge>
                <button
                  onClick={() => setSubmitChallenge(ch)}
                  className="text-xs font-medium text-nquoc-blue hover:underline"
                >
                  Nộp
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {submitChallenge && (
        <SubmitEvidenceModal
          challenge={submitChallenge}
          onClose={() => setSubmitChallenge(null)}
        />
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
        <div className="bg-nquoc-bg rounded-xl p-3">
          <p className="text-xs text-nquoc-muted mb-1">Thử thách</p>
          <p className="text-sm text-nquoc-text">{challenge.text}</p>
          <Badge variant="indigo" size="sm" className="mt-2">{challenge.points} điểm tối đa</Badge>
        </div>

        {!result ? (
          <>
            <div>
              <label className="text-xs font-semibold text-nquoc-muted block mb-1.5">
                Mô tả bằng chứng của bạn <span className="text-nquoc-muted font-normal">(tối thiểu 50 ký tự)</span>
              </label>
              <textarea
                value={proof}
                onChange={(e) => setProof(e.target.value)}
                placeholder="Mô tả hành động cụ thể bạn đã thực hiện, có thể đo lường được..."
                className="w-full h-32 border border-nquoc-border rounded-xl px-3 py-2.5 text-sm text-nquoc-text resize-none focus:outline-none focus:border-nquoc-blue transition-colors"
              />
              <p className="text-xs text-nquoc-muted mt-1">{proof.length}/50 ký tự tối thiểu</p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={proof.length < 50 || loading}
              className="w-full py-2.5 bg-nquoc-blue text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Đang chấm điểm...' : 'Nộp bằng chứng'}
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div className={`rounded-xl p-4 text-center ${result.approved ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="text-3xl mb-2">{result.approved ? '✅' : '❌'}</div>
              <p className={`font-bold font-header ${result.approved ? 'text-emerald-700' : 'text-red-700'}`}>
                {result.approved ? `Xuất sắc! +${result.awarded_points} điểm` : 'Chưa đạt'}
              </p>
              <p className="text-sm mt-2 text-nquoc-muted">{result.ai_feedback}</p>
              {result.ai_reason && (
                <p className="text-xs mt-1 italic text-nquoc-muted">Lý do: {result.ai_reason}</p>
              )}
            </div>
            {!result.approved && (
              <button
                onClick={() => setResult(null)}
                className="w-full py-2 border border-nquoc-border text-nquoc-muted rounded-xl text-sm font-medium hover:bg-nquoc-bg"
              >
                Nộp lại
              </button>
            )}
            <button onClick={onClose} className="w-full py-2 bg-nquoc-bg border border-nquoc-border text-nquoc-text rounded-xl text-sm font-medium">
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
    <div className="space-y-4">
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Tìm kiếm bài học, loại công việc, từ khóa..."
        className="w-full border border-nquoc-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-nquoc-blue bg-white"
      />
      {filtered.length === 0 ? (
        <EmptyState icon="🔍" title="Không tìm thấy" description="Thử từ khóa khác." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((story) => (
            <div key={story.id} className="bg-white rounded-xl border border-nquoc-border p-4 space-y-2">
              <Badge variant="blue" size="sm">{story.experience_type}</Badge>
              <p className="text-sm text-nquoc-text leading-relaxed line-clamp-3">{story.content}</p>
              <p className="text-xs text-nquoc-muted italic">
                💡 {story.team?.name} · {new Date(story.created_at).toLocaleDateString('vi-VN')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Journey Tab ──
function JourneyTab({ user: _user }: { user: AuthUser }) {
  const [data, setData] = useState<{
    milestones: JourneyMilestoneRecord[]
    current_scores: BehaviorScores
    radar_data: { try: number; share: number; learn: number; help: number }
  } | null>(null)
  const [trend, setTrend] = useState<{ week_of: string; try_score: number; help_score: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      cultureService.getJourneyMe(),
      cultureService.getJourneyTrend()
    ]).then(([d, t]) => {
      setData(d)
      setTrend(t as any) // Simplified mapping
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full rounded-[32px]" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Skeleton className="h-24 rounded-[32px]" />
        <Skeleton className="h-24 rounded-[32px]" />
        <Skeleton className="h-24 rounded-[32px]" />
        <Skeleton className="h-24 rounded-[32px]" />
      </div>
    </div>
  )
  if (!data) return null

  const milestoneOrder: JourneyMilestoneRecord['milestone'][] = ['1m', '3m', '6m', '1y', 'out']
  const milestoneLabels: Record<string, string> = {
    '1m': '1 Tháng', '3m': '3 Tháng', '6m': '6 Tháng', '1y': '1 Năm', out: 'Out Team',
  }

  return (
    <ErrorBoundary feature="Hành trình Văn hóa">
      <div className="space-y-6">
        {/* Milestone timeline */}
        <div className="bg-white rounded-[32px] border border-nquoc-border p-8 shadow-sm">
          <h2 className="text-sm font-bold text-nquoc-text font-header mb-8 uppercase tracking-wider">Cột mốc hành trình</h2>
          <div className="flex items-center">
            {milestoneOrder.map((m, i) => {
              const record = data.milestones.find((r) => r.milestone === m)
              const completed = !!record
              return (
                <React.Fragment key={m}>
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all ${
                      completed ? 'bg-nquoc-blue text-white shadow-blue-100 scale-110' : 'bg-gray-50 text-nquoc-muted border border-nquoc-border'
                    }`}>
                      {completed ? '✓' : i + 1}
                    </div>
                    <p className="text-[10px] font-bold text-nquoc-muted mt-3 text-center uppercase tracking-tight">{milestoneLabels[m]}</p>
                    {record && (
                      <p className="text-[10px] text-nquoc-blue font-bold mt-1">
                        {new Date(record.completed_at).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                  </div>
                  {i < milestoneOrder.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${completed ? 'bg-nquoc-blue' : 'bg-gray-100'}`} />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* Behavior scores and Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-[32px] border border-nquoc-border p-8 shadow-sm">
            <h3 className="text-sm font-bold text-nquoc-text font-header mb-6 uppercase tracking-wider text-center">Định danh văn hóa</h3>
            <div className="h-[250px]">
              <RadarChart 
                labels={['Dám làm', 'Chia sẻ', 'Học hỏi', 'Hỗ trợ']}
                data={[data.radar_data.try, data.radar_data.share, data.radar_data.learn, data.radar_data.help]}
                max={10}
                color="#3b82f6"
              />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { key: 'try_score', label: 'Dám làm', color: 'text-blue-600', bg: 'bg-blue-50' },
                { key: 'share_score', label: 'Chia sẻ', color: 'text-purple-600', bg: 'bg-purple-50' },
                { key: 'learn_score', label: 'Học hỏi', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { key: 'help_score', label: 'Hỗ trợ', color: 'text-amber-600', bg: 'bg-amber-50' },
              ].map((dim) => (
                <div key={dim.key} className={`${dim.bg} rounded-[28px] p-6 border border-white transition-all hover:scale-105`}>
                  <p className="text-[10px] font-bold text-nquoc-muted mb-2 uppercase tracking-widest">{dim.label}</p>
                  <p className={`text-3xl font-extrabold font-header ${dim.color}`}>
                    {(data.current_scores[dim.key as keyof BehaviorScores] as number).toFixed(1)}
                  </p>
                </div>
              ))}
            </div>

            {/* Trend Chart */}
            <div className="bg-white rounded-[32px] border border-nquoc-border p-8 shadow-sm h-[200px]">
               <LineChart 
                 labels={trend.map(t => t.week_of)}
                 datasets={[
                   { label: 'Dám làm', data: trend.map(t => t.try_score), color: '#3b82f6' },
                   { label: 'Hỗ trợ', data: trend.map(t => t.help_score), color: '#f59e0b' }
                 ]}
               />
            </div>
          </div>
        </div>

        {/* XP & streak summarized */}
        <div className="bg-gradient-to-r from-nquoc-blue to-indigo-600 rounded-[32px] p-8 flex items-center justify-between text-white shadow-xl shadow-blue-100 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-1/4">
             <span className="text-9xl font-bold">XP</span>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Uy tín cá nhân</p>
            <div className="flex items-baseline gap-2">
              <p className="text-5xl font-extrabold font-header tracking-tighter">{data.current_scores.total_xp}</p>
              <p className="text-xl font-bold opacity-80 uppercase font-header">Culture XP</p>
            </div>
          </div>
          <div className="text-right flex flex-col items-end relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Chuỗi ngày bền bỉ</p>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
              <p className="text-2xl font-extrabold font-header">{data.current_scores.streak} 🔥</p>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
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
      const result = await cultureService.analyzeTeamHealth({
        team_id: teamId,
        period: '2026-04',
      })
      setInsights((prev) => ({ ...prev, [teamId]: result }))
    } finally {
      setAnalyzing(null)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      {teams.map((team) => (
        <div key={team.team_id} className="bg-white rounded-2xl border border-nquoc-border p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-nquoc-text font-header">{team.team_name}</h3>
              <p className="text-xs text-nquoc-muted">{team.member_count} thành viên</p>
            </div>
            <button
              onClick={() => handleAnalyze(team.team_id)}
              disabled={analyzing === team.team_id}
              className="text-xs font-medium text-nquoc-blue border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 disabled:opacity-50 transition-colors"
            >
              {analyzing === team.team_id ? 'Đang phân tích...' : 'AI Phân tích'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-nquoc-bg rounded-xl p-3">
              <p className="text-[10px] text-nquoc-muted mb-0.5">Health Index</p>
              <p className="text-xl font-bold text-nquoc-blue font-header">{team.health_index}%</p>
            </div>
            <div className="bg-nquoc-bg rounded-xl p-3">
              <p className="text-[10px] text-nquoc-muted mb-0.5">Support Rate</p>
              <p className="text-xl font-bold text-emerald-600 font-header">{team.support_rate}%</p>
            </div>
            {Object.entries(team.avg_scores_json).filter(([k]) => k !== 'insights').map(([k, v]) => (
              <div key={k} className="bg-nquoc-bg rounded-xl p-3">
                <p className="text-[10px] text-nquoc-muted mb-0.5">{k}</p>
                <p className="text-xl font-bold text-nquoc-text font-header">{(v as number).toFixed(1)}</p>
              </div>
            ))}
          </div>

          {/* Health bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-nquoc-muted">
              <span>Health Index</span>
              <span>{team.health_index}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${team.health_index}%`,
                  backgroundColor: team.health_index >= 80 ? '#10b981' : team.health_index >= 60 ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>
          </div>

          {/* AI insights */}
          {insights[team.team_id] && (
            <div className="mt-4 bg-nquoc-active border border-blue-100 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-nquoc-blue">Phân tích AI</p>
              <p className="text-sm text-nquoc-text">{insights[team.team_id].insights}</p>
              <div>
                <p className="text-xs font-semibold text-nquoc-muted mb-1">Pattern nổi bật:</p>
                <ul className="space-y-1">
                  {insights[team.team_id].patterns.map((p, i) => (
                    <li key={i} className="text-xs text-nquoc-muted flex gap-1.5">
                      <span className="text-blue-400 mt-0.5">•</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-nquoc-muted mb-1">Khuyến nghị:</p>
                <ul className="space-y-1">
                  {insights[team.team_id].recommendations.map((r, i) => (
                    <li key={i} className="text-xs text-nquoc-muted flex gap-1.5">
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

  const experienceOptions: { value: ExperienceType; label: string }[] = [
    { value: 'judgement', label: 'Phán đoán' },
    { value: 'communication', label: 'Giao tiếp' },
    { value: 'execution', label: 'Thực thi' },
    { value: 'priority', label: 'Ưu tiên' },
    { value: 'late_ask', label: 'Thiếu hỏi sớm' },
    { value: 'overstepping', label: 'Vượt quyền' },
  ]
  const courageOptions: { value: CourageLevel; label: string }[] = [
    { value: 'small', label: 'Làm nhỏ' },
    { value: 'big', label: 'Làm lớn' },
    { value: 'breakthrough', label: 'Breakthrough' },
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
        {/* Steps */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${s <= step ? 'bg-nquoc-blue text-white' : 'bg-gray-100 text-nquoc-muted'}`}>{s}</div>
              {s < 3 && <div className={`flex-1 h-0.5 ${s < step ? 'bg-nquoc-blue' : 'bg-gray-100'}`} />}
            </React.Fragment>
          ))}
        </div>

        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <div className="text-5xl">✅</div>
            <h3 className="font-semibold text-nquoc-text font-header">Câu chuyện đã được chia sẻ!</h3>
            <Badge variant="emerald" size="md">+10 XP Culture</Badge>
            <button onClick={onClose} className="mt-4 w-full py-2.5 bg-nquoc-blue text-white rounded-xl text-sm font-semibold">Đóng</button>
          </div>
        ) : step === 1 ? (
          <div className="space-y-4">
            <h3 className="font-semibold text-nquoc-text font-header">Bạn đã làm gì khác đi tuần này?</h3>
            <div>
              <label className="text-xs font-semibold text-nquoc-muted block mb-1">Phòng ban</label>
              <select
                value={form.team_id}
                onChange={(e) => setForm((f) => ({ ...f, team_id: e.target.value }))}
                className="w-full border border-nquoc-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-nquoc-blue"
              >
                <option value="">-- Chọn phòng ban --</option>
                {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-nquoc-muted block mb-1">Câu chuyện của bạn</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Kể lại hành động dũng cảm bạn đã làm tuần này..."
                className="w-full h-28 border border-nquoc-border rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-nquoc-blue"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-nquoc-muted block mb-1">Loại kinh nghiệm</label>
                {experienceOptions.map((o) => (
                  <label key={o.value} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input type="radio" name="exp" value={o.value} checked={form.experience_type === o.value}
                      onChange={() => setForm((f) => ({ ...f, experience_type: o.value }))}
                      className="accent-nquoc-blue" />
                    <span className="text-xs text-nquoc-text">{o.label}</span>
                  </label>
                ))}
              </div>
              <div>
                <label className="text-xs font-semibold text-nquoc-muted block mb-1">Mức độ can đảm</label>
                {courageOptions.map((o) => (
                  <label key={o.value} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input type="radio" name="courage" value={o.value} checked={form.courage_level === o.value}
                      onChange={() => setForm((f) => ({ ...f, courage_level: o.value }))}
                      className="accent-nquoc-blue" />
                    <span className="text-xs text-nquoc-text">{o.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!form.content.trim() || !form.team_id}
              className="w-full py-2.5 bg-nquoc-blue text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              Tiếp theo
            </button>
          </div>
        ) : step === 2 ? (
          <div className="space-y-4">
            <h3 className="font-semibold text-nquoc-text font-header">Bạn có được hỗ trợ từ team/leader?</h3>
            <div className="space-y-2">
              {supportOptions.map((o) => (
                <label key={o.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  form.support_type === o.value ? 'border-nquoc-blue bg-nquoc-active' : 'border-nquoc-border hover:bg-nquoc-bg'
                }`}>
                  <input type="radio" name="support" value={o.value} checked={form.support_type === o.value}
                    onChange={() => setForm((f) => ({ ...f, support_type: o.value as SupportType }))}
                    className="accent-nquoc-blue" />
                  <span className="text-sm text-nquoc-text">{o.label}</span>
                </label>
              ))}
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 italic">
              "Sự hỗ trợ đúng lúc giúp sai lầm nhỏ không thành vấn đề lớn."
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-2.5 border border-nquoc-border text-nquoc-muted rounded-xl text-sm">Quay lại</button>
              <button onClick={() => setStep(3)} className="flex-1 py-2.5 bg-nquoc-blue text-white rounded-xl text-sm font-semibold">Tiếp theo</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-semibold text-nquoc-text font-header">Cài đặt chia sẻ</h3>
            <label className="flex items-center justify-between p-3 rounded-xl border border-nquoc-border cursor-pointer">
              <span className="text-sm text-nquoc-text">Công khai trên Feed</span>
              <input type="checkbox" checked={form.is_public}
                onChange={(e) => setForm((f) => ({ ...f, is_public: e.target.checked }))}
                className="w-4 h-4 accent-nquoc-blue" />
            </label>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-2.5 border border-nquoc-border text-nquoc-muted rounded-xl text-sm">Quay lại</button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
              >
                {submitting ? 'Đang gửi...' : 'Gửi câu chuyện ngay'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
