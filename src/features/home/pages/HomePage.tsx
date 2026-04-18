import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AuthUser } from '../../../shared/types'
import { LineChart } from '../../../shared/components/LineChart'
import { Badge } from '../../../shared/components/Badge'
import { useCountUp } from '../../../shared/hooks/useCountUp'

interface HomePageProps {
  user: AuthUser
}

const MOCK_RETENTION = {
  high_risk: 2,
  stuck_count: 3,
  checkpoints_due: 5,
  total_members: 24,
  top_risks: [
    {
      id: '1', name: 'Nguyễn Minh Anh', team: 'Marketing',
      stuck_days: 16, risk: 'high',
      emotional_state: 'Cảm thấy bị cô lập do thiếu kết nối liên tục 2 tuần qua',
      last_note: 'Bỏ lỡ 2 deadline quan trọng mà không có phản hồi',
    },
    {
      id: '2', name: 'Trần Văn Bình', team: 'Dev Team',
      stuck_days: 9, risk: 'high',
      emotional_state: 'Đang chịu áp lực cao nhưng có xu hướng im lặng chịu đựng',
      last_note: 'Liên tục thức khuya commit code nhưng chất lượng giảm sút',
    },
    {
      id: '3', name: 'Lê Thị Cát', team: 'Sales',
      stuck_days: 4, risk: 'medium',
      emotional_state: 'Lúng túng với quy trình báo giá mới, ngần ngại hỏi leader',
      last_note: 'KPI tuần này đang chậm 40%',
    },
  ],
}

const MOCK_CULTURE = {
  total_xp: 1240,
  streak: 7,
  directness_score: 74,
  latest_stories: [
    {
      id: '1', name: 'Phạm Đức Dũng', team: 'Product',
      type: 'Dám làm', courage: 'breakthrough',
      content: 'Tôi nhận ra quy trình duyệt tính năng đang tốn quá nhiều thời gian chờ đợi. Hôm nay tôi đã thẳng thắn đề xuất cắt giảm 2 bước không cần thiết.',
      xp: 30, reactions: { fire: 18, brave: 12, respect: 7 },
    },
    {
      id: '2', name: 'Nguyễn Thu Hà', team: 'HR',
      type: 'Dám sai', courage: 'big',
      content: 'Trong buổi onboarding hôm qua, tôi lỡ cung cấp sai quy chế làm việc từ xa vì không check bản cập nhật mới nhất. Tôi đã công khai xin lỗi và gửi đính chính ngay sau đó.',
      xp: 20, reactions: { fire: 9, brave: 15, respect: 11 },
    },
  ],
}

const SAFETY_DATA = [6.8, 7.1, 7.4, 7.0, 7.8, 8.1, 8.4]

const IDENTITY_CHOICES = [
  {
    id: 'direct',
    color: 'border-[#e53e3e] bg-[#fff0f0]',
    textColor: 'text-[#e53e3e]',
    hover: 'hover:bg-[#ffe4e4] hover:border-[#e53e3e]',
    label: 'Người Dám Nói Thẳng',
    desc: 'Hôm nay tôi cam kết nói rõ ý kiến của mình, không dùng từ ngữ mập mờ.',
    xp: '+20 XP',
  },
  {
    id: 'learn',
    color: 'border-[#d97706] bg-[#fffbeb]',
    textColor: 'text-[#d97706]',
    hover: 'hover:bg-[#fef3c7] hover:border-[#d97706]',
    label: 'Người Dám Sai',
    desc: 'Hôm nay tôi sẽ chia sẻ một bài học từ lỗi lầm nhỏ để team cùng tiến bộ.',
    xp: '+15 XP',
  },
  {
    id: 'support',
    color: 'border-[#059669] bg-[#f0fdf4]',
    textColor: 'text-[#059669]',
    hover: 'hover:bg-[#dcfce7] hover:border-[#059669]',
    label: 'Người Nâng Đỡ Đội Ngũ',
    desc: 'Hôm nay tôi sẽ chủ động nhắn tin hỏi thăm một đồng nghiệp ít nói.',
    xp: '+10 XP',
  },
]

