import { useState } from 'react'

interface HeatmapDay {
  date: string
  deadline: number   // 0 or 1
  wyfls: number      // 0 or 1
  banned_words: number // 0 or 1
  direct_score: number // 0-5
}

function generateHeatmapData(): HeatmapDay[] {
  const days: HeatmapDay[] = []
  const today = new Date()
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const label = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    days.push({
      date: label,
      deadline: Math.random() > 0.2 ? 1 : 0,
      wyfls: Math.random() > 0.3 ? 1 : 0,
      banned_words: Math.random() > 0.8 ? 1 : 0,
      direct_score: Math.floor(Math.random() * 6),
    })
  }
  return days
}

const HEATMAP_DATA = generateHeatmapData()

const ROWS = [
  {
    key: 'deadline' as const,
    label: 'Tuân thủ deadline',
    icon: '📅',
    getScore: (d: HeatmapDay) => d.deadline,
    getColor: (s: number) => s ? '#059669' : '#f1f5f9',
    getLabel: (s: number) => s ? '✅ Đúng hạn' : '❌ Trễ hẹn',
  },
  {
    key: 'wyfls' as const,
    label: 'Check-in WYFLS',
    icon: '📋',
    getScore: (d: HeatmapDay) => d.wyfls,
    getColor: (s: number) => s ? '#4f46e5' : '#f1f5f9',
    getLabel: (s: number) => s ? '✅ Đã check-in' : '⬜ Bỏ qua',
  },
  {
    key: 'banned_words' as const,
    label: 'Không dùng từ cấm',
    icon: '🚫',
    getScore: (d: HeatmapDay) => d.banned_words ? 0 : 1,
    getColor: (s: number) => s ? '#1e293b' : '#fef2f2',
    getLabel: (s: number) => s ? '✅ Ngôn ngữ sạch' : '⚠️ Có từ cấm',
  },
  {
    key: 'direct_score' as const,
    label: 'Điểm giao tiếp thẳng',
    icon: '🎯',
    getScore: (d: HeatmapDay) => d.direct_score,
    getColor: (s: number) => {
      const scale = ['#f8fafc', '#e0f2fe', '#bae6fd', '#7dd3fc', '#22d3ee', '#0891b2']
      return scale[Math.max(0, Math.min(5, s))]
    },
    getLabel: (s: number) => s === 0 ? '⬜ Chưa đạt' : `🎯 Mức ${s}/5`,
  },
]

interface TooltipState {
  row: string
  date: string
  score: number
  label: string
  x: number
  y: number
}

export function CultureHeatmap({ streakDays = 4 }: { streakDays?: number }) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  // Compute insight
  const last7 = HEATMAP_DATA.slice(-7)
  const deadlineRate = Math.round((last7.filter(d => d.deadline).length / 7) * 100)
  const directAvg = Math.round(last7.reduce((s, d) => s + d.direct_score, 0) / 7 * 20)
  const bannedCount = HEATMAP_DATA.filter(d => d.banned_words).length

  return (
    <div className="bg-white rounded-[32px] border border-nquoc-border p-6 shadow-card">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-widest mb-1">14 ngày gần nhất</p>
          <h3 className="text-base font-bold text-nquoc-text font-header">Bản đồ nhiệt văn hóa</h3>
        </div>
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 rounded-2xl px-3 py-1.5">
          <span className="text-sm">🔥</span>
          <p className="text-xs font-bold text-amber-700">{streakDays} ngày streak</p>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: '640px' }}>
          {/* Date header */}
          <div className="grid mb-2" style={{ gridTemplateColumns: '140px repeat(14, 1fr)', gap: '4px' }}>
            <div />
            {HEATMAP_DATA.map(d => (
              <div key={d.date} className="text-[10px] text-center font-bold text-nquoc-muted">
                {d.date.split('/')[0]}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="space-y-1.5">
            {ROWS.map(row => (
              <div key={row.key} className="grid items-center" style={{ gridTemplateColumns: '140px repeat(14, 1fr)', gap: '4px' }}>
                <div className="flex items-center gap-1.5 pr-2">
                  <span className="text-xs">{row.icon}</span>
                  <p className="text-[11px] font-bold text-nquoc-muted leading-tight">{row.label}</p>
                </div>
                {HEATMAP_DATA.map((day, i) => {
                  const score = row.getScore(day)
                  const color = row.getColor(score)
                  const isTooltipTarget = tooltip?.row === row.key && tooltip?.date === day.date

                  return (
                    <button
                      key={`${row.key}-${i}`}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        setTooltip({
                          row: row.key,
                          date: day.date,
                          score,
                          label: row.getLabel(score),
                          x: rect.left,
                          y: rect.top,
                        })
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      className={`h-7 rounded-lg border transition-all duration-150 ${isTooltipTarget ? 'scale-125 z-10 shadow-md border-slate-400' : 'border-slate-100 hover:scale-110'}`}
                      style={{ backgroundColor: color }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="mt-3 p-3 bg-slate-800 rounded-2xl text-white text-xs animate-fade-in">
          <p className="font-bold">{tooltip.date} · {ROWS.find(r => r.key === tooltip.row)?.label}</p>
          <p className="opacity-80 mt-0.5">{tooltip.label}</p>
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-3 mt-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-600" />
          <span className="text-[10px] text-nquoc-muted font-bold">Đúng hạn/Sạch</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-indigo-500" />
          <span className="text-[10px] text-nquoc-muted font-bold">Check-in</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="grid grid-cols-3 gap-0.5">
            {['#e0f2fe', '#7dd3fc', '#0891b2'].map(c => (
              <div key={c} className="w-3 h-3 rounded" style={{ backgroundColor: c }} />
            ))}
          </div>
          <span className="text-[10px] text-nquoc-muted font-bold">Giao tiếp (thấp→cao)</span>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-nquoc-border">
        <div className="text-center">
          <p className="text-2xl font-extrabold font-header text-emerald-600">{deadlineRate}%</p>
          <p className="text-[10px] font-bold text-nquoc-muted uppercase">Deadline 7 ngày</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-extrabold font-header text-indigo-600">{directAvg}</p>
          <p className="text-[10px] font-bold text-nquoc-muted uppercase">Directness TB</p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-extrabold font-header ${bannedCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{bannedCount}</p>
          <p className="text-[10px] font-bold text-nquoc-muted uppercase">Từ cấm 14 ngày</p>
        </div>
      </div>
    </div>
  )
}
