import { useState, useEffect } from 'react'
import { useCountUp } from '../../../shared/hooks/useCountUp'
import type {
  AuthUser, CultureStory, Challenge, BehaviorScores,
  JourneyMilestoneRecord, TeamHealth,
} from '../../../shared/types'
import { cultureService } from '../services/culture.service'
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner'
import { Modal } from '../../../shared/components/Modal'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary'

interface CulturePageProps { user: AuthUser }

type TabKey = 'home' | 'challenges' | 'knowledge' | 'journey' | 'health'

const tabs: { key: TabKey; label: string; roles?: string[] }[] = [
  { key: 'home',       label: 'Bảng Tin' },
  { key: 'challenges', label: 'Thử Thách' },
  { key: 'knowledge',  label: 'Kho Bài Học' },
  { key: 'journey',    label: 'Hành Trình' },
  { key: 'health',     label: 'Sức Khỏe Đội Ngũ', roles: ['hr_manager'] },
]

export function CulturePage({ user }: CulturePageProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('home')
  const [showShareModal, setShowShareModal] = useState(false)
  const visibleTabs = tabs.filter((t) => !t.roles || t.roles.includes(user.role))

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.12em] mb-1">
            Không Gian Chung
          </p>
          <h1 className="text-xl font-black text-[#1a1a2e] font-header tracking-tight">
            Nhịp Đập Văn Hóa
          </h1>
          <p className="text-[13px] text-[#5a6a85] mt-1 max-w-lg">
            Lan tỏa tinh thần Dám Sai - Nói Thẳng. Hành động nhỏ tạo nên văn hóa lớn.
          </p>
        </div>
        <button
          onClick={() => setShowShareModal(true)}
          className="w-full md:w-auto px-5 py-2.5 bg-[#e53e3e] text-white font-bold text-[13px] rounded-[10px] hover:bg-[#c53030] transition-all shadow-red-glow active:scale-[0.97]"
        >
          + Kể câu chuyện
        </button>
      </div>

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

      <div className="animate-fade-in" key={activeTab}>
        {activeTab === 'home'       && <HomeFeed user={user} />}
        {activeTab === 'challenges' && <ChallengesTab />}
        {activeTab === 'knowledge'  && <KnowledgeBase user={user} />}
        {activeTab === 'journey'    && <JourneyTab user={user} />}
        {activeTab === 'health'     && <TeamHealthTab />}
      </div>

      {showShareModal && <ShareStoryModal user={user} onClose={() => setShowShareModal(false)} />}
    </div>
  )
}

