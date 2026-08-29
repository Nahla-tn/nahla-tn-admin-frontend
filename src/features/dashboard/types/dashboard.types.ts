export type DashboardSummary = {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  freeUsers: number;
  plusUsers: number;
  premiumUsers: number;
  freeToPremiumConversionRate: number;
  premiumRateFromTotal: number;
};

export type SubscriptionChartResponse = {
  labels: string[];
  data: number[];
  raw: {
    FREE: number;
    PLUS: number;
    PREMIUM: number;
  };
};

export type ActiveUsersByRegionItem = {
  region: string;
  count: number;
};
export type HeatmapPoint = {
  id: string;
  _id?: string;
  name: string;
  email: string;
  region?: string;
  telephone?: string;
  phone?: string;
  role?: string;
  status?: string;
  subscriptionPlan?: string;
  latitude: number;
  longitude: number;
  intensity: number;
};

export type DashboardHeatmapResponse = {
  total: number;
  points: HeatmapPoint[];
  geoJson: {
    type: 'FeatureCollection';
    features: unknown[];
  };
};
export interface DailyStatItem {
  _id?: string;
  dateKey: string;
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  freeUsers: number;
  plusUsers: number;
  premiumUsers: number;
  createdAt?: string;
  updatedAt?: string;
}
export interface DailyStatsResponse {
  days: number;
  labels: string[];
  datasets: {
    totalUsers: number[];
    freeUsers: number[];
    plusUsers: number[];
    premiumUsers: number[];
    activeUsers: number[];
    blockedUsers: number[];
  };
  raw: DailyStatItem[];
}