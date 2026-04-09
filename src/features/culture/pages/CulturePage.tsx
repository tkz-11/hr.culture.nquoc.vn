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

const tabs: { key: TabKey; label: string; icon: string; roles?: string[] }[] = [
  { key: 'home', label: 'Bảng Tin', icon: '🏡' },
  { key: 'challenges', label: 'Thử Thách', icon: '⚡' },
  { key: 'knowledge', label: 'Kho Bài Học', icon: '💡' },
  { key: 'journey', label: 'Hành Trình', icon: '🗺️' },
  { key: 'health', label: 'Sức Khỏe Đội Ngũ', icon: '💚', roles: ['hr_manager'] },
]

export function CulturePage({ user }: CulturePageProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('home')
  const [showShareModal, setShowShareModal] = useState(false)
  const visibleTabs = tabs.filter((t) => !t.roles || t.roles.includes(user.role))

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 bg-[#f1f5f9]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Không Gian Chung
          </p>
          <h1 className="text-3xl font-extrabold text-slate-900 font-header tracking-tight">
            Nhịp Đập Văn Hóa
          </h1>
          <p className="text-sm font-medium text-slate-500 max-w-lg">
            Lan tỏa tinh thần "Dám Sai - Nói Thẳng". Hành động nhỏ tạo nên văn hóa lớn.
          </p>
        </div>
        <button
          onClick={() => setShowShareModal(true)}
          className="w-full md:w-auto px-6 py-3 bg-[#0f172a] text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition-all shadow-md active:scale-[0.97]"
        >
          + Báo Cáo "Dám Sai"
        </button>
      </div>

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

      <div className="animate-fade-in mt-6" key={activeTab}>
        {activeTab === 'home' && <HomeFeed user={user} />}
        {activeTab === 'challenges' && <ChallengesTab />}
        {activeTab === 'knowledge' && <KnowledgeBase />}
        {activeTab === 'journey' && <JourneyTab user={user} />}
        {activeTab === 'health' && <TeamHealthTab />}
      </div>

      {showShareModal && <ShareStoryModal user={user} onClose={() => setShowShareModal(false)} />}
    </div>
  )
}

