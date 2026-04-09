import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AuthUser } from '../../../shared/types'
import { LineChart } from '../../../shared/components/LineChart'
import { Badge } from '../../../shared/components/Badge'

interface HomePageProps {
  user: AuthUser
}

// Mock data từ các services
const MOCK_RETENTION = {
  high_risk: 2,
  stuck_count: 3,
  checkpoints_due: 5,
  total_members: 24,
  top_risks: [
    { id: '1', name: 'Nguyễn Minh Anh', team: 'Marketing', stuck_days: 14, risk: 'high' },
    { id: '2', name: 'Trần Văn Bình', team: 'Dev Team', stuck_days: 8, risk: 'high' },
    { id: '3', name: 'Lê Thị Cát', team: 'Sales', stuck_days: 5, risk: 'medium' },
  ],
}

const MOCK_CULTURE = {
  total_xp: 1240,
  streak: 7,
  latest_stories: [
    {
      id: '1',
      name: 'Phạm Đức Dũng',
      team: 'Product',
      type: 'Dám làm',
      courage: 'breakthrough',
      content: 'Tôi đã chủ động đề xuất thay đổi quy trình review code sau 3 tuần nhận ra bottleneck — và được team đồng ý triển khai ngay.',
      xp: 30,
      reactions: { fire: 18, idea: 12, hug: 7 },
    },
    {
      id: '2',
      name: 'Nguyễn Thu Hà',
      team: 'HR',
      type: 'Dám sai',
      courage: 'big',
      content: 'Tuần trước tôi gửi nhầm template onboarding cũ cho 3 newbies. Tôi đã xin lỗi trực tiếp, gửi lại đúng, và tạo checklist để không lặp lại.',
      xp: 20,
      reactions: { fire: 9, idea: 15, hug: 11 },
    },
  ],
}

const SAFETY_DATA = [6.8, 7.1, 7.4, 7.0, 7.8, 8.1, 8.4]

// === Morning Reflection Gate ===
const REFLECTION_QUESTIONS = [
  'Hôm nay bạn định thực hiện một hành động "Dám làm" nào?',
  'Có điều gì bạn đang im lặng giữ lại mà cần nói thẳng với ai đó không?',
  'Bạn sẽ hỗ trợ ai trong team hôm nay — dù chỉ một câu hỏi nhỏ?',
  'Nếu hôm nay bạn được phép mắc một "sai lầm dũng cảm", đó sẽ là gì?',
  'Điều gì đang làm bạn bế tắc? Bạn có thể hỏi sự giúp đỡ từ ai ngay bây giờ?',
]

function getSessionKey() {
  return `reflection-unlocked-${new Date().toDateString()}`
}

