import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type ChartOptions
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarChartProps {
  labels: string[];
  data: number[];
  label?: string;
  color?: string;
  max?: number;
}

export function RadarChart({ 
  labels, 
  data, 
  label = 'Chỉ số', 
  color = '#3b82f6', 
  max = 10 
}: RadarChartProps) {
  const chartData = {
    labels,
    datasets: [
      {
        label,
        data,
        backgroundColor: `${color}33`, // 20% opacity
        borderColor: color,
        borderWidth: 2,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: color,
      },
    ],
  };

  const options: ChartOptions<'radar'> = {
    scales: {
      r: {
        angleLines: {
          display: true,
          color: '#f1f5f9',
        },
        grid: {
          color: '#f1f5f9',
        },
        suggestedMin: 0,
        suggestedMax: max,
        ticks: {
          display: false,
          stepSize: max / 5,
        },
        pointLabels: {
          font: {
            size: 10,
            family: "'Manrope', sans-serif",
            weight: 'bold',
          },
          color: '#64748b',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { size: 12, family: "'Manrope', sans-serif" },
        bodyFont: { size: 12, family: "'Manrope', sans-serif" },
        padding: 10,
        cornerRadius: 8,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="w-full h-full min-h-[250px]">
      <Radar data={chartData} options={options} />
    </div>
  );
}
