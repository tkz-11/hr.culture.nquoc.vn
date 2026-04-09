import { useState, useEffect } from 'react'
import { passportService } from '../services/passport.service'
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner'
import { Badge } from '../../../shared/components/Badge'
import { LineChart } from '../../../shared/components/LineChart'
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary'

export function HRPassportDashboard() {
  const [data, setData] = useState<{
    avg_directness_score: number
    banned_word_pct: number
    weekly_trend: { week: string; avg_score: number }[]
    members_needing_attention: { user_id: string; name: string; directness_score: number; trend: string }[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    passportService.getDashboard().then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingSpinner />
  if (!data) return null

  const trendLabels = data.weekly_trend.map(t => t.week)
  const trendValues = data.weekly_trend.map(t => t.avg_score)

  return (
    <ErrorBoundary feature="Dashboard Passport HR">
      <div className="space-y-6">
        {/* Overview row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-[32px] border border-nquoc-border p-8 shadow-sm">
            <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-wider mb-2">Chỉ số nói thẳng trung bình</p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-extrabold text-nquoc-blue font-header">{data.avg_directness_score.toFixed(1)}</span>
              <span className="text-sm text-nquoc-muted mb-2 font-medium">/ 10</span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="emerald" size="sm">+5% so với tuần trước</Badge>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-nquoc-border p-8 shadow-sm">
            <p className="text-[10px] font-bold text-nquoc-muted uppercase tracking-wider mb-2">Tỷ lệ dùng từ cấm (Vague/Silent)</p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-extrabold text-rose-600 font-header">{data.banned_word_pct}%</span>
            </div>
            <p className="mt-4 text-xs text-nquoc-muted italic">Mục tiêu quý: Giảm xuống dưới 10%</p>
          </div>
        </div>

        {/* Trend chart */}
        <div className="bg-white rounded-[32px] border border-nquoc-border p-8 shadow-sm">
          <h3 className="text-base font-bold text-nquoc-text font-header mb-6">Xu hướng giao tiếp toàn tổ chức</h3>
          <div className="h-[300px]">
            <LineChart 
              labels={trendLabels} 
              datasets={[{
                label: 'Trung bình Directness',
                data: trendValues,
                color: '#3b82f6',
                fill: true
              }]}
              max={10}
            />
          </div>
        </div>

        {/* Members needing attention */}
        <div className="bg-white rounded-[32px] border border-nquoc-border overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-nquoc-border">
            <h3 className="text-base font-bold text-nquoc-text font-header">Nhân sự cần hỗ trợ giao tiếp</h3>
            <p className="text-xs text-nquoc-muted mt-1 uppercase tracking-tight font-medium">Dựa trên xu hướng giảm trong 14 ngày gần nhất</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] text-nquoc-muted font-bold uppercase tracking-wider border-b border-nquoc-border">
                  <th className="text-left px-8 py-4">Thành viên</th>
                  <th className="text-left px-6 py-4 text-center">Điểm hiện tại</th>
                  <th className="text-left px-6 py-4 text-center">Xu hướng</th>
                  <th className="text-right px-8 py-4">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nquoc-border">
                {data.members_needing_attention.map((m) => (
                  <tr key={m.user_id} className="hover:bg-nquoc-bg transition-colors group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-nquoc-blue flex items-center justify-center text-white text-xs font-bold">
                          {m.name.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-nquoc-text">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-bold text-nquoc-text">{m.directness_score.toFixed(1)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.trend === 'down' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                        {m.trend === 'down' ? '⚖ GIẢM MẠNH' : '〰 BIẾN ĐỘNG'}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button className="text-xs font-bold text-nquoc-blue border border-blue-200 px-4 py-2 rounded-xl hover:bg-nquoc-blue hover:text-white transition-all duration-200 shadow-sm shadow-blue-50 active:scale-95">
                        Gửi bài luyện tập
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
