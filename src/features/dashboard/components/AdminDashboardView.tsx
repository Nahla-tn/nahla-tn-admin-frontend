'use client';

import { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboard.service';
import {
  ActiveUsersByRegionItem,
  DashboardHeatmapResponse,
  DashboardSummary,
  SubscriptionChartResponse,
  DailyStatItem,
  DailyStatsResponse,
} from '../types/dashboard.types';
import { AdminKpiCard } from './AdminKpiCard';
import SubscriptionDoughnutChart from './SubscriptionDoughnutChart';
import { ActiveUsersRegionBarChart } from './ActiveUsersRegionBarChart';
import { DashboardHeatmapMap } from './DashboardHeatmapMap';
import SubscriptionTrendChart from './SubscriptionTrendChart';
import { useI18n } from '@/lib/hooks/useI18n';
import FloatingBee from '@/components/ui/FloatingBee';
import {
  Users,
  UserCheck,
  Crown,
  TrendingUp,
  UserMinus,
  Star,
  BarChart3,
  Activity,
  Zap,
  RefreshCw,
} from 'lucide-react';

function HoneycombBg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.035]">
      <svg className="absolute h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dash-hex" width="48" height="83" patternUnits="userSpaceOnUse">
            <path
              d="M24 0 L48 14v28L24 56 0 42V14z M0 56 L24 42 M24 56 L48 42"
              fill="none"
              stroke="#d97706"
              strokeWidth="0.8"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dash-hex)" />
      </svg>
    </div>
  );
}

