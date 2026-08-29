'use client';

import { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboard.service';
import {
  ActiveUsersByRegionItem,
  DashboardHeatmapResponse,
  DashboardSummary,
  SubscriptionChartResponse,
} from '../types/dashboard.types';
import { AdminKpiCard } from './AdminKpiCard';
import SubscriptionDoughnutChart from './SubscriptionDoughnutChart';
import { ActiveUsersRegionBarChart } from './ActiveUsersRegionBarChart';
import { DashboardHeatmapMap } from './DashboardHeatmapMap';

export default function AdminDashboardView() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  const [subscriptionChart, setSubscriptionChart] =
    useState<SubscriptionChartResponse | null>(null);

  const [regions, setRegions] = useState<ActiveUsersByRegionItem[]>([]);

  const [heatmap, setHeatmap] = useState<DashboardHeatmapResponse | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboardData() {
    try {
      setLoading(true);
      setError(null);

      const [summaryData, subscriptionData, regionData, heatmapData] =
        await Promise.all([
          dashboardService.getSummary(),
          dashboardService.getSubscriptionChart(),
          dashboardService.getActiveUsersByRegion(),
          dashboardService.getHeatmap(),
        ]);

      setSummary(summaryData);
      setSubscriptionChart(subscriptionData);
      setRegions(regionData);
      setHeatmap(heatmapData);
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="nahla-page">
        <div className="nahla-empty-state">
          Loading dashboard data...
        </div>
      </div>
    );
  }

  if (error || !summary || !subscriptionChart || !heatmap) {
    return (
      <div className="nahla-page">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700">
          {error || 'Something went wrong.'}
        </div>
      </div>
    );
  }

  return (
    <div className="nahla-page">
      <section className="nahla-page-header">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
              Analytics overview
            </div>

            <h1 className="nahla-page-title">
              Admin Dashboard
            </h1>

            <p className="nahla-page-description max-w-2xl">
              Suivez l’activité des utilisateurs, les abonnements, le taux de
              conversion et les zones les plus actives dans l’écosystème Nahla.
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboardData}
            className="nahla-primary-btn w-fit"
          >
            Refresh dashboard
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminKpiCard
          title="Total users"
          value={summary.totalUsers}
          description="All registered users"
          tone="orange"
        />

        <AdminKpiCard
          title="Active users"
          value={summary.activeUsers}
          description="Users currently active"
          tone="green"
        />

        <AdminKpiCard
          title="Premium users"
          value={summary.premiumUsers}
          description="Subscribed to premium plan"
          tone="blue"
        />

        <AdminKpiCard
          title="Free to premium"
          value={`${summary.freeToPremiumConversionRate}%`}
          description="Conversion rate"
          tone="orange"
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminKpiCard
          title="Free users"
          value={summary.freeUsers}
          description="Free tier accounts"
          tone="slate"
        />

        <AdminKpiCard
          title="Plus users"
          value={summary.plusUsers}
          description="Plus subscription users"
          tone="blue"
        />

        <AdminKpiCard
          title="Blocked users"
          value={summary.blockedUsers}
          description="Manually blocked accounts"
          tone="red"
        />

        <AdminKpiCard
          title="Premium rate"
          value={`${summary.premiumRateFromTotal}%`}
          description="Premium users from total"
          tone="green"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <SubscriptionDoughnutChart chartData={subscriptionChart} />
        <ActiveUsersRegionBarChart regions={regions} />
      </section>

      <section>
        <DashboardHeatmapMap points={heatmap.points} />
      </section>
    </div>
  );
}