'use client';

import { Doughnut } from 'react-chartjs-2';
import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
} from 'chart.js';
import { SubscriptionChartResponse } from '../types/dashboard.types';
import { useI18n } from '@/lib/hooks/useI18n';

ChartJS.register(ArcElement, Tooltip, Legend);

type Props = {
  chartData: SubscriptionChartResponse;
};

export default function SubscriptionDoughnutChart({ chartData }: Props) {
  const { t } = useI18n();

  const localizedLabels = [
    t('dashboard.freeLegend'),
    t('dashboard.plusLegend'),
    t('dashboard.premiumLegend'),
  ];

  const data = {
    labels: localizedLabels,
    datasets: [
      {
        label: t('dashboard.subscriptionsChart'),
        data: chartData.data,
        backgroundColor: ['#facc15', '#38bdf8', '#22c55e'],
        borderColor: ['#eab308', '#0ea5e9', '#16a34a'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-black uppercase tracking-widest text-orange-500">
        {t('dashboard.distributionBadge')}
      </p>

      <h2 className="mt-1 mb-4 text-2xl font-black text-slate-900">
        {t('dashboard.subscriptionsChart')}
      </h2>

      <div className="mx-auto max-w-[320px]">
        <Doughnut data={data} />
      </div>
    </div>
  );
}