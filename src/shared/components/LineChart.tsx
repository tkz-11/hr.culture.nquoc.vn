import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LineChartProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
    fill?: boolean;
  }[];
  min?: number;
  max?: number;
}

export function LineChart({ labels, datasets, min = 0, max = 10 }: LineChartProps) {
  const chartData = {
    labels,
    datasets: datasets.map((ds) => ({
      label: ds.label,
      data: ds.data,
      borderColor: ds.color || '#3b82f6',
      backgroundColor: ds.fill ? `${ds.color || '#3b82f6'}22` : 'transparent',
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: ds.color || '#3b82f6',
      pointBorderColor: '#fff',
      tension: 0.4, // Smooth lines
      fill: ds.fill,
    })),
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        min,
        max,
        grid: {
          color: '#f1f5f9',
        },
        ticks: {
          font: { size: 10, family: "'Manrope', sans-serif" },
          color: '#94a3b8',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 10, family: "'Manrope', sans-serif" },
          color: '#94a3b8',
        },
      },
    },
    plugins: {
      legend: {
        display: datasets.length > 1,
        position: 'top' as const,
        labels: {
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true,
          font: { size: 10, family: "'Manrope', sans-serif", weight: 'bold' },
          color: '#64748b',
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { size: 12, family: "'Manrope', sans-serif" },
        bodyFont: { size: 12, family: "'Manrope', sans-serif" },
        padding: 10,
        cornerRadius: 8,
      },
    },
  };

  return (
    <div className="w-full h-full min-h-[200px]">
      <Line data={chartData} options={options} />
    </div>
  );
}