function LoadingPulse({ label }: { label: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-3xl bg-amber-400/20" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25">
          <span className="text-2xl">🐝</span>
        </div>
      </div>
      <div className="flex gap-1.5">
        <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400 [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-amber-500 [animation-delay:100ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-orange-500 [animation-delay:200ms]" />
      </div>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
    </div>
  );
}

export default function AdminDashboardView() {
  const { t } = useI18n();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [subscriptionChart, setSubscriptionChart] = useState<SubscriptionChartResponse | null>(null);
  const [regions, setRegions] = useState<ActiveUsersByRegionItem[]>([]);
  const [heatmap, setHeatmap] = useState<DashboardHeatmapResponse | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStatItem[]>([]);
  const [dailyStatsLoading, setDailyStatsLoading] = useState(true);
  const [dailyStatsError, setDailyStatsError] = useState<string | null>(null);
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
      setError(t('dashboard.loadError'));
    } finally {
      setLoading(false);
    }
  }

  async function loadDailyStats() {
    try {
      setDailyStatsLoading(true);
      setDailyStatsError(null);
      const response: DailyStatsResponse = await dashboardService.getDailyStats(30);
      setDailyStats(Array.isArray(response.raw) ? response.raw : []);
    } catch {
      setDailyStatsError(t('dashboard.trendError'));
      setDailyStats([]);
    } finally {
      setDailyStatsLoading(false);
    }
  }

  async function handleInitDailyStats() {
    try {
      await dashboardService.initDailyStats();
      await loadDailyStats();
    } catch {
      setDailyStatsError(t('dashboard.initSnapshotError'));
    }
  }

  useEffect(() => {
    loadDashboardData();
    loadDailyStats();
  }, []);

  if (loading) {
    return <LoadingPulse label={t('dashboard.loading')} />;
  }

  if (error || !summary || !subscriptionChart || !heatmap) {
    return (
      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <Zap size={18} />
          </div>
          <p className="text-sm font-semibold text-rose-700">{error || t('common.error')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-5 sm:p-7 lg:p-9 animate-fade-in">

      {/* ─── Hero Header ─────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-amber-200/50 bg-gradient-to-br from-amber-50 via-white to-emerald-50/40 p-7 shadow-sm sm:p-10">
        <HoneycombBg />

        {/* Decorative blurs */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/4 h-48 w-48 rounded-full bg-emerald-300/15 blur-3xl" />

        {/* Bee mascot */}
        <FloatingBee />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-100/80 px-3 py-1 text-xs font-bold text-amber-800 shadow-xs backdrop-blur-sm">
              <Activity size={12} className="text-amber-600" />
              {t('dashboard.overviewBadge')}
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              {t('dashboard.title')}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
              {t('dashboard.subtitle')}
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboardData}
            className="nahla-secondary-btn shrink-0"
          >
            <RefreshCw size={15} />
            Actualiser
          </button>
        </div>
      </section>

      {/* ─── Primary KPIs ────────────────────────────────── */}
      <section>
        <p className="nahla-section-label mb-4">{t('dashboard.keyMetrics')}</p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminKpiCard
            title={t('dashboard.totalUsers')}
            value={summary.totalUsers}
            description={t('dashboard.totalUsersDesc')}
            tone="slate"
            icon={<Users size={18} />}
            delay={0}
          />
          <AdminKpiCard
            title={t('dashboard.activeUsers')}
            value={summary.activeUsers}
            description={t('dashboard.activeUsersDesc')}
            tone="emerald"
            icon={<UserCheck size={18} />}
            delay={80}
          />
          <AdminKpiCard
            title={t('dashboard.premiumUsers')}
            value={summary.premiumUsers}
            description={t('dashboard.premiumUsersDesc')}
            tone="amber"
            icon={<Crown size={18} />}
            delay={160}
          />
          <AdminKpiCard
            title={t('dashboard.freeToPremium')}
            value={`${summary.freeToPremiumConversionRate}%`}
            description={t('dashboard.freeToPremiumDesc')}
            tone="sky"
            icon={<TrendingUp size={18} />}
            delay={240}
          />
        </div>
      </section>

      {/* ─── Secondary KPIs ──────────────────────────────── */}
      <section>
        <p className="nahla-section-label mb-4">{t('dashboard.breakdown')}</p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminKpiCard
            title={t('dashboard.freeUsers')}
            value={summary.freeUsers}
            tone="slate"
            icon={<Users size={18} />}
            delay={0}
          />
          <AdminKpiCard
            title={t('dashboard.plusUsers')}
            value={summary.plusUsers}
            tone="sky"
            icon={<Star size={18} />}
            delay={80}
          />
          <AdminKpiCard
            title={t('dashboard.blockedUsers')}
            value={summary.blockedUsers}
            tone="rose"
            icon={<UserMinus size={18} />}
            delay={160}
          />
          <AdminKpiCard
            title={t('dashboard.premiumRate')}
            value={`${summary.premiumRateFromTotal}%`}
            description={t('dashboard.premiumRateDesc')}
            tone="amber"
            icon={<BarChart3 size={18} />}
            delay={240}
          />
        </div>
      </section>

      {/* ─── Distribution Charts ─────────────────────────── */}
      <section className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <p className="nahla-section-label mb-4">{t('dashboard.distribution')}</p>
        <div className="grid gap-6 lg:grid-cols-2">
          <SubscriptionDoughnutChart chartData={subscriptionChart} />
          <ActiveUsersRegionBarChart regions={regions} />
        </div>
      </section>

      {/* ─── Daily Trend ─────────────────────────────────── */}
      <section className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <p className="nahla-section-label mb-4">{t('dashboard.trendSection')}</p>

        {dailyStatsLoading && (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400 [animation-delay:0ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-amber-500 [animation-delay:100ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-orange-500 [animation-delay:200ms]" />
            </div>
            <p className="text-sm font-medium text-slate-500">{t('dashboard.trendLoading')}</p>
          </div>
        )}

        {dailyStatsError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-medium text-rose-700">
            {dailyStatsError}
          </div>
        )}

        {!dailyStatsLoading && !dailyStatsError && dailyStats.length > 0 && (
          <SubscriptionTrendChart data={dailyStats} />
        )}

        {!dailyStatsLoading && !dailyStatsError && dailyStats.length === 0 && (
          <div className="relative overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-8 shadow-sm">
            <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-amber-200/40 blur-2xl" />
            <div className="relative">
              <p className="text-lg font-black text-amber-900">{t('dashboard.noDailyStats')}</p>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-amber-700">
                {t('dashboard.noDailyStatsDesc')}
              </p>
              <button
                type="button"
                onClick={handleInitDailyStats}
                className="nahla-primary-btn mt-5"
              >
                {t('dashboard.initSnapshot')}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ─── Activity Heatmap ────────────────────────────── */}
      <section className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <p className="nahla-section-label mb-4">{t('dashboard.activityMap')}</p>
        <DashboardHeatmapMap points={heatmap.points} />
      </section>
    </div>
  );
}