function ReflectionGate({ onUnlock }: { onUnlock: () => void }) {
  const q = REFLECTION_QUESTIONS[Math.floor(Math.random() * REFLECTION_QUESTIONS.length)]
  const [answer, setAnswer] = useState('')
  const [unlocking, setUnlocking] = useState(false)

  const handleUnlock = () => {
    if (answer.trim().length < 5) return
    setUnlocking(true)
    setTimeout(() => {
      sessionStorage.setItem(getSessionKey(), '1')
      onUnlock()
    }, 800)
  }

  return (
    <div className="min-h-screen bg-nquoc-bg flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-[28px] bg-gradient-indigo flex items-center justify-center text-white font-bold text-3xl mx-auto mb-5 shadow-nquoc-lg glow-indigo animate-float">
            🌅
          </div>
          <p className="text-xs font-bold text-nquoc-muted uppercase tracking-widest mb-2">
            Buổi Sáng · NhiLe HR Culture
          </p>
          <h1 className="text-3xl font-bold text-nquoc-text font-header leading-tight">
            Phản tư <span className="text-gradient-indigo">trước khi bắt đầu</span>
          </h1>
          <p className="text-sm text-nquoc-muted mt-3 leading-relaxed max-w-sm mx-auto">
            Mỗi ngày mới là một cơ hội để <strong>dám làm</strong>, <strong>dám sai</strong>, và <strong>nói thẳng</strong>.
          </p>
        </div>

        {/* Question card */}
        <div className="bg-white rounded-[32px] shadow-nquoc border border-nquoc-border p-8 mb-5">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-sm">💬</span>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Câu hỏi phản tư hôm nay</p>
          </div>
          <p className="text-base font-semibold text-nquoc-text leading-relaxed mb-6 font-header">
            "{q}"
          </p>

          <textarea
            id="reflection-answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Chia sẻ suy nghĩ của bạn... (tối thiểu 5 ký tự)"
            className="w-full h-28 border-2 border-nquoc-border rounded-2xl px-4 py-3 text-sm text-nquoc-text resize-none
              focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all placeholder-slate-300"
          />

          <div className="flex items-center justify-between mt-4">
            <p className="text-[11px] text-nquoc-muted">
              {answer.length < 5 ? `Còn ${5 - answer.length} ký tự nữa...` : '✓ Sẵn sàng mở khoá'}
            </p>
            <button
              id="unlock-dashboard-btn"
              onClick={handleUnlock}
              disabled={answer.trim().length < 5 || unlocking}
              className="px-6 py-3 bg-gradient-indigo text-white rounded-2xl text-sm font-bold
                hover:opacity-90 disabled:opacity-40 transition-all active:scale-95 shadow-nquoc
                flex items-center gap-2"
            >
              {unlocking ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Đang mở khoá...
                </>
              ) : (
                <>🚀 Mở khoá Dashboard</>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-nquoc-muted italic">
          Câu trả lời chỉ hiển thị với bạn · Đây là không gian an toàn 🔒
        </p>
      </div>
    </div>
  )
}

// === Main Home Page ===
export function HomePage({ user }: HomePageProps) {
  const navigate = useNavigate()
  const [unlocked, setUnlocked] = useState(() => !!sessionStorage.getItem(getSessionKey()))
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Chào buổi sáng' : h < 18 ? 'Buổi chiều tốt lành' : 'Chào buổi tối')
  }, [])

  if (!unlocked) {
    return <ReflectionGate onUnlock={() => setUnlocked(true)} />
  }

  const roleLabel: Record<string, string> = {
    hr_manager: 'HR Manager',
    leader: 'Team Leader',
    member: 'Thành viên',
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5 animate-fade-in">
      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden bg-gradient-indigo rounded-[32px] p-8 text-white shadow-nquoc-lg noise">
        {/* Decorative orbs */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between gap-6 flex-wrap">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-75 mb-1">{greeting}, {roleLabel[user.role]}</p>
            <h1 className="text-3xl font-bold font-header leading-tight">
              {user.name} <span className="text-2xl animate-wave inline-block">👋</span>
            </h1>
            <p className="text-sm opacity-80 mt-2 leading-relaxed max-w-md">
              Hệ thống văn hóa NhiLe Team · Dám làm · Dám sai · Nói thẳng
            </p>
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

      {/* ── Bento Grid ── */}
      <div className="grid grid-cols-12 gap-5">

        {/* KPI Cards — col 1-8 */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-4 gap-4">
          {[
            { label: 'Rủi ro cao', value: MOCK_RETENTION.high_risk, icon: '🚨', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', action: () => navigate('/retention') },
            { label: 'Đang bế tắc', value: MOCK_RETENTION.stuck_count, icon: '🔴', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', action: () => navigate('/retention') },
            { label: 'CP đến hạn', value: MOCK_RETENTION.checkpoints_due, icon: '📅', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', action: () => navigate('/retention') },
            { label: 'Tổng nhân sự', value: MOCK_RETENTION.total_members, icon: '👥', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', action: () => {} },
          ].map((kpi) => (
            <button
              key={kpi.label}
              onClick={kpi.action}
              className={`${kpi.bg} border ${kpi.border} rounded-[28px] p-5 text-left card-lift group`}
            >
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

        {/* Safety Index — col 9-12 */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-[32px] border border-nquoc-border p-6 shadow-card card-lift">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-widest">An toàn tâm lý</p>
              <p className="text-xl font-bold text-nquoc-text font-header mt-0.5">Safety Index</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-lg">🛡️</div>
          </div>
          <div className="h-[100px]">
            <LineChart
              labels={['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']}
              datasets={[{
                label: 'Safety Index',
                data: SAFETY_DATA,
                color: '#10b981',
                fill: true,
              }]}
              max={10}
            />
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="text-[11px] text-nquoc-muted">7 ngày gần nhất</p>
            <p className="text-sm font-bold text-emerald-600">8.4 / 10 ↑</p>
          </div>
        </div>

        {/* Top Risk Members — col 1-5 */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-[32px] border border-nquoc-border shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-nquoc-border">
            <div>
              <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-widest">Cần chú ý ngay</p>
              <h2 className="text-base font-bold text-nquoc-text font-header mt-0.5">Rủi ro nhân sự</h2>
            </div>
            <button
              onClick={() => navigate('/retention')}
              className="text-xs font-bold text-indigo-600 border border-indigo-200 rounded-xl px-3 py-1.5 hover:bg-indigo-50 transition-all"
            >
              Xem tất cả
            </button>
          </div>
          <div className="divide-y divide-nquoc-border">
            {MOCK_RETENTION.top_risks.map((m) => (
              <div key={m.id} className="flex items-center gap-4 px-6 py-4 hover:bg-nquoc-hover transition-colors">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0
                  ${m.risk === 'high' ? 'bg-rose-500' : 'bg-amber-500'}`}>
                  {m.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-nquoc-text truncate">{m.name}</p>
                  <p className="text-[11px] text-nquoc-muted">{m.team}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-bold ${m.stuck_days >= 10 ? 'text-rose-600 animate-pulse' : 'text-amber-600'}`}>
                    {m.stuck_days} ngày
                  </p>
                  <p className="text-[10px] font-bold text-nquoc-muted uppercase">bế tắc</p>
                </div>
                {m.risk === 'high' && (
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Culture Stories Feed Preview — col 6-9 */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-widest">Mới nhất</p>
              <h2 className="text-base font-bold text-nquoc-text font-header">Bảng tin văn hóa</h2>
            </div>
            <button
              onClick={() => navigate('/culture')}
              className="text-xs font-bold text-indigo-600 border border-indigo-200 rounded-xl px-3 py-1.5 hover:bg-indigo-50 transition-all"
            >
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
                <Badge
                  variant={story.courage === 'breakthrough' ? 'emerald' : 'indigo'}
                  size="sm"
                >
                  {story.type}
                </Badge>
              </div>
              <p className="text-xs text-nquoc-muted leading-relaxed line-clamp-2">{story.content}</p>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-nquoc-border">
                <span className="text-[11px] text-nquoc-muted">🔥 {story.reactions.fire}</span>
                <span className="text-[11px] text-nquoc-muted">💡 {story.reactions.idea}</span>
                <div className="ml-auto">
                  <Badge variant="emerald" size="sm">+{story.xp} XP</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rewrite Lab Quick ── col 10-12 */}
        <div className="col-span-12 lg:col-span-3 bg-white rounded-[32px] border border-nquoc-border p-6 shadow-card flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 flex items-center justify-center text-base">✍️</div>
            <div>
              <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-widest">Quick Lab</p>
              <p className="text-sm font-bold text-nquoc-text font-header">Giao tiếp thẳng</p>
            </div>
          </div>
          <p className="text-xs text-nquoc-muted leading-relaxed mb-4">
            Nhập tin nhắn bạn đang phân vân — AI phát hiện rào cản ngôn ngữ ngay lập tức.
          </p>
          <div className="flex-1 flex flex-col gap-3">
            <div className="text-xs space-y-2">
              {[
                { icon: '🔴', text: '"không sao ạ, để em xem lại"', type: 'Im lặng' },
                { icon: '🟡', text: '"em sẽ cố gắng hoàn thành"', type: 'Mơ hồ' },
                { icon: '🟢', text: '"Tôi cần X trước 5h chiều nay"', type: 'Thẳng thắn' },
              ].map((ex) => (
                <div key={ex.type} className="flex items-start gap-2 p-2.5 rounded-xl bg-nquoc-bg">
                  <span>{ex.icon}</span>
                  <div>
                    <p className="text-nquoc-muted italic text-[11px]">"{ex.text}"</p>
                    <p className="text-[10px] font-bold text-nquoc-muted uppercase mt-0.5">{ex.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => navigate('/passport')}
            className="mt-4 w-full py-3 bg-gradient-indigo text-white rounded-2xl text-sm font-bold
              hover:opacity-90 transition-all active:scale-95 shadow-nquoc"
          >
            Mở Rewrite Lab →
          </button>
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
    </div>
  )
}
