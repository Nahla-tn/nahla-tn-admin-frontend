import api from '@/lib/api/axios';
import {
  ActiveUsersByRegionItem,
  DashboardHeatmapResponse,
  DashboardSummary,
  SubscriptionChartResponse,
  DailyStatsResponse,
} from '../types/dashboard.types';

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const response = await api.get<DashboardSummary>('/dashboard/summary');
    return response.data;
  },

  async getSubscriptionChart(): Promise<SubscriptionChartResponse> {
    const response = await api.get<SubscriptionChartResponse>(
      '/dashboard/subscriptions-chart',
    );
    return response.data;
  },

  async getActiveUsersByRegion(): Promise<ActiveUsersByRegionItem[]> {
    const response = await api.get<ActiveUsersByRegionItem[]>(
      '/dashboard/active-users-by-region',
    );
    return response.data;
  },

  async getHeatmap(): Promise<DashboardHeatmapResponse> {
    const response = await api.get<DashboardHeatmapResponse>(
      '/dashboard/heatmap',
    );
    return response.data;
  },

  async getDailyStats(days = 30): Promise<DailyStatsResponse> {
    const response = await api.get<DailyStatsResponse>(
      `/dashboard/daily-stats?days=${days}`,
    );
    return response.data;
  },

  async initDailyStats() {
    const response = await api.get('/dashboard/daily-stats/init');
    return response.data;
  },
};