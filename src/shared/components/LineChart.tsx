import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from 'recharts'

interface Dataset {
  label: string
  data: number[]
  color?: string
  fill?: boolean
}

interface LineChartProps {
  labels: string[]
  datasets: Dataset[]
  min?: number
  max?: number
}

export function LineChart({ labels, datasets, min = 0, max = 10 }: LineChartProps) {
  const chartData = labels.map((label, i) => {
    const point: Record<string, string | number> = { name: label }
    datasets.forEach((ds) => { point[ds.label] = ds.data[i] ?? 0 })
    return point
  })

  const hasFill = datasets.some((d) => d.fill)

  if (hasFill && datasets.length === 1) {
    const ds = datasets[0]
    const color = ds.color ?? '#e53e3e'
    return (
      <ResponsiveContainer width="100%" height="100%" minHeight={120}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color} stopOpacity={0.15} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'Manrope' }} axisLine={false} tickLine={false} />
          <YAxis domain={[min, max]} tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'Manrope' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#1a1a2e', border: 'none', borderRadius: 8, fontSize: 12, color: '#fff', fontFamily: 'Manrope' }}
            itemStyle={{ color: '#fff' }}
            labelStyle={{ color: '#94a3b8', fontSize: 11 }}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey={ds.label}
            stroke={color}
            strokeWidth={2}
            fill={`url(#grad-${color.replace('#', '')})`}
            dot={false}
            activeDot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#fff' }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={120}>
      <ReLineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'Manrope' }} axisLine={false} tickLine={false} />
        <YAxis domain={[min, max]} tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'Manrope' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#1a1a2e', border: 'none', borderRadius: 8, fontSize: 12, color: '#fff', fontFamily: 'Manrope' }}
          itemStyle={{ color: '#fff' }}
          labelStyle={{ color: '#94a3b8', fontSize: 11 }}
          isAnimationActive={false}
        />
        {datasets.length > 1 && (
          <Legend
            wrapperStyle={{ fontSize: 11, fontFamily: 'Manrope', fontWeight: 600, color: '#5a6a85' }}
            iconType="circle"
            iconSize={8}
          />
        )}
        {datasets.map((ds) => (
          <Line
            key={ds.label}
            type="monotone"
            dataKey={ds.label}
            stroke={ds.color ?? '#e53e3e'}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: ds.color ?? '#e53e3e', strokeWidth: 2, stroke: '#fff' }}
            isAnimationActive={false}
          />
        ))}
      </ReLineChart>
    </ResponsiveContainer>
  )
}
