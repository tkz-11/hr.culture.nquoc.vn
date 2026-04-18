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

const ROW_ICONS: Record<string, React.ReactNode> = {
  deadline: (
    <svg className="w-3 h-3 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  wyfls: (
    <svg className="w-3 h-3 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  banned_words: (
    <svg className="w-3 h-3 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  ),
  direct_score: (
    <svg className="w-3 h-3 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
}

const ROWS = [
  {
    key: 'deadline' as const,
    label: 'Tuân thủ deadline',
    getScore: (d: HeatmapDay) => d.deadline,
    getColor: (s: number) => s ? '#059669' : '#f1f5f9',
    getLabel: (s: number) => s ? 'Dung han' : 'Tre han',
    getLabelDisplay: (s: number) => s ? 'Dung han' : 'Tre han',
  },
  {
    key: 'wyfls' as const,
    label: 'Check-in WYFLS',
    getScore: (d: HeatmapDay) => d.wyfls,
    getColor: (s: number) => s ? '#4f46e5' : '#f1f5f9',
    getLabel: (s: number) => s ? 'Da check-in' : 'Bo qua',
    getLabelDisplay: (s: number) => s ? 'Da check-in' : 'Bo qua',
  },
  {
    key: 'banned_words' as const,
    label: 'Ngon ngu sach',
    getScore: (d: HeatmapDay) => d.banned_words ? 0 : 1,
    getColor: (s: number) => s ? '#1e293b' : '#fef2f2',
    getLabel: (s: number) => s ? 'Ngon ngu sach' : 'Co tu cam',
    getLabelDisplay: (s: number) => s ? 'Ngon ngu sach' : 'Co tu cam',
  },
  {
    key: 'direct_score' as const,
    label: 'Giao tiep thang',
    getScore: (d: HeatmapDay) => d.direct_score,
    getColor: (s: number) => {
      const scale = ['#f8fafc', '#e0f2fe', '#bae6fd', '#7dd3fc', '#22d3ee', '#0891b2']
      return scale[Math.max(0, Math.min(5, s))]
    },
    getLabel: (s: number) => s === 0 ? 'Chua dat' : `Muc ${s}/5`,
    getLabelDisplay: (s: number) => s === 0 ? 'Chua dat' : `Muc ${s}/5`,
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
    <div className="bg-white rounded-[16px] border border-[#ebebeb] p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-1">14 ngay gan nhat</p>
          <h3 className="text-base font-bold text-[#1a1a2e]">Ban do nhiet van hoa</h3>
        </div>
        <div className="flex items-center gap-1.5 bg-[#f5f6fa] border border-[#ebebeb] rounded-[10px] px-3 py-1.5">
          <div className="w-2 h-2 rounded-full bg-[#e53e3e]" />
          <p className="text-xs font-bold text-[#1a1a2e]">{streakDays} ngay streak</p>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: '640px' }}>
          {/* Date header */}
          <div className="grid mb-2" style={{ gridTemplateColumns: '140px repeat(14, 1fr)', gap: '4px' }}>
            <div />
            {HEATMAP_DATA.map(d => (
              <div key={d.date} className="text-[10px] text-center font-bold text-[#94a3b8]">
                {d.date.split('/')[0]}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="space-y-1.5">
            {ROWS.map(row => (
              <div key={row.key} className="grid items-center" style={{ gridTemplateColumns: '140px repeat(14, 1fr)', gap: '4px' }}>
                <div className="flex items-center gap-1.5 pr-2">
                  {ROW_ICONS[row.key]}
                  <p className="text-[11px] font-bold text-[#5a6a85] leading-tight">{row.label}</p>
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
                          label: row.getLabelDisplay(score),
                          x: rect.left,
                          y: rect.top,
                        })
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      className={`h-7 rounded-[6px] border transition-all duration-150 ${isTooltipTarget ? 'scale-125 z-10 shadow-md border-[#94a3b8]' : 'border-[#ebebeb] hover:scale-110'}`}
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
        <div className="mt-3 p-3 bg-[#1a1a2e] rounded-[10px] text-white text-xs animate-fade-in">
          <p className="font-bold">{tooltip.date} · {ROWS.find(r => r.key === tooltip.row)?.label}</p>
          <p className="opacity-70 mt-0.5">{tooltip.label}</p>
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-3 mt-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-[3px] bg-emerald-600" />
          <span className="text-[10px] text-[#94a3b8] font-bold">Dung han / Sach</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-[3px] bg-indigo-500" />
          <span className="text-[10px] text-[#94a3b8] font-bold">Check-in</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {['#e0f2fe', '#7dd3fc', '#0891b2'].map(c => (
              <div key={c} className="w-3 h-3 rounded-[3px]" style={{ backgroundColor: c }} />
            ))}
          </div>
          <span className="text-[10px] text-[#94a3b8] font-bold">Giao tiep (thap-cao)</span>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#ebebeb]">
        <div className="text-center">
          <p className="text-2xl font-extrabold text-emerald-600">{deadlineRate}%</p>
          <p className="text-[10px] font-bold text-[#94a3b8] uppercase">Deadline 7 ngay</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-extrabold text-indigo-600">{directAvg}</p>
          <p className="text-[10px] font-bold text-[#94a3b8] uppercase">Directness TB</p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-extrabold ${bannedCount > 0 ? 'text-[#e53e3e]' : 'text-emerald-600'}`}>{bannedCount}</p>
          <p className="text-[10px] font-bold text-[#94a3b8] uppercase">Tu cam 14 ngay</p>
        </div>
      </div>
    </div>
  )
}