const SAFETY_ACTIONS = [
  'Hỏi thăm 1 đồng đội có vẻ mệt mỏi trong cuộc họp gần nhất',
  'Giúp 1 người làm rõ vấn đề bằng cách áp dụng công cụ Rewrite Lab',
  'Chia sẻ 1 bài học về sự cố tuần trước vào Bảng tin Văn hóa',
  'Gửi 1 lời khen ngợi chân thành đến đồng nghiệp đã hỗ trợ bạn',
]

function getSessionKey() { return `identity-chosen-${new Date().toDateString()}` }
function getSavedIdentity() { return sessionStorage.getItem(getSessionKey()) }

function IdentityGate({ onUnlock }: { onUnlock: (identity: string) => void }) {
  const [chosen, setChosen] = useState<string | null>(null)
  const [unlocking, setUnlocking] = useState(false)
  const [reflection, setReflection] = useState('')

  const handleProceed = () => {
    if (!chosen) return
    setUnlocking(true)
    setTimeout(() => {
      sessionStorage.setItem(getSessionKey(), chosen)
      onUnlock(chosen)
    }, 600)
  }

  const handleQuickSelect = (id: string) => {
    setChosen(id)
  }

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#e53e3e] rounded-[14px] flex items-center justify-center mx-auto mb-5 shadow-red-glow">
            <span className="text-white font-black text-xl font-header">N</span>
          </div>
          <h1 className="text-2xl font-black text-[#1a1a2e] font-header leading-tight tracking-tight">
            Hôm nay bạn chọn là ai?
          </h1>
          <p className="text-[13px] text-[#5a6a85] mt-2">
            Bắt đầu ngày làm việc bằng một cam kết nhỏ định hình văn hóa.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {IDENTITY_CHOICES.map((choice) => (
            <button
              key={choice.id}
              onClick={() => handleQuickSelect(choice.id)}
              className={`w-full text-left p-4 rounded-[14px] border-2 transition-all duration-200 outline-none ${
                chosen === choice.id
                  ? `${choice.color} shadow-sm`
                  : `bg-white border-[#ebebeb] hover:border-[#e53e3e]/30 shadow-card`
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-1 h-10 rounded-full flex-shrink-0 ${chosen === choice.id ? choice.textColor : 'text-[#ebebeb]'}`}
                  style={{ background: chosen === choice.id ? 'currentColor' : '#ebebeb' }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className={`text-[13px] font-bold font-header ${chosen === choice.id ? choice.textColor : 'text-[#1a1a2e]'}`}>
                      {choice.label}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[6px] ${chosen === choice.id ? choice.textColor + ' bg-white/60' : 'text-[#94a3b8] bg-[#f5f6fa]'}`}>
                      {choice.xp}
                    </span>
                  </div>
                  <p className={`text-[12px] leading-relaxed ${chosen === choice.id ? choice.textColor + '/80' : 'text-[#5a6a85]'}`}>
                    {choice.desc}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {chosen && (
          <div className="animate-slide-up flex flex-col gap-3">
            <input
              type="text"
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              placeholder="Ghi chú: Hôm nay tôi cụ thể sẽ... (không bắt buộc)"
              className="w-full bg-white border border-[#ebebeb] rounded-[12px] px-4 py-3 text-[13px] text-[#1a1a2e] outline-none focus:border-[#e53e3e]/40 placeholder-[#c0ccd8]"
            />
            <button
              onClick={handleProceed}
              disabled={unlocking}
              className="w-full py-3.5 bg-[#e53e3e] text-white rounded-[12px] font-bold text-[13px] hover:bg-[#c53030] transition-all active:scale-[0.98] shadow-red-glow disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {unlocking ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang khởi tạo...
                </>
              ) : 'Bắt đầu ngày mới'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function HomePage({ user }: HomePageProps) {
  const navigate = useNavigate()
  const [unlocked, setUnlocked] = useState(() => !!getSavedIdentity())
  const [identity, setIdentity] = useState<string | null>(() => getSavedIdentity())
  const [greeting, setGreeting] = useState('')
  const [safetyAction] = useState(() => SAFETY_ACTIONS[Math.floor(Math.random() * SAFETY_ACTIONS.length)])
  const [interventionOpen, setInterventionOpen] = useState<string | null>(null)

  useEffect(() => {
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Chào buổi sáng' : h < 18 ? 'Buổi chiều hiệu quả' : 'Chào buổi tối')
  }, [])

  if (!unlocked) {
    return <IdentityGate onUnlock={(id) => { setIdentity(id); setUnlocked(true) }} />
  }

  const roleLabel: Record<string, string> = {
    hr_manager: 'HR Manager', leader: 'Leader', member: 'Thành viên',
  }

  const identityConfig = IDENTITY_CHOICES.find(i => i.id === identity)

  const directnessProgress = MOCK_CULTURE.directness_score
  const dpColor = directnessProgress >= 70 ? '#10b981' : directnessProgress >= 50 ? '#f59e0b' : '#e11d48'
  const xpDisplay = useCountUp(MOCK_CULTURE.total_xp)
  const directnessDisplay = useCountUp(directnessProgress)

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-5 animate-fade-in">
      {/* Hero card */}
      <div className="bg-white rounded-[16px] p-5 shadow-card border border-[#ebebeb] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#fff0f0] rounded-full -translate-y-8 translate-x-8" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.12em] mb-1">{greeting}, {roleLabel[user.primary_role]}</p>
            <h1 className="text-xl font-black text-[#1a1a2e] font-header leading-tight tracking-tight">
              {user.full_name}
            </h1>
            {identityConfig && (
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-[8px] mt-2 border text-[11px] font-bold ${identityConfig.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${identityConfig.textColor}`} style={{ background: 'currentColor' }} />
                <span className={identityConfig.textColor}>Hôm nay bạn là {identityConfig.label}</span>
              </div>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-[0.1em] mb-1">Điểm Văn Hóa</p>
            <p className="text-2xl font-black font-header text-[#e53e3e]">{xpDisplay} <span className="text-sm text-[#94a3b8] font-bold">XP</span></p>
            <p className="text-[11px] text-[#10b981] font-bold">{MOCK_CULTURE.streak} ngày liên tiếp</p>
          </div>
        </div>
        <div className="bg-[#f5f6fa] border border-[#ebebeb] rounded-[12px] p-4 mt-4 relative z-10">
          <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.1em] mb-1.5">Nhiệm vụ hôm nay</p>
          <p className="text-[13px] text-[#1a1a2e] font-medium leading-relaxed">"{safetyAction}"</p>
          <div className="mt-3 flex gap-2">
            <button onClick={() => navigate('/culture')} className="px-4 py-1.5 bg-[#e53e3e] text-white text-[11px] font-bold rounded-[8px] hover:bg-[#c53030] transition-all shadow-red-glow">
              Ghi vào Bảng tin
            </button>
            <button onClick={() => navigate('/passport')} className="px-4 py-1.5 bg-[#f5f6fa] text-[#5a6a85] border border-[#ebebeb] text-[11px] font-bold rounded-[8px] hover:bg-[#f0f0f0] transition-all">
              Vào Phòng Tập
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          {/* Directness */}
          <div className="bg-white rounded-[16px] p-5 shadow-card border border-[#ebebeb] cursor-pointer hover:shadow-card-hover transition-all" onClick={() => navigate('/passport')}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-[#fff0f0] rounded-[10px] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e53e3e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-[13px] font-bold text-[#1a1a2e]">Chỉ số Thẳng Thắn</h3>
                <p className="text-[10px] text-[#94a3b8]">Mức độ minh bạch</p>
              </div>
              <span className="text-xl font-black font-header" style={{ color: dpColor }}>{directnessDisplay}</span>
            </div>
            <div className="h-2 bg-[#f5f6fa] rounded-full overflow-hidden mb-2">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${directnessProgress}%`, backgroundColor: dpColor }} />
            </div>
            <p className="text-[11px] text-[#94a3b8] flex justify-between">
              <span>{directnessProgress >= 70 ? 'Đang giữ phong độ tốt' : directnessProgress >= 50 ? 'Còn mập mờ trong giao tiếp' : 'Cần thay đổi khẩn cấp'}</span>
              <span className="text-[#e53e3e] font-bold">Cải thiện</span>
            </p>
          </div>

          {/* Safety chart */}
          <div className="bg-white rounded-[16px] p-5 shadow-card border border-[#ebebeb]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-[#f0fdf4] rounded-[10px] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-[13px] font-bold text-[#1a1a2e]">An Toàn Tâm Lý</h3>
                <p className="text-[10px] text-[#94a3b8]">Biểu đồ 7 ngày</p>
              </div>
              <span className="text-[13px] font-bold text-[#10b981] bg-[#f0fdf4] px-2 py-1 rounded-[7px]">8.4</span>
            </div>
            <div className="h-[90px] w-full">
              <LineChart
                labels={['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']}
                datasets={[{ label: 'An Toàn', data: SAFETY_DATA, color: '#10b981', fill: true }]}
                max={10}
              />
            </div>
          </div>

          {/* Mini rewrite */}
          <div className="bg-white rounded-[16px] p-5 shadow-card border border-[#ebebeb]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-[#fff0f0] rounded-[10px] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e53e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-[#1a1a2e]">Huấn luyện Giao Tiếp</h3>
                <p className="text-[10px] text-[#94a3b8]">Quét lỗi mập mờ realtime</p>
              </div>
            </div>
            <MiniRewritePreview />
          </div>
        </div>

        <div className="space-y-4">
          {/* Retention alerts */}
          {(user.primary_role === 'hr_manager' || user.primary_role === 'leader') && MOCK_RETENTION.top_risks.length > 0 && (
            <div className="bg-white border border-[#ebebeb] rounded-[16px] overflow-hidden shadow-card">
              <div className="px-4 py-3 border-b border-[#f0f0f0] flex justify-between items-center">
                <h3 className="text-[12px] font-bold text-[#e53e3e] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#e53e3e] animate-pulse" />
                  Cần can thiệp ({MOCK_RETENTION.top_risks.filter(r => r.risk === 'high').length})
                </h3>
                <button onClick={() => navigate('/retention')} className="text-[11px] font-bold text-[#5a6a85] bg-[#f5f6fa] px-2.5 py-1 rounded-[7px] hover:bg-[#f0f0f0] transition-colors">
                  Mở Radar
                </button>
              </div>
              <div className="divide-y divide-[#f0f0f0]">
                {MOCK_RETENTION.top_risks.slice(0, 2).map((m) => (
                  <div key={m.id} className="p-4 hover:bg-[#f5f6fa] transition-colors cursor-pointer" onClick={() => setInterventionOpen(m.id)}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center text-white text-[11px] font-bold ${m.risk === 'high' ? 'bg-[#e53e3e]' : 'bg-[#d97706]'}`}>
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-[#1a1a2e]">{m.name}</p>
                          <p className="text-[10px] text-[#94a3b8]">{m.team}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-[6px] ${m.risk === 'high' ? 'bg-[#fff0f0] text-[#e53e3e]' : 'bg-[#fffbeb] text-[#d97706]'}`}>
                        Bế tắc {m.stuck_days} ngày
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5a6a85] bg-[#f5f6fa] p-2.5 rounded-[8px] italic leading-relaxed">
                      {m.emotional_state}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Culture feed */}
          <div className="bg-white rounded-[16px] p-5 shadow-card border border-[#ebebeb]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-bold text-[#1a1a2e]">Nhịp Đập Văn Hóa</h3>
              <button onClick={() => navigate('/culture')} className="text-[11px] font-bold text-[#e53e3e] bg-[#fff0f0] px-2.5 py-1 rounded-[7px] hover:bg-[#ffe4e4] transition-colors">
                Chia sẻ
              </button>
            </div>
            <div className="space-y-3">
              {MOCK_CULTURE.latest_stories.map((story) => (
                <div key={story.id} className="p-3.5 rounded-[12px] bg-[#f5f6fa] border border-[#ebebeb]">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-[8px] bg-[#e53e3e] flex items-center justify-center text-white text-[11px] font-bold">
                      {story.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-[#1a1a2e] truncate">{story.name}</p>
                      <p className="text-[10px] text-[#94a3b8]">{story.team}</p>
                    </div>
                    <Badge variant={story.courage === 'breakthrough' ? 'indigo' : 'red'} size="sm">
                      {story.type}
                    </Badge>
                  </div>
                  <p className="text-[12px] text-[#5a6a85] leading-relaxed line-clamp-2">"{story.content}"</p>
                  <div className="flex gap-2 mt-2.5 pt-2.5 border-t border-[#ebebeb]">
                    {[{ label: 'Dám làm', count: story.reactions.brave },
                      { label: 'Tôn trọng', count: story.reactions.respect },
                      { label: 'Bài học', count: story.reactions.fire }].map(r => (
                      <button key={r.label} className="flex items-center gap-1 text-[10px] font-bold text-[#5a6a85] hover:text-[#1a1a2e] bg-white px-2 py-1 rounded-[6px] border border-[#ebebeb] transition-colors">
                        {r.label} <span className="text-[#94a3b8]">{r.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/culture')} className="w-full mt-3 py-2.5 text-[12px] font-bold text-[#5a6a85] border border-dashed border-[#ebebeb] rounded-[10px] hover:border-[#e53e3e]/30 hover:text-[#1a1a2e] transition-all">
              Xem thêm câu chuyện
            </button>
          </div>
        </div>
      </div>

      {interventionOpen && (
        <QuickInterventionModal
          member={MOCK_RETENTION.top_risks.find(m => m.id === interventionOpen)!}
          onClose={() => setInterventionOpen(null)}
        />
      )}
    </div>
  )
}

const REWRITE_HINTS: Record<string, string> = {
  'cố gắng': 'Hãy đưa ra thời gian hoàn thành cụ thể (VD: Xong trước 10h sáng mai)',
  'hy vọng': 'Đổi thành xác nhận hành động cụ thể',
  'bình thường': 'Nếu có vấn đề, hãy nói rõ ràng điểm mà bạn thấy chưa ổn',
}

function MiniRewritePreview() {
  const [text, setText] = useState('')
  const [suggestion, setSuggestion] = useState<string | null>(null)

  const handleChange = (val: string) => {
    setText(val)
    const lower = val.toLowerCase()
    const badKey = Object.keys(REWRITE_HINTS).find(k => lower.includes(k))
    setSuggestion(badKey ? REWRITE_HINTS[badKey] : null)
  }

  return (
    <div className="flex-1 flex flex-col gap-3">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Dán hoặc gõ tin nhắn phản hồi của bạn vào đây..."
          className="w-full h-24 bg-[#f5f6fa] border border-[#ebebeb] rounded-[12px] px-4 py-3 text-sm text-[#1a1a2e] resize-none
            focus:outline-none focus:border-[#e53e3e]/40 focus:bg-white transition-all placeholder-[#94a3b8]"
        />
      </div>
      {text.length > 5 && suggestion && (
        <div className="text-xs font-medium text-amber-800 bg-amber-50 px-4 py-3 rounded-[12px] border border-amber-200 flex items-start gap-2">
          <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span><strong className="font-bold">Gợi ý sửa tư duy:</strong> {suggestion}</span>
        </div>
      )}
      {text.length > 5 && !suggestion && (
        <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-3 rounded-[12px] border border-emerald-200 flex items-center gap-2">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Cách viết rõ ràng, hãy giữ phong độ!
        </div>
      )}
    </div>
  )
}

function QuickInterventionModal({ member, onClose }: { member: any; onClose: () => void }) {
  const [script, setScript] = useState(0)
  const [sent, setSent] = useState(false)

  const scripts = [
    {
      tone: 'Quan Tâm Chân Thành',
      msg: `"Chào ${member.name}, mình thấy bạn có vẻ đang mang áp lực. Mình ở đây để nghe bạn nói, không phán xét. Bạn có muốn dành 15p chia sẻ không?"`,
      action: 'Hỏi thăm qua Chat'
    },
    {
      tone: 'Đối Thoại Trực Diện',
      msg: `"${member.name}, thấy bạn bế tắc ${member.stuck_days} ngày rồi. Mình ngồi với nhau 15 phút nhé để xem vấn đề ở đâu, chúng ta cùng giải quyết."`,
      action: 'Đặt lịch 1-on-1'
    }
  ]

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#1a1a2e]/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-[18px] shadow-2xl overflow-hidden animate-scale-in">
        <div className="p-6 bg-[#f5f6fa] border-b border-[#ebebeb]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">
              Gợi ý Can Thiệp
            </p>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white border border-[#ebebeb] flex items-center justify-center text-[#5a6a85] hover:text-[#1a1a2e] transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#e53e3e] rounded-[12px] flex items-center justify-center text-lg font-bold text-white">
              {member.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1a1a2e]">{member.name}</h3>
              <span className="text-[11px] font-semibold text-[#e53e3e] bg-red-50 px-2 py-0.5 rounded-[6px] mt-1 inline-block">Đang có dấu hiệu bế tắc</span>
            </div>
          </div>
        </div>

        {!sent ? (
          <div className="p-6 space-y-5">
            <div>
              <p className="text-[10px] text-[#94a3b8] mb-2 font-bold uppercase tracking-widest">Dấu hiệu nhận biết:</p>
              <p className="text-sm text-[#5a6a85] font-medium italic border-l-2 border-[#e53e3e]/30 pl-3">"{member.emotional_state}"</p>
            </div>
            <div>
              <p className="text-[10px] text-[#94a3b8] mb-3 font-bold uppercase tracking-widest">Chọn kịch bản tiếp cận:</p>
              <div className="space-y-2">
                {scripts.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setScript(i)}
                    className={`w-full text-left p-4 rounded-[12px] border transition-all ${
                      script === i
                        ? 'border-[#e53e3e] bg-red-50'
                        : 'border-[#ebebeb] hover:bg-[#f5f6fa]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="font-bold text-[#1a1a2e] text-sm">{s.tone}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[6px] uppercase ${script === i ? 'bg-[#e53e3e] text-white' : 'bg-[#f5f6fa] text-[#5a6a85]'}`}>{s.action}</span>
                    </div>
                    <p className="text-xs text-[#5a6a85] leading-relaxed">{s.msg}</p>
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setSent(true)}
              className="w-full py-3 text-white rounded-[12px] text-sm font-bold transition-all active:scale-[0.98] bg-[#e53e3e] hover:bg-[#c53030]"
            >
              Sao chép & Mở ứng dụng Chat
            </button>
          </div>
        ) : (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-[16px] flex items-center justify-center mx-auto border border-emerald-100">
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#1a1a2e]">Tuyệt vời, Leader!</h3>
            <p className="text-sm font-medium text-[#5a6a85] leading-relaxed max-w-[250px] mx-auto">Sự quan tâm lúc này sẽ là chìa khóa mở nút thắt cho {member.name.split(' ')[0]}.</p>
            <button onClick={onClose} className="w-full mt-4 py-3 bg-[#f5f6fa] text-[#5a6a85] rounded-[12px] text-sm font-bold hover:bg-[#ebebeb] transition-colors">
              Đóng và Quay lại
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
