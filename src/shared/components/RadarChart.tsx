import {
  RadarChart as ReRadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface RadarChartProps {
  labels: string[]
  data: number[]
  label?: string
  color?: string
  max?: number
}

export function RadarChart({ labels, data, label = 'Chỉ số', color = '#e53e3e', max = 10 }: RadarChartProps) {
  const chartData = labels.map((name, i) => ({
    subject: name,
    value: data[i] ?? 0,
    fullMark: max,
  }))

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={240}>
      <ReRadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
        <PolarGrid
          stroke="#f0f0f0"
          strokeWidth={1}
        />
        <PolarAngleAxis
          dataKey="subject"
          tick={{
            fill: '#5a6a85',
            fontSize: 11,
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 600,
          }}
        />
        <Radar
          name={label}
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.12}
          strokeWidth={2}
          dot={{ r: 3, fill: color, strokeWidth: 0 }}
          activeDot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#fff' }}
          isAnimationActive={false}
        />
        <Tooltip
          formatter={(v: any) => [`${v} / ${max}`, label]}
          contentStyle={{
            background: '#1a1a2e',
            border: 'none',
            borderRadius: 8,
            fontSize: 12,
            color: '#fff',
            fontFamily: 'Manrope, sans-serif',
          }}
          itemStyle={{ color: '#fff' }}
          labelStyle={{ color: '#94a3b8', fontSize: 11 }}
        />
      </ReRadarChart>
    </ResponsiveContainer>
  )
}