function HomeFeed({ user: _user }: { user?: AuthUser }) {
  const [stories, setStories] = useState<CultureStory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cultureService.getFeed().then((res) => {
      setStories(res.items)
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingSpinner />
  if (stories.length === 0) return (
    <EmptyState
      icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>}
      title="Chưa có câu chuyện"
      description="Hãy là người tiên phong chia sẻ bài học!"
    />
  )

  return (
    <div className="space-y-4 pb-8">
      <ErrorBoundary feature="Bảng Tin Văn Hóa">
        <div className="grid grid-cols-1 gap-4">
          {stories.map(story => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </ErrorBoundary>
    </div>
  )
}

function StoryCard({ story }: { story: CultureStory }) {
  const [reacted, setReacted] = useState<string | null>(null)
  const isBreakthrough = story.courage_level === 'breakthrough'

  const categories: Record<string, string> = {
    judgement: 'Phán đoán', communication: 'Giao tiếp', execution: 'Thực thi',
    priority: 'Ưu tiên', late_ask: 'Thiếu hỏi sớm', overstepping: 'Vượt quyền'
  }

  return (
    <div className={`bg-white rounded-[16px] border shadow-card p-5 ${isBreakthrough ? 'border-[#fde68a]' : 'border-[#ebebeb]'}`}>
      {isBreakthrough && (
        <div className="inline-flex items-center gap-1.5 mb-3 bg-[#fffbeb] text-[#d97706] px-3 py-1 rounded-[8px] text-[10px] font-bold border border-[#fde68a]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]" />
          Dám Sai — Đột Phá
        </div>
      )}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-[#fff0f0] text-[#e53e3e] rounded-[10px] flex items-center justify-center font-bold text-sm flex-shrink-0">
          {story.user?.name?.charAt(0) || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-[#1a1a2e]">{story.user?.name || 'Ẩn danh'}</p>
          <p className="text-[11px] text-[#94a3b8]">{story.team?.name} · {new Date(story.created_at).toLocaleDateString('vi-VN')}</p>
        </div>
        <span className="text-[10px] bg-[#f5f6fa] text-[#5a6a85] px-2.5 py-1 rounded-[6px] font-bold flex-shrink-0">
          {categories[story.experience_type] || story.experience_type}
        </span>
      </div>
      <div className="bg-[#f5f6fa] rounded-[12px] px-4 py-3.5 border border-[#ebebeb] mb-4">
        <p className="text-[13px] text-[#1a1a2e] leading-relaxed">"{story.content}"</p>
      </div>
      <div className="flex gap-2 border-t border-[#f0f0f0] pt-3 flex-wrap">
        {[
          { key: 'brave', label: 'Dám làm' },
          { key: 'respect', label: 'Tôn trọng' },
          { key: 'learn', label: 'Học được' },
        ].map((r) => (
          <button
            key={r.key}
            onClick={() => setReacted(reacted === r.key ? null : r.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[11px] font-bold transition-all ${
              reacted === r.key
                ? 'bg-[#e53e3e] text-white'
                : 'bg-[#f5f6fa] text-[#5a6a85] hover:bg-[#f0f0f0]'
            }`}
          >
            {r.label} {reacted === r.key ? '2' : '1'}
          </button>
        ))}
      </div>
    </div>
  )
}

function ChallengesTab() {
  const [data, setData] = useState<{ weekly: Challenge; daily: Challenge[] } | null>(null)

  useEffect(() => {
    cultureService.getChallenges().then(setData)
  }, [])

  if (!data) return <LoadingSpinner />

  return (
    <div className="space-y-5">
      {/* Weekly challenge */}
      <div className="bg-[#1a1a2e] rounded-[16px] p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-[8px] text-[10px] font-bold mb-3 uppercase tracking-[0.1em]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" /> Thử thách tuần này
          </div>
          <h2 className="text-[16px] font-bold font-header mb-5 leading-snug">{data.weekly.text}</h2>
          <div className="flex items-center justify-between">
            <span className="font-bold bg-white/10 px-3 py-1.5 rounded-[8px] text-[12px]">+{data.weekly.points} Điểm Văn Hóa</span>
            <button className="px-5 py-2 bg-[#e53e3e] text-white font-bold text-[12px] rounded-[10px] hover:bg-[#c53030] transition-all active:scale-95 shadow-red-glow">
              Thực hiện ngay
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[13px] font-bold text-[#94a3b8] uppercase tracking-[0.1em] mb-3">Thử thách hàng ngày</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.daily.map(ch => (
            <div key={ch.id} className="bg-white rounded-[14px] border border-[#ebebeb] p-4 flex flex-col justify-between gap-3 hover:border-[#e53e3e]/30 hover:shadow-card-hover transition-all shadow-card">
              <p className="text-[13px] text-[#1a1a2e] leading-relaxed">{ch.text}</p>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-[#e53e3e] bg-[#fff0f0] px-2.5 py-1 rounded-[6px]">+{ch.points} Điểm</span>
                <button className="text-[11px] font-bold text-[#5a6a85] hover:text-[#1a1a2e]">Báo cáo</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const EXPERIENCE_LABELS: Record<string, string> = {
  judgement: 'Phán đoán', communication: 'Giao tiếp', execution: 'Thực thi',
  priority: 'Ưu tiên', late_ask: 'Thiếu hỏi sớm', overstepping: 'Vượt quyền'
}

const COURAGE_LABELS: Record<string, string> = { small: 'Nhỏ', big: 'Lớn', breakthrough: 'Đột phá' }

function KnowledgeBase({ user }: { user?: AuthUser }) {
  const [stories, setStories] = useState<CultureStory[]>([])
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterCourage, setFilterCourage] = useState('')

  useEffect(() => {
    cultureService.getLessons().then(setStories)
  }, [])

  const canSeeAll = user?.role === 'hr_manager' || user?.role === 'leader'
  const visible = stories.filter(s => canSeeAll || s.is_public)
  const filtered = visible.filter(s => {
    const matchSearch = !search || s.content.toLowerCase().includes(search.toLowerCase())
    const matchType = !filterType || s.experience_type === filterType
    const matchCourage = !filterCourage || s.courage_level === filterCourage
    return matchSearch && matchType && matchCourage
  })

  return (
    <div className="space-y-4">
      {/* Search & filter */}
      <div className="bg-white rounded-[16px] border border-[#ebebeb] p-4 shadow-card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm bài học, từ khóa..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#f5f6fa] border border-[#ebebeb] rounded-[10px] pl-9 pr-4 py-2.5 text-[13px] text-[#1a1a2e] outline-none focus:border-[#e53e3e]/40 transition-colors placeholder-[#c0ccd8]"
            />
          </div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-[#f5f6fa] border border-[#ebebeb] rounded-[10px] px-3 py-2.5 text-[13px] text-[#5a6a85] outline-none"
          >
            <option value="">Tất cả loại</option>
            {Object.entries(EXPERIENCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select
            value={filterCourage}
            onChange={e => setFilterCourage(e.target.value)}
            className="bg-[#f5f6fa] border border-[#ebebeb] rounded-[10px] px-3 py-2.5 text-[13px] text-[#5a6a85] outline-none"
          >
            <option value="">Tất cả mức</option>
            {Object.entries(COURAGE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        {!canSeeAll && (
          <p className="text-[11px] text-[#94a3b8] mt-2.5">Hiển thị bài học được công khai. HR & Leader thấy tất cả.</p>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>}
          title="Không tìm thấy bài học"
          description="Hãy thử từ khóa khác hoặc xóa bộ lọc."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(story => (
            <div key={story.id} className="bg-white rounded-[14px] border border-[#ebebeb] p-4 shadow-card hover:shadow-card-hover transition-all">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="bg-[#f0fdf4] text-[#059669] text-[10px] font-bold px-2 py-1 rounded-[6px] uppercase">
                  {EXPERIENCE_LABELS[story.experience_type] || story.experience_type}
                </span>
                <span className="bg-[#f5f6fa] text-[#5a6a85] text-[10px] font-bold px-2 py-1 rounded-[6px]">
                  {COURAGE_LABELS[story.courage_level] || story.courage_level}
                </span>
                {!story.is_public && (
                  <span className="bg-[#fff0f0] text-[#e53e3e] text-[10px] font-bold px-2 py-1 rounded-[6px]">Nội bộ</span>
                )}
              </div>
              <p className="text-[13px] text-[#1a1a2e] leading-relaxed line-clamp-3">{story.content}</p>
              {story.user?.name && (
                <p className="text-[11px] text-[#94a3b8] mt-2">{story.user.name} · {new Date(story.created_at).toLocaleDateString('vi-VN')}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const MILESTONES = [
  { key: '1m', label: '1 Tháng' },
  { key: '3m', label: '3 Tháng' },
  { key: '6m', label: '6 Tháng' },
  { key: '1y', label: '1 Năm' },
  { key: 'out', label: 'Tốt nghiệp' },
]

function JourneyTab({ user: _user }: { user?: AuthUser }) {
  const [data, setData] = useState<{ milestones: JourneyMilestoneRecord[]; current_scores: BehaviorScores } | null>(null)
  const [selectedMilestone, setSelectedMilestone] = useState<JourneyMilestoneRecord | null>(null)

  useEffect(() => {
    cultureService.getJourneyMe().then(d => setData(d as any))
  }, [])

  const xpDisplay     = useCountUp(data?.current_scores.total_xp ?? 0)
  const streakDisplay = useCountUp(data?.current_scores.streak ?? 0)

  if (!data) return <LoadingSpinner />

  const completedKeys = new Set(data.milestones.map(m => m.milestone))

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-[#e53e3e] rounded-[16px] p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full -translate-y-6 translate-x-6" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-4">
          <div>
            <p className="text-white/70 text-[10px] uppercase tracking-[0.12em] font-bold mb-1">Tổng Điểm Văn Hóa</p>
            <h2 className="text-5xl font-black font-header">{xpDisplay} <span className="text-lg text-white/60">XP</span></h2>
          </div>
          <div className="md:text-right">
            <p className="text-white/70 text-[10px] uppercase tracking-[0.12em] font-bold mb-1">Chuỗi duy trì</p>
            <h2 className="text-4xl font-black font-header">{streakDisplay} <span className="text-base text-white/60">ngày</span></h2>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-[16px] border border-[#ebebeb] p-5 shadow-card">
        <h3 className="text-[13px] font-bold text-[#1a1a2e] mb-4">Chặng Đường Phát Triển</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {MILESTONES.map((m, i) => {
            const done = completedKeys.has(m.key as JourneyMilestoneRecord['milestone'])
            const record = data.milestones.find(r => r.milestone === m.key)
            return (
              <button
                key={m.key}
                onClick={() => done && record && setSelectedMilestone(record)}
                disabled={!done}
                className={`min-w-[110px] rounded-[14px] p-4 flex flex-col items-center text-center border transition-all ${
                  done
                    ? 'bg-[#fff0f0] border-[#fecaca] text-[#e53e3e] hover:shadow-card-hover cursor-pointer'
                    : i === completedKeys.size
                    ? 'bg-[#f5f6fa] border-[#ebebeb] text-[#94a3b8] border-dashed'
                    : 'bg-[#f5f6fa] border-[#ebebeb] text-[#c0ccd8]'
                }`}
              >
                <div className={`w-8 h-8 rounded-[8px] mb-2 flex items-center justify-center ${done ? 'bg-[#e53e3e] text-white' : 'bg-[#f0f0f0] text-[#c0ccd8]'}`}>
                  {done ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  )}
                </div>
                <p className="text-[12px] font-bold">{m.label}</p>
                {done && record && (
                  <p className="text-[10px] mt-1 opacity-70">{new Date(record.completed_at).toLocaleDateString('vi-VN')}</p>
                )}
              </button>
            )
          })}
        </div>
        <p className="text-[11px] text-[#94a3b8] mt-3">Bấm vào cột mốc đã hoàn thành để xem chi tiết.</p>
      </div>

      {/* Milestone recap modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#1a1a2e]/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-[18px] shadow-modal border border-[#ebebeb]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0]">
              <h3 className="text-[14px] font-black text-[#1a1a2e] font-header">
                Cột mốc {MILESTONES.find(m => m.key === selectedMilestone.milestone)?.label}
              </h3>
              <button onClick={() => setSelectedMilestone(null)} className="w-7 h-7 rounded-[7px] bg-[#f5f6fa] flex items-center justify-center text-[#5a6a85] text-[12px] font-bold hover:bg-[#f0f0f0]">✕</button>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-[11px] text-[#94a3b8]">Hoàn thành: {new Date(selectedMilestone.completed_at).toLocaleDateString('vi-VN')}</p>
              {selectedMilestone.recap_note && (
                <div className="bg-[#f5f6fa] rounded-[12px] p-4 border border-[#ebebeb]">
                  <p className="text-[13px] text-[#1a1a2e] leading-relaxed italic">"{selectedMilestone.recap_note}"</p>
                </div>
              )}
              <div className="bg-[#fff0f0] rounded-[12px] p-4 border border-[#fecaca]">
                <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.1em] mb-2">Video tổng kết</p>
                <p className="text-[12px] text-[#e53e3e] font-medium">Tính năng video sẽ sẵn sàng sớm.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TeamHealthTab() {
  const [teams, setTeams] = useState<TeamHealth[]>([])

  useEffect(() => {
    cultureService.getTeamHealth().then(setTeams)
  }, [])

  return (
    <div className="space-y-4">
      {teams.map(team => (
        <div key={team.team_id} className="bg-white rounded-[16px] border border-[#ebebeb] p-5 shadow-card hover:shadow-card-hover transition-all">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-[14px] font-bold text-[#1a1a2e] font-header">{(team as any).team_name}</h3>
              <p className="text-[11px] text-[#94a3b8]">Quy mô: {(team as any).member_count} nhân sự</p>
            </div>
            <div className={`px-3 py-1.5 rounded-[8px] font-bold text-[11px] ${team.health_index >= 70 ? 'bg-[#f0fdf4] text-[#059669]' : team.health_index >= 50 ? 'bg-[#fffbeb] text-[#d97706]' : 'bg-[#fff0f0] text-[#e53e3e]'}`}>
              Sức khỏe: {team.health_index}/100
            </div>
          </div>
          {team.avg_scores_json?.insights && (
            <p className="text-[13px] text-[#5a6a85] italic bg-[#f5f6fa] p-3.5 rounded-[10px] border border-[#ebebeb] mb-3 leading-relaxed">
              "{team.avg_scores_json.insights}"
            </p>
          )}
          <button className="px-4 py-2 border border-[#ebebeb] text-[#5a6a85] font-bold rounded-[10px] text-[12px] hover:bg-[#f5f6fa] transition-all">
            Phân tích AI
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── 3-Step Share Story Modal ────────────────────────────────────
type ExperienceType = 'judgement' | 'communication' | 'execution' | 'priority' | 'late_ask' | 'overstepping'
type CourageLevel = 'small' | 'big' | 'breakthrough'
type SupportType = 'many' | 'enough' | 'late' | 'none'

function ShareStoryModal({ user: _user, onClose }: { user?: AuthUser; onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [tried, setTried] = useState('')
  const [lesson, setLesson] = useState('')
  const [expType, setExpType] = useState<ExperienceType | ''>('')
  const [courage, setCourage] = useState<CourageLevel | ''>('')
  const [support, setSupport] = useState<SupportType | ''>('')
  const [isPublic, setIsPublic] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const canStep2 = tried.trim().length >= 20 && expType && courage
  const canStep3 = support !== ''

  const handleSubmit = async () => {
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 800))
    setSubmitting(false)
    onClose()
  }

  return (
    <Modal isOpen title={`Kể câu chuyện — Bước ${step}/3`} onClose={onClose} size="md">
      <div className="p-5">

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-[#1a1a2e] rounded-[12px] p-4">
              <p className="text-[13px] text-white/80 italic leading-relaxed">
                "Bạn đã làm gì khác đi tuần này?"
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#5a6a85] uppercase tracking-[0.1em] block mb-1.5">Mô tả điều bạn đã thử</label>
              <textarea
                value={tried}
                onChange={e => setTried(e.target.value)}
                rows={4}
                className="w-full bg-[#f5f6fa] border border-[#ebebeb] rounded-[12px] p-3.5 text-[13px] text-[#1a1a2e] resize-none outline-none focus:border-[#e53e3e]/40 placeholder-[#c0ccd8]"
                placeholder="Tôi đã chủ động nêu ra vấn đề trong cuộc họp thay vì chờ đến sau..."
              />
              <p className={`text-[10px] mt-1 ${tried.length < 20 ? 'text-[#94a3b8]' : 'text-[#059669]'}`}>{tried.length}/20 ký tự tối thiểu</p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#5a6a85] uppercase tracking-[0.1em] block mb-1.5">Loại kinh nghiệm</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  ['judgement', 'Phán đoán'],
                  ['communication', 'Giao tiếp'],
                  ['execution', 'Thực thi'],
                  ['priority', 'Ưu tiên'],
                  ['late_ask', 'Thiếu hỏi sớm'],
                  ['overstepping', 'Vượt quyền'],
                ] as const).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => setExpType(k)}
                    className={`py-2 px-3 rounded-[8px] text-[12px] font-bold text-left transition-all border ${expType === k ? 'bg-[#e53e3e] text-white border-[#e53e3e]' : 'bg-[#f5f6fa] text-[#5a6a85] border-[#ebebeb] hover:border-[#e53e3e]/30'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#5a6a85] uppercase tracking-[0.1em] block mb-1.5">Mức độ can đảm</label>
              <div className="flex gap-2">
                {([['small', 'Làm nhỏ'], ['big', 'Làm lớn'], ['breakthrough', 'Đột phá']] as const).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => setCourage(k)}
                    className={`flex-1 py-2 rounded-[8px] text-[12px] font-bold transition-all border ${courage === k ? 'bg-[#e53e3e] text-white border-[#e53e3e]' : 'bg-[#f5f6fa] text-[#5a6a85] border-[#ebebeb] hover:border-[#e53e3e]/30'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#5a6a85] uppercase tracking-[0.1em] block mb-1.5">Bài học / Kết quả (tùy chọn)</label>
              <textarea
                value={lesson}
                onChange={e => setLesson(e.target.value)}
                rows={2}
                className="w-full bg-[#f5f6fa] border border-[#ebebeb] rounded-[12px] p-3.5 text-[13px] text-[#1a1a2e] resize-none outline-none focus:border-[#e53e3e]/40 placeholder-[#c0ccd8]"
                placeholder="Tôi nhận ra rằng nói sớm giúp team tiết kiệm 2 ngày xử lý..."
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!canStep2}
              className="w-full py-3 bg-[#e53e3e] text-white font-bold text-[13px] rounded-[12px] hover:bg-[#c53030] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Tiếp theo
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-[#f5f6fa] rounded-[12px] p-4 border border-[#ebebeb]">
              <p className="text-[13px] text-[#1a1a2e] font-medium italic">
                "Sự hỗ trợ đúng lúc giúp sai lầm nhỏ không thành vấn đề lớn."
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#5a6a85] uppercase tracking-[0.1em] block mb-2">Bạn có được hỗ trợ từ team/leader?</label>
              <div className="space-y-2">
                {([
                  ['many', 'Có nhiều — team/leader phản hồi ngay'],
                  ['enough', 'Có vừa đủ — cần nhưng đủ để làm'],
                  ['late', 'Có nhưng chậm — đến khi cần thì chưa có'],
                  ['none', 'Hầu như không — tự xử lý một mình'],
                ] as const).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => setSupport(k)}
                    className={`w-full py-2.5 px-4 rounded-[10px] text-[13px] font-medium text-left transition-all border ${support === k ? 'bg-[#fff0f0] border-[#e53e3e] text-[#e53e3e] font-bold' : 'bg-[#f5f6fa] border-[#ebebeb] text-[#5a6a85] hover:border-[#e53e3e]/30'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3 border border-[#ebebeb] text-[#5a6a85] font-bold text-[13px] rounded-[12px] hover:bg-[#f5f6fa] transition-all">Quay lại</button>
              <button onClick={() => setStep(3)} disabled={!canStep3} className="flex-[2] py-3 bg-[#e53e3e] text-white font-bold text-[13px] rounded-[12px] hover:bg-[#c53030] disabled:opacity-40 transition-all">Tiếp theo</button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-[#f5f6fa] rounded-[12px] p-4 border border-[#ebebeb] space-y-2">
              <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.1em]">Xem trước</p>
              <p className="text-[13px] text-[#1a1a2e] leading-relaxed">"{tried.slice(0, 80)}{tried.length > 80 ? '...' : ''}"</p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between bg-[#f5f6fa] rounded-[12px] p-4 border border-[#ebebeb] cursor-pointer">
                <div>
                  <p className="text-[13px] font-bold text-[#1a1a2e]">Chia sẻ ẩn danh</p>
                  <p className="text-[11px] text-[#94a3b8]">Tên bạn sẽ không hiển thị</p>
                </div>
                <div
                  onClick={() => {}}
                  className={`w-11 h-6 rounded-full transition-all relative cursor-pointer bg-[#ebebeb]`}
                />
              </label>

              <label className="flex items-center justify-between bg-[#f5f6fa] rounded-[12px] p-4 border border-[#ebebeb] cursor-pointer">
                <div>
                  <p className="text-[13px] font-bold text-[#1a1a2e]">Công khai trên Feed</p>
                  <p className="text-[11px] text-[#94a3b8]">{isPublic ? 'Mọi người trong NhiLe sẽ thấy' : 'Chỉ team và HR thấy'}</p>
                </div>
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className={`w-11 h-6 rounded-full transition-all relative ${isPublic ? 'bg-[#e53e3e]' : 'bg-[#c0ccd8]'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${isPublic ? 'left-5' : 'left-0.5'}`} />
                </button>
              </label>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-3 border border-[#ebebeb] text-[#5a6a85] font-bold text-[13px] rounded-[12px] hover:bg-[#f5f6fa] transition-all">Quay lại</button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-[2] py-3 bg-[#e53e3e] text-white font-bold text-[13px] rounded-[12px] hover:bg-[#c53030] disabled:opacity-60 transition-all shadow-red-glow"
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
