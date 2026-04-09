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
    emoji: '🎯',
    label: 'Người Dám Nói Thẳng',
    desc: 'Hôm nay tôi cam kết nói rõ ý kiến của mình, không dùng từ ngữ mập mờ.',
    color: 'border-indigo-400 bg-indigo-50',
    hover: 'hover:bg-indigo-100 hover:border-indigo-500',
    xp: '+20 Điểm Văn Hóa',
  },
  {
    id: 'learn',
    emoji: '💥',
    label: 'Người Dám Sai',
    desc: 'Hôm nay tôi sẽ chia sẻ một bài học từ lỗi lầm nhỏ để team cùng tiến bộ.',
    color: 'border-rose-400 bg-rose-50',
    hover: 'hover:bg-rose-100 hover:border-rose-500',
    xp: '+15 Điểm Văn Hóa',
  },
  {
    id: 'support',
    emoji: '🤝',
    label: 'Người Nâng Đỡ Đội Ngũ',
    desc: 'Hôm nay tôi sẽ chủ động nhắn tin hỏi thăm một đồng nghiệp ít nói.',
    color: 'border-emerald-400 bg-emerald-50',
    hover: 'hover:bg-emerald-100 hover:border-emerald-500',
    xp: '+10 Điểm Văn Hóa',
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 animate-fade-in relative overflow-hidden">
      <div className="absolute inset-0 z-0">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="w-full max-w-xl relative z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl animate-bounce-in">🌅</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-header leading-tight tracking-tight">
            Chào buổi sáng.
            <br />
            Hôm nay bạn chọn là ai?
          </h1>
          <p className="text-base text-slate-500 mt-3 font-medium">
            Hãy bắt đầu ngày làm việc bằng một cam kết nhỏ định hình văn hóa.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {IDENTITY_CHOICES.map((choice) => (
             <button
                key={choice.id}
                onClick={() => handleQuickSelect(choice.id)}
                className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 transform outline-none
                  ${chosen === choice.id
                    ? `${choice.color} scale-[1.02] shadow-lg shadow-slate-200/50`
                    : `bg-white border-transparent shadow-sm ${choice.hover}`
                  }`}
             >
                <div className="flex items-start gap-4">
                   <div className={`w-12 h-12 flex-shrink-0 rounded-[20px] flex items-center justify-center text-2xl
                     ${chosen === choice.id ? 'bg-white shadow-sm' : 'bg-slate-50'}
                   `}>
                     {choice.emoji}
                   </div>
                   <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                         <h3 className={`text-lg font-bold font-header tracking-tight ${chosen === choice.id ? 'text-slate-900' : 'text-slate-800'}`}>
                           {choice.label}
                         </h3>
                         <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-white px-2 py-1 rounded-full shadow-sm">{choice.xp}</span>
                      </div>
                      <p className={`text-sm leading-relaxed font-medium ${chosen === choice.id ? 'text-slate-700' : 'text-slate-500'}`}>
                         {choice.desc}
                      </p>
                   </div>
                </div>
             </button>
          ))}
        </div>
        
        {chosen && (
          <div className="animate-slide-up flex flex-col gap-3">
             <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
                 <input 
                    type="text"
                    value={reflection}
                    onChange={e => setReflection(e.target.value)}
                    placeholder="Ghi chú nhẹ: Hôm nay tôi cụ thể sẽ... (không bắt buộc)"
                    className="flex-1 bg-transparent border-none text-sm font-medium focus:ring-0 text-slate-700 placeholder-slate-400 px-2"
                 />
             </div>
             <button
               onClick={handleProceed}
               disabled={unlocking}
               className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-base
                 hover:bg-slate-800 transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2"
             >
               {unlocking ? (
                 <>
                   <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   Đang khởi tạo mục tiêu...
                 </>
               ) : '→ BẮT ĐẦU NGÀY MỚI'}
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
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in bg-[#f1f5f9]">
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6">
           <div className="text-right">
             <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Điểm Văn Hóa</p>
             <p className="text-2xl font-black font-header text-blue-700">{xpDisplay} <span className="text-sm font-bold text-amber-500">🔥{MOCK_CULTURE.streak}</span></p>
           </div>
        </div>

        <div className="max-w-[70%]">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">{greeting}, {roleLabel[user.role]}</p>
          <h1 className="text-3xl font-extrabold text-slate-900 font-header leading-tight mb-4 tracking-tight">
            {user.name} <span className="animate-wave inline-block text-2xl">👋</span>
          </h1>
          
          {identityConfig && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full mb-6">
              <span className="text-base">{identityConfig.emoji}</span>
              <span className="text-sm font-semibold text-slate-700">Hôm nay bạn là <strong className="text-slate-900">{identityConfig.label}</strong></span>
            </div>
          )}

          <div className="bg-indigo-50 border border-indigo-100 rounded-[24px] p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-800 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              Nhiệm vụ trọng tâm hôm nay
            </h3>
            <p className="text-base font-semibold text-slate-800 leading-relaxed">
              "{safetyAction}"
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button 
                 onClick={() => navigate('/culture')}
                 className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm shadow-indigo-200"
              >
                Ghi nhận vào Bảng tin
              </button>
              <button 
                 onClick={() => navigate('/passport')}
                 className="px-4 py-2 bg-white hover:bg-slate-50 text-indigo-600 border border-indigo-200 rounded-xl text-sm font-bold transition-all"
              >
                Làm Hướng dẫn
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-lift cursor-pointer" onClick={() => navigate('/passport')}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[18px] bg-slate-50 flex items-center justify-center text-xl">🎯</div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 font-header">Chỉ số Thẳng Thắn</h3>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Mức độ minh bạch</p>
                    </div>
                  </div>
                  <span className="text-2xl font-black font-header animate-count-up" style={{ color: dpColor }}>{directnessDisplay}</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${directnessProgress}%`, backgroundColor: dpColor }} />
                </div>
                <p className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                   <span>{directnessProgress >= 70 ? '🟢 Đang giữ phong độ tốt' : directnessProgress >= 50 ? '🟡 Còn mập mờ trong giao tiếp' : '🔴 Cần thay đổi khẩn cấp'}</span>
                   <span className="text-indigo-600 font-bold ml-2">Cải thiện →</span>
                </p>
             </div>

             <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-lift">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[18px] bg-emerald-50 flex items-center justify-center text-xl text-emerald-600">🛡️</div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 font-header">An Toàn Tâm Lý</h3>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Biểu đồ 7 ngày</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">8.4 ↑</span>
               </div>
               <div className="h-[100px] w-full">
                  <LineChart
                    labels={['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']}
                    datasets={[{ label: 'An Toàn Tâm Lý', data: SAFETY_DATA, color: '#10b981', fill: true }]}
                    max={10}
                  />
               </div>
               <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-600 font-medium">Bầu không khí đang rất thuận lợi để bạn <strong className="text-slate-900">Chia sẻ góc nhìn trái chiều</strong> trong hôm nay.</p>
               </div>
             </div>

             <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-[18px] bg-amber-50 flex items-center justify-center text-xl">✍️</div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 font-header">Huấn luyện Giao Tiếp</h3>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Quét lỗi mập mờ realtime</p>
                    </div>
                 </div>
                 <MiniRewritePreview />
             </div>
          </div>

          <div className="space-y-6">
             {(user.role === 'hr_manager' || user.role === 'leader') && MOCK_RETENTION.top_risks.length > 0 && (
                 <div className="bg-rose-50 border border-rose-100 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-rose-100/50 flex justify-between items-center">
                       <h3 className="text-sm font-bold text-rose-800 uppercase tracking-widest flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                         Cần can thiệp gấp ({MOCK_RETENTION.top_risks.filter(r => r.risk === 'high').length})
                       </h3>
                       <button onClick={() => navigate('/retention')} className="text-xs font-bold text-rose-600 bg-white px-3 py-1 rounded-full shadow-sm hover:bg-rose-50">
                         Mở Radar
                       </button>
                    </div>
                    <div className="divide-y divide-rose-100/40">
                       {MOCK_RETENTION.top_risks.slice(0, 2).map((m) => (
                           <div key={m.id} className="p-5 bg-white/80 hover:bg-white transition-colors cursor-pointer" onClick={() => setInterventionOpen(m.id)}>
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold
                                      ${m.risk === 'high' ? 'bg-rose-500' : 'bg-amber-500'}`}>
                                      {m.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-900">{m.name}</p>
                                    <p className="text-xs text-slate-500">{m.team}</p>
                                  </div>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${m.risk === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                  Bế tắc {m.stuck_days} ngày
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 flex gap-2 items-start mt-2 bg-slate-50 p-2 rounded-xl">
                                  <span>🤖</span>
                                  <span className="italic">{m.emotional_state}</span>
                              </p>
                              {m.risk === 'high' && (
                                <p className="text-xs font-bold text-rose-600 mt-3 flex items-center gap-1 group">
                                  Nhắn tin hỏi thăm ngay
                                  <span className="transform transition-transform group-hover:translate-x-1">→</span>
                                </p>
                              )}
                           </div>
                       ))}
                    </div>
                 </div>
             )}

             <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
               <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-bold text-slate-900 font-header">Nhịp Đập Văn Hóa</h3>
                  <button onClick={() => navigate('/culture')} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors">
                     Chia sẻ Story
                  </button>
               </div>
               
               <div className="space-y-4">
                  {MOCK_CULTURE.latest_stories.map((story) => (
                    <div key={story.id} className="p-4 rounded-[24px] bg-slate-50 border border-slate-100">
                       <div className="flex items-center gap-3 mb-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                             {story.name.charAt(0)}
                          </div>
                          <div>
                             <p className="text-sm font-bold text-slate-900">{story.name}</p>
                             <p className="text-[10px] uppercase text-slate-400 font-bold">{story.team}</p>
                          </div>
                          <Badge variant={story.courage === 'breakthrough' ? 'indigo' : 'red'} size="sm" className="hidden sm:block ml-auto">
                             {story.type}
                          </Badge>
                       </div>
                       <p className="text-sm text-slate-700 leading-relaxed mb-3">"{story.content}"</p>
                       <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
                          {[{ icon: '💪', label: 'Dám làm', count: story.reactions.brave },
                            { icon: '🙌', label: 'Tôn trọng', count: story.reactions.respect },
                            { icon: '💡', label: 'Bài học', count: story.reactions.fire }].map(r => (
                             <button key={r.label} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors bg-white px-2 py-1 rounded-lg shadow-sm border border-slate-100">
                                <span>{r.icon}</span> <span>{r.count}</span>
                             </button>
                          ))}
                       </div>
                    </div>
                  ))}
               </div>
               <button onClick={() => navigate('/culture')} className="w-full mt-4 py-3 text-sm font-bold text-slate-600 border-2 border-dashed border-slate-200 rounded-[24px] hover:border-slate-300 hover:text-slate-800 transition-all">
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
          className="w-full h-24 bg-slate-50 border-2 border-slate-100 rounded-[20px] px-4 py-3 text-sm text-slate-700 resize-none
            focus:outline-none focus:border-indigo-400 focus:bg-white transition-all placeholder-slate-400"
        />
      </div>
      {text.length > 5 && suggestion && (
        <div className="text-xs font-medium text-amber-800 bg-amber-50 px-4 py-3 rounded-[16px] border border-amber-200">
          💡 <strong className="font-bold">Gợi ý sửa tư duy:</strong> {suggestion}
        </div>
      )}
      {text.length > 5 && !suggestion && (
        <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-3 rounded-[16px] border border-emerald-200 flex items-center gap-2">
          <span>✅</span> Cách viết rõ ràng, hãy giữ phong độ!
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
      icon: '🤝',
      msg: `"Chào ${member.name}, mình thấy bạn có vẻ đang mang áp lực. Mình ở đây để nghe bạn nói, không phán xét. Bạn có muốn dành 15p chia sẻ không?"`,
      action: 'Hỏi thăm nhẹ nhàng qua Chat'
    },
    {
      tone: 'Đối Thoại Trực Diện',
      icon: '🎯',
      msg: `"${member.name}, thấy bạn bế tắc ${member.stuck_days} ngày rỗi. Mình ngồi với nhau 15 phút nhé để xem vấn đề ở đâu, chúng ta cùng giải quyết."`,
      action: 'Đặt lịch 1-on-1 Khẩn'
    }
  ]

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in border border-white">
        <div className="p-6 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
               Gợi ý Can Thiệp Tâm Lý
            </p>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 shadow-sm transition-colors">✕</button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-[20px] flex items-center justify-center text-2xl font-bold shadow-sm shadow-slate-200 text-rose-500 border border-slate-100">
              {member.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-header">{member.name}</h3>
              <p className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg mt-1 inline-block">Đang có dấu hiệu bế tắc</p>
            </div>
          </div>
        </div>

        {!sent ? (
          <div className="p-6 space-y-5">
            <div>
              <p className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-widest">Dấu hiệu nhận biết:</p>
              <p className="text-sm text-slate-700 font-medium italic border-l-2 border-slate-200 pl-3">"{member.emotional_state}"</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-3 font-bold uppercase tracking-widest">Chọn kịch bản tiếp cận:</p>
              <div className="space-y-3">
                {scripts.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setScript(i)}
                    className={`w-full text-left p-4 rounded-[24px] border-2 transition-all ${
                      script === i
                        ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                        : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                       <p className="font-bold text-slate-900 flex items-center gap-2">{s.icon} <span className="font-header">{s.tone}</span></p>
                       <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase ${script === i ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{s.action}</span>
                    </div>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">{s.msg}</p>
                  </button>
                ))}
              </div>
            </div>
            <button
               onClick={() => setSent(true)}
               className="w-full py-4 text-white rounded-[24px] text-base font-bold transition-all active:scale-[0.98] bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-200"
            >
              Sao chép & Mở ứng dụng Chat
            </button>
          </div>
        ) : (
          <div className="p-8 text-center space-y-4">
            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
               <span className="text-4xl animate-bounce-in">✅</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 font-header">Tuyệt vời Leader!</h3>
            <p className="text-sm font-medium text-slate-600 leading-relaxed max-w-[250px] mx-auto">Sự quan tâm lúc này sẽ là chìa khóa mở nút thắt cho {member.name.split(' ')[0]}.</p>
            <button onClick={onClose} className="w-full mt-4 py-3 bg-slate-100 text-slate-700 rounded-[24px] text-sm font-bold hover:bg-slate-200 transition-colors">
              Đóng và Quay lại
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
