'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { DailyStatItem } from '../types/dashboard.types';
import { useI18n } from '@/lib/hooks/useI18n';

type Props = {
  data: DailyStatItem[];
};

function formatLabel(dateKey: string) {
  const date = new Date(dateKey);
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

export default function SubscriptionTrendChart({ data }: Props) {
  const { t } = useI18n();

  const chartData = data.map((item) => ({
    ...item,
    label: formatLabel(item.dateKey),
  }));

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-widest text-orange-500">
          {t('dashboard.trendPeriod')}
        </p>
        <h3 className="mt-1 text-2xl font-black text-slate-900">
          {t('dashboard.trendTitle')}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {t('dashboard.trendSubtitle')}
        </p>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 25px rgba(15, 23, 42, 0.08)',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="freeUsers"
              name={t('dashboard.freeUsers')}
              stroke="#94a3b8"
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="plusUsers"
              name={t('dashboard.plusUsers')}
              stroke="#3b82f6"
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="premiumUsers"
              name={t('dashboard.premiumUsers')}
              stroke="#f59e0b"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}