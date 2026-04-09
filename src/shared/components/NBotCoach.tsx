import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import type { AuthUser } from '../types'

interface NBotMessage {
  id: string
  text: string
  actions?: { label: string; url?: string }[]
  type: 'info' | 'warning' | 'success' | 'tip'
}

const CONTEXT_MESSAGES: Record<string, NBotMessage[]> = {
  '/': [
    {
      id: 'home1', type: 'tip',
      text: 'Bạn đã chọn identity hôm nay chưa? Cam kết cụ thể tăng hành động thực tế lên 3,5 lần!',
      actions: [{ label: 'Xem Safety Index', url: '/retention' }],
    },
    {
      id: 'home2', type: 'warning',
      text: 'Có 2 trường hợp URGENT chưa được can thiệp. Nhấn vào nhân sự để xem gợi ý script.',
      actions: [{ label: 'Xem Retention Radar', url: '/retention' }],
    },
  ],
  '/retention': [
    {
      id: 'ret1', type: 'warning',
      text: 'Phạm Tuấn đã bế tắc 16 ngày. Nghiên cứu cho thấy sau 21 ngày, khả năng nghỉ việc tăng 4x.',
      actions: [{ label: 'Xem Wizard' }],
    },
    {
      id: 'ret2', type: 'tip',
      text: 'Tip script giao tiếp: "Mình không phán xét, mình chỉ muốn hiểu để hỗ trợ." — câu này giảm defensive reaction ngay.',
    },
  ],
  '/passport': [
    {
      id: 'pass1', type: 'tip',
      text: 'Thử gõ "không sao ạ" vào Rewrite Lab — xem hệ thống nhận diện ngay lập tức. Real-time coaching!',
      actions: [{ label: 'Đến Rewrite Lab' }],
    },
    {
      id: 'pass2', type: 'info',
      text: 'Directness Score tuần này: 74/100. Bạn đang tiến bộ! Mục tiêu tuần tới: 80+. Thêm mốc thời gian cụ thể vào tin nhắn để tăng điểm.',
    },
  ],
  '/culture': [
    {
      id: 'cul1', type: 'success',
      text: '2 câu chuyện mới được chia sẻ hôm nay. Mỗi reaction của bạn = tạo ra cảm giác an toàn cho người khác nói thật hơn.',
    },
    {
      id: 'cul2', type: 'tip',
      text: 'Challenge tuần này: "Nói thẳng với 1 người bạn hay né tránh". Hoàn thành 3 ngày streak = mở khóa Culture XP x2!',
    },
  ],
}

interface NBotCoachProps {
  user: AuthUser
}

export function NBotCoach({ user }: NBotCoachProps) {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [msgIndex, setMsgIndex] = useState(0)
  const [pulse, setPulse] = useState(true)

  // Only show for leader/hr
  if (user.role === 'member') return null

  const messages = CONTEXT_MESSAGES[location.pathname] ?? CONTEXT_MESSAGES['/']
  const current = messages[msgIndex % messages.length]

  // Pulse every 10s to attract attention
  useEffect(() => {
    if (open) return
    const interval = setInterval(() => {
      setPulse(true)
      setTimeout(() => setPulse(false), 2000)
    }, 10000)
    return () => clearInterval(interval)
  }, [open])

  const typeConfig = {
    info:    { bg: 'bg-indigo-500', icon: 'ℹ️', border: 'border-indigo-200', headerBg: 'bg-indigo-50 text-indigo-700' },
    warning: { bg: 'bg-amber-500',  icon: '⚠️', border: 'border-amber-200',  headerBg: 'bg-amber-50 text-amber-700' },
    success: { bg: 'bg-emerald-500',icon: '✅', border: 'border-emerald-200',headerBg: 'bg-emerald-50 text-emerald-700' },
    tip:     { bg: 'bg-violet-500', icon: '💡', border: 'border-violet-200', headerBg: 'bg-violet-50 text-violet-700' },
  }[current.type]

  const handleNext = () => setMsgIndex(i => (i + 1) % messages.length)

  return (
    <div className="fixed bottom-6 right-6 z-[500] flex flex-col items-end gap-3">
      {/* Chat bubble */}
      {open && (
        <div
          className={`w-72 bg-white rounded-[28px] shadow-2xl border ${typeConfig.border} overflow-hidden animate-scale-in`}
          style={{ transformOrigin: 'bottom right' }}
        >
          {/* Header */}
          <div className={`flex items-center gap-3 px-5 py-4 ${typeConfig.headerBg}`}>
            <div className="w-8 h-8 rounded-xl bg-gradient-indigo flex items-center justify-center text-white text-base">🤖</div>
            <div className="flex-1">
              <p className="text-xs font-bold">N-Bot Coach</p>
              <p className="text-[10px] opacity-70">{location.pathname === '/' ? 'Dashboard' : location.pathname.slice(1)}</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors text-sm">✕</button>
          </div>

          {/* Message */}
          <div className="px-5 py-4 space-y-3">
            <div className="flex gap-2">
              <span className="text-lg flex-shrink-0 mt-0.5">{typeConfig.icon}</span>
              <p className="text-xs text-nquoc-text leading-relaxed">{current.text}</p>
            </div>

            {current.actions && (
              <div className="flex gap-2 flex-wrap">
                {current.actions.map((action, i) => (
                  <button key={i} className="text-[11px] font-bold text-indigo-600 border border-indigo-200 rounded-xl px-3 py-1.5 hover:bg-indigo-50 transition-all">
                    {action.label} →
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer nav */}
          <div className="px-5 pb-4 flex items-center justify-between">
            <p className="text-[10px] text-nquoc-muted">{msgIndex % messages.length + 1}/{messages.length} gợi ý</p>
            <button
              onClick={handleNext}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Gợi ý khác →
            </button>
          </div>
        </div>
      )}

      {/* FAB button */}
      <button
        id="nbot-coach-fab"
        onClick={() => { setOpen(o => !o); setPulse(false) }}
        className={`relative w-14 h-14 rounded-[22px] bg-gradient-indigo text-white text-xl flex items-center justify-center
          shadow-nquoc-lg hover:scale-110 active:scale-95 transition-all duration-300
          ${pulse && !open ? 'animate-pulse-glow' : ''}`}
      >
        {open ? '✕' : '🤖'}
        {/* Notification dot */}
        {!open && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center">
            <span className="text-[8px] font-bold text-white">{messages.length}</span>
          </div>
        )}
      </button>
    </div>
  )
}