function HomeFeed({  }: { user?: AuthUser }) {
  const [stories, setStories] = useState<CultureStory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cultureService.getFeed().then((res) => {
      setStories(res.items)
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingSpinner />
  if (stories.length === 0) return <EmptyState icon="📖" title="Chưa có câu chuyện" description="Hãy là người tiên phong chia sẻ bài học!" />

  return (
    <div className="space-y-4 pb-10">
      <ErrorBoundary feature="Bảng Tin Văn Hóa">
        <div className="grid grid-cols-1 gap-5">
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

  const categories = {
    judgement: 'Phán đoán', communication: 'Giao tiếp', execution: 'Thực thi',
    priority: 'Ưu tiên', late_ask: 'Thiếu hỏi sớm', overstepping: 'Vượt quyền'
  }

  return (
    <div className={`bg-white rounded-2xl border ${isBreakthrough ? 'border-amber-100 shadow-md ring-4 ring-amber-50' : 'border-slate-100 shadow-sm'} p-6`}>
      {isBreakthrough && (
         <div className="flex items-center gap-2 mb-4 bg-amber-50 text-amber-700 w-max px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
            <span>🚀</span> Dám Sai - Đột Phá
         </div>
      )}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg">
          {story.user?.name?.charAt(0) || '?'}
        </div>
        <div>
           <p className="font-bold text-slate-900">{story.user?.name || 'Ẩn danh'}</p>
           <p className="text-xs text-slate-500 font-medium">{story.team?.name} • {new Date(story.created_at).toLocaleDateString('vi-VN')}</p>
        </div>
        <div className="ml-auto flex flex-col gap-1 items-end">
           <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold">#{categories[story.experience_type] || story.experience_type}</span>
        </div>
      </div>
      <div className="bg-slate-50 rounded-[20px] p-5 border border-slate-100 mb-4">
         <p className="text-sm font-medium text-slate-800 leading-relaxed indent-4">"{story.content}"</p>
      </div>
      <div className="flex gap-2 border-t border-slate-100 pt-4 flex-wrap">
        {[
          { key: 'brave', icon: '💪', label: 'Dám làm' },
          { key: 'respect', icon: '🙌', label: 'Tôn trọng' },
          { key: 'learn', icon: '💡', label: 'Học được' },
        ].map((r) => (
          <button key={r.key} onClick={() => setReacted(reacted === r.key ? null : r.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${reacted === r.key ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
            <span>{r.icon}</span> {r.label} {reacted === r.key ? '2' : '1'}
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
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg shadow-indigo-100">
        <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full w-max text-xs font-bold mb-4 backdrop-blur-md">
           <span>🏆</span> Thử thách tuần này
        </div>
        <h2 className="text-2xl font-extrabold font-header mb-6">{data.weekly.text}</h2>
        <div className="flex items-center justify-between">
           <span className="font-bold bg-white text-indigo-600 px-4 py-2 rounded-full text-sm">+{data.weekly.points} Điểm Văn Hóa</span>
           <button className="px-6 py-3 bg-slate-900 text-white font-bold text-sm rounded-full hover:bg-slate-800 active:scale-95 shadow-md">Thực hiện ngay</button>
        </div>
      </div>
      
      <div>
         <h3 className="text-lg font-bold text-slate-900 font-header mb-4 flex items-center gap-2">⚡ Thử thách hàng ngày</h3>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.daily.map(ch => (
               <div key={ch.id} className="bg-white rounded-xl border border-slate-100 p-6 flex flex-col justify-between gap-4 hover:border-indigo-200 transition-colors">
                  <p className="text-sm font-medium text-slate-700">{ch.text}</p>
                  <div className="flex justify-between items-center mt-2">
                     <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">+{ch.points} Điểm</span>
                     <button className="text-xs font-bold text-slate-500 hover:text-slate-900">Báo cáo →</button>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  )
}

function KnowledgeBase() {
  const [stories, setStories] = useState<CultureStory[]>([])
  
  useEffect(() => {
    cultureService.getLessons().then(setStories)
  }, [])

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
       <div className="mb-6">
         <h3 className="text-xl font-bold font-header text-slate-900">Kho Bài Học</h3>
         <p className="text-sm font-medium text-slate-500 mt-1">Tìm kiếm và tránh lặp lại sai lầm trong quá khứ.</p>
       </div>
       <input type="text" placeholder="🔍 Tìm kiếm bài học..." className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl px-5 py-4 text-sm font-medium text-slate-800 outline-none mb-6" />
       
       <div className="space-y-4">
          {stories.map(story => (
             <div key={story.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
               <div className="flex items-center gap-2 mb-2">
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-sm uppercase">{story.experience_type}</span>
               </div>
               <p className="text-sm text-slate-700 font-medium line-clamp-2">{story.content}</p>
             </div>
          ))}
       </div>
    </div>
  )
}

function JourneyTab({  }: { user?: AuthUser }) {
  const [data, setData] = useState<{ milestones: JourneyMilestoneRecord[]; current_scores: BehaviorScores } | null>(null)

  useEffect(() => {
    cultureService.getJourneyMe().then(d => setData(d as any))
  }, [])

  const xpDisplay     = useCountUp(data?.current_scores.total_xp ?? 0)
  const streakDisplay = useCountUp(data?.current_scores.streak ?? 0)

  if (!data) return <LoadingSpinner />

  return (
    <div className="space-y-6">
       <div className="bg-indigo-600 rounded-2xl p-8 md:p-10 text-white flex flex-col md:flex-row justify-between items-center shadow-lg shadow-indigo-100">
          <div>
            <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2">Tổng Điểm Văn Hóa</p>
            <h2 className="text-6xl font-black font-header animate-count-up">{xpDisplay} <span className="text-xl">XP</span></h2>
          </div>
          <div className="mt-6 md:mt-0 text-center bg-white/10 rounded-3xl p-6 backdrop-blur-md border border-white/20">
             <p className="text-sm font-bold text-white uppercase tracking-widest mb-1">Chuỗi duy trì</p>
             <p className="text-4xl font-black font-header animate-count-up">{streakDisplay} Ngày</p>
          </div>
       </div>

       <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
          <h3 className="text-lg font-bold font-header text-slate-900 mb-6">Chặng Đường Phát Triển</h3>
          <div className="flex gap-4 overflow-x-auto pb-4">
             {['1 Tháng', '3 Tháng', '6 Tháng', '1 Năm'].map((m, i) => (
                <div key={m} className={`min-w-[120px] rounded-3xl p-6 flex flex-col items-center text-center border-2 ${i < 2 ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                   <span className="text-3xl mb-3">{i < 2 ? '🏁' : '🔒'}</span>
                   <p className="text-sm font-bold">{m}</p>
                </div>
             ))}
          </div>
       </div>
    </div>
  )
}

function TeamHealthTab() {
  const [teams, setTeams] = useState<TeamHealth[]>([])
  
  useEffect(() => {
    cultureService.getTeamHealth().then(setTeams)
  }, [])

  return (
    <div className="space-y-6">
       {teams.map(team => (
          <div key={team.team_id} className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <div>
                   <h3 className="text-xl font-bold font-header text-slate-900">{team.team_name}</h3>
                   <p className="text-sm text-slate-500 font-medium">Quy mô: {team.member_count} nhân sự</p>
                </div>
                <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full font-bold text-sm">
                   Sức khỏe: {team.health_index}/100
                </div>
             </div>
             <p className="text-sm text-slate-600 italic bg-slate-50 p-4 rounded-xl border border-slate-100">
                AI báo cáo: "Team có dấu hiệu ngại xung đột trong các cuộc họp tuần, chỉ số phản hồi chéo đang giảm sút."
             </p>
             <button className="mt-4 px-6 py-2 border-2 border-indigo-100 text-indigo-600 font-bold rounded-xl text-sm hover:bg-indigo-50">Tạo can thiệp</button>
          </div>
       ))}
    </div>
  )
}

function ShareStoryModal({ onClose }: { user?: AuthUser; onClose: () => void }) {
  const [content, setContent] = useState('')
  return (
    <Modal isOpen title="Chia sẻ sự thật" onClose={onClose} size="md">
       <div className="p-6">
          <p className="text-sm text-slate-500 font-medium mb-4">Bạn vừa mắc sai lầm? Hay bạn vừa dũng cảm nói thẳng một quy trình vô lý? Chia sẻ ngay để mọi người cùng học.</p>
          <textarea 
            className="w-full h-32 bg-slate-50 border-2 border-slate-100 rounded-[20px] p-4 outline-none focus:border-indigo-500 focus:bg-white text-sm"
            placeholder="Mô tả sự việc đã xảy ra..."
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <div className="mt-4 flex justify-between items-center">
             <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 cursor-pointer">Gắn nhãn: #DámSai</span>
             <button className="px-6 py-3 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 text-sm shadow-md" onClick={onClose}>Đăng bài</button>
          </div>
       </div>
    </Modal>
  )
}
