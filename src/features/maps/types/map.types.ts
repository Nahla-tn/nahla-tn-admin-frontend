export interface MapUser {
  _id: string;
  name: string;
  email: string;
  region: string;
  latitude?: number;
  longitude?: number;
  subscriptionPlan?: 'FREE' | 'PLUS' | 'PREMIUM';
}

export interface PaginatedMapUsersResponse {
  data: MapUser[];
  total: number;
  page: number;
  lastPage: number;
}

export type ZoneStatus = 'OPTIMAL' | 'RISQUE' | 'EAU';

export interface NdviZone {
  _id: string;
  name?: string;
  label: string;
  type: ZoneStatus;
  region: string;
  ndviScore: number;
  hiveCount: number;
  description: string;
  lat: number;
  lng: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateZonePayload {
  label: string;
  type: ZoneStatus;
  region: string;
  ndviScore: number;
  hiveCount: number;
  description: string;
  latitude: number;
  longitude: number;
}

export interface UpdateZonePayload {
  label?: string;
  type?: ZoneStatus;
  region?: string;
  ndviScore?: number;
  hiveCount?: number;
  description?: string;
  latitude?: number;
  longitude?: number;
}