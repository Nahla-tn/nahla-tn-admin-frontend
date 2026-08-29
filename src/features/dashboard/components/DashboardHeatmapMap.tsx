'use client';

import dynamic from 'next/dynamic';
import { HeatmapPoint } from '../types/dashboard.types';

const DashboardHeatmapMapClient = dynamic(
  () => import('./DashboardHeatmapMapClient'),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200/70 bg-white p-10 shadow-sm">
        <span className="flex gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-orange-400 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-orange-400 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-orange-400" />
        </span>
        <p className="text-sm font-medium text-slate-500">Loading map...</p>
      </div>
    ),
  },
);

type Props = {
  points: HeatmapPoint[];
};

export function DashboardHeatmapMap({ points }: Props) {
  return <DashboardHeatmapMapClient points={points} />;
}