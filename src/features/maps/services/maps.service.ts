import api from '@/lib/api/axios';
import { DashboardHeatmapResponse } from '@/features/dashboard/types/dashboard.types';
import {
  CreateZonePayload,
  MapUser,
  NdviZone,
  UpdateZonePayload,
} from '../types/map.types';

export const mapsService = {
  async getUsersForMap(): Promise<MapUser[]> {
    const response = await api.get<DashboardHeatmapResponse>('/dashboard/heatmap');
    const raw = response.data?.points || [];
    return raw.map((u: any) => ({
      ...u,
      _id: u._id || u.id,
      name: u.name || `${u.prenom || ''} ${u.nom || ''}`.trim() || u.nom || 'Utilisateur',
      latitude: u.latitude ?? u.location?.coordinates?.[1],
      longitude: u.longitude ?? u.location?.coordinates?.[0],
    }));
  },

  async getZones(): Promise<NdviZone[]> {
    const response = await api.get('/zones');
    const raw = Array.isArray(response.data) ? response.data : [];
    return raw.map((z: any) => ({
      ...z,
      label: z.name || z.label || 'Zone',
      name: z.name || z.label || 'Zone',
      lat: z.lat ?? z.latitude ?? z.location?.coordinates?.[1] ?? z.coordinates?.lat ?? 36.8,
      lng: z.lng ?? z.longitude ?? z.location?.coordinates?.[0] ?? z.coordinates?.lng ?? 10.2,
      ndviScore: z.ndviScore ?? z.score ?? 0,
      type: z.type || (z.score >= 70 ? 'OPTIMAL' : z.score >= 40 ? 'EAU' : 'RISQUE'),
      region: z.region || 'Tunisie',
      hiveCount: z.hiveCount ?? 0,
      description: z.description || '',
    }));
  },

  async createZone(payload: CreateZonePayload): Promise<NdviZone> {
    const formatted = {
      ...payload,
      name: (payload as any).name || payload.label,
    };
    const response = await api.post('/zones', formatted);
    return response.data;
  },

  async updateZone(id: string, payload: UpdateZonePayload): Promise<NdviZone> {
    const formatted = {
      ...payload,
      name: (payload as any).name || payload.label,
    };
    const response = await api.put(`/zones/${id}`, formatted);
    return response.data;
  },

  async getActivityHeatmap() {
    const response = await api.get<DashboardHeatmapResponse>('/dashboard/heatmap');
    return response.data;
  },
};