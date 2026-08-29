'use client';

import { Bar } from 'react-chartjs-2';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { ActiveUsersByRegionItem } from '../types/dashboard.types';
import { useI18n } from '@/lib/hooks/useI18n';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type Props = {
  regions: ActiveUsersByRegionItem[];
};

export function ActiveUsersRegionBarChart({ regions }: Props) {
  const { t } = useI18n();

  const data = {
    labels: regions.map((item) => item.region),
    datasets: [
      {
        label: t('dashboard.activeUsersLegend'),
        data: regions.map((item) => item.count),
        backgroundColor: '#f59e0b',
        hoverBackgroundColor: '#ea580c',
        borderRadius: 8,
        maxBarThickness: 42,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
          font: { size: 12, weight: 'bold' as const },
          color: '#475569',
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        cornerRadius: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 12 } },
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { color: '#94a3b8', font: { size: 12 } },
      },
    },
  };

  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm sm:p-7">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
          {t('dashboard.geographyBadge')}
        </p>
        <h2 className="mt-1 text-xl font-black text-slate-900">
          {t('dashboard.activeUsersByRegion')}
        </h2>
      </div>

      {regions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center">
          <p className="text-sm font-medium text-slate-500">
            {t('dashboard.noActiveUsersByRegion')}
          </p>
        </div>
      ) : (
        <Bar data={data} options={options} />
      )}
    </div>
  );
}