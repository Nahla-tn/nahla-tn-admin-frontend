'use client';

import { useCallback, useEffect, useState } from 'react';
import NahlaMap from '@/components/maps/NahlaMap';
import { DashboardHeatmapMap } from '@/features/dashboard/components/DashboardHeatmapMap';
import { DashboardHeatmapResponse } from '@/features/dashboard/types/dashboard.types';
import { mapsService } from '../services/maps.service';
import {
  CreateZonePayload,
  MapUser,
  NdviZone,
  UpdateZonePayload,
} from '../types/map.types';
import { useI18n } from '@/lib/hooks/useI18n';
import {
  Map,
  Activity,
  Layers,
  Users,
  MapPin,
  AlertCircle,
  Loader2,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { exportToCsv } from '@/lib/utils/exportCsv';

type MapTab = 'ndvi' | 'activity';

const TAB_CONFIG: Record<MapTab, {
  icon: React.ElementType;
  gradient: string;
  badge: string;
  borderActive: string;
}> = {
  ndvi: {
    icon: Layers,
    gradient: 'from-emerald-500 to-teal-600',
    badge: 'bg-emerald-100 text-emerald-700',
    borderActive: 'border-emerald-300',
  },
  activity: {
    icon: Activity,
    gradient: 'from-amber-500 to-orange-600',
    badge: 'bg-amber-100 text-amber-700',
    borderActive: 'border-amber-300',
  },
};

function MapLoadingCard({ label }: { label: string }) {
  return (
    <div className="flex min-h-[480px] flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-2xl bg-emerald-400/15" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md text-2xl">
          🗺️
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
        <Loader2 size={15} className="animate-spin text-emerald-500" />
        {label}
      </div>
    </div>
  );
}

function MapErrorCard({ message }: { message: string }) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">
        <AlertCircle size={22} />
      </div>
      <p className="text-sm font-semibold text-rose-700">{message}</p>
    </div>
  );
}

export default function MapsToolboxView() {
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState<MapTab>('ndvi');
  const [users, setUsers] = useState<MapUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [zones, setZones] = useState<NdviZone[]>([]);
  const [loadingZones, setLoadingZones] = useState(false);
  const [zonesError, setZonesError] = useState<string | null>(null);
  const [heatmap, setHeatmap] = useState<DashboardHeatmapResponse | null>(null);
  const [loadingHeatmap, setLoadingHeatmap] = useState(false);
  const [heatmapError, setHeatmapError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      setUsersError(null);
      const data = await mapsService.getUsersForMap();
      setUsers(data);
    } catch {
      setUsersError(t('maps.loadUsersError'));
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, [t]);

  const loadZones = useCallback(async () => {
    try {
      setLoadingZones(true);
      setZonesError(null);
      const data = await mapsService.getZones();
      setZones(data);
    } catch {
      setZonesError(t('maps.loadZonesError'));
      setZones([]);
    } finally {
      setLoadingZones(false);
    }
  }, [t]);

  const loadHeatmap = useCallback(async () => {
    try {
      setLoadingHeatmap(true);
      setHeatmapError(null);
      const data = await mapsService.getActivityHeatmap();
      setHeatmap(data);
    } catch {
      setHeatmapError(t('maps.loadHeatmapError'));
    } finally {
      setLoadingHeatmap(false);
    }
  }, [t]);

  useEffect(() => {
    loadUsers();
    loadZones();
    loadHeatmap();
  }, [loadUsers, loadZones, loadHeatmap]);

  const handleCreateZone = async (payload: CreateZonePayload) => {
    const created = await mapsService.createZone(payload);
    setZones((prev) => [created, ...prev]);
    return created;
  };

  const handleUpdateZone = async (id: string, payload: UpdateZonePayload) => {
    const updated = await mapsService.updateZone(id, payload);
    setZones((prev) => prev.map((z) => (z._id === id ? updated : z)));
    return updated;
  };

  const tabs: MapTab[] = ['ndvi', 'activity'];

  return (
    <div className="space-y-7 p-5 sm:p-7 lg:p-9 animate-fade-in">

      {/* ─── Hero Header ─────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50 via-white to-teal-50/40 p-7 shadow-sm sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-teal-200/20 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-100/80 px-3 py-1 text-xs font-bold text-emerald-800">
              <Map size={12} />
              SIG / Cartographie
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              {t('maps.title')}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 sm:text-base max-w-2xl">
              {t('maps.subtitle')}
            </p>
          </div>

          {/* Live stat badges */}
          <div className="flex flex-wrap gap-3 shrink-0">
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 shadow-xs">
              <MapPin size={14} className="text-emerald-600" />
              <span className="text-xs font-bold text-slate-700">
                {zones.length} zones
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-3 py-2 shadow-xs">
              <Users size={14} className="text-amber-600" />
              <span className="text-xs font-bold text-slate-700">
                {users.length} {t('common.users')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Tab Switcher ────────────────────────────────── */}
      <section className="nahla-card p-4 animate-fade-in-up" style={{ animationDelay: '80ms' }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            {tabs.map((tab) => {
              const cfg = TAB_CONFIG[tab];
              const Icon = cfg.icon;
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all duration-200 active:scale-[0.97]',
                    isActive
                      ? `bg-gradient-to-r ${cfg.gradient} ${cfg.borderActive} text-white shadow-md`
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
                  )}
                >
                  <Icon size={15} />
                  {tab === 'ndvi' ? t('maps.ndviZonesTab') : t('maps.activityHeatmapTab')}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const exportData = zones.map((z) => ({
                  name: z.name || (z as any).label || 'Zone',
                  governorate: z.region || (z as any).governorate || 'Tunisie',
                  finalScore: (z as any).finalScore ?? (z as any).score ?? 0,
                  ndviScore: z.ndviScore ?? 0,
                  rainfallScore: (z as any).rainfallScore ?? 0,
                  dominantPlant: (z as any).dominantPlant || '-',
                  latitude: (z as any).latitude ?? z.lat,
                  longitude: (z as any).longitude ?? z.lng,
                  recommendationCategory: (z as any).recommendationCategory || z.type || '-',
                }));
                exportToCsv(
                  'zones_apicoles_nahla',
                  [
                    { label: 'Nom de Zone', key: 'name' },
                    { label: 'Gouvernorat', key: 'governorate' },
                    { label: 'Score Apicole (finalScore)', key: 'finalScore' },
                    { label: 'Score NDVI (ndviScore)', key: 'ndviScore' },
                    { label: 'Score Précipitations', key: 'rainfallScore' },
                    { label: 'Plante Dominante', key: 'dominantPlant' },
                    { label: 'Latitude', key: 'latitude' },
                    { label: 'Longitude', key: 'longitude' },
                    { label: 'Recommandation', key: 'recommendationCategory' },
                  ],
                  exportData,
                );
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Download size={14} />
              Exporter Zones (CSV)
            </button>
            <p className="text-xs text-slate-400 italic hidden sm:block">{t('maps.tabsHelp')}</p>
          </div>
        </div>
      </section>

      {/* ─── NDVI Zones Map ──────────────────────────────── */}
      {activeTab === 'ndvi' && (
        <section className="animate-scale-in" style={{ animationDelay: '120ms' }}>
          {(loadingUsers || loadingZones) && (
            <MapLoadingCard label={t('maps.loadingMapData')} />
          )}
          {(usersError || zonesError) && (
            <MapErrorCard message={usersError || zonesError || ''} />
          )}
          {!loadingUsers && !loadingZones && !usersError && !zonesError && (
            <div className="overflow-hidden rounded-3xl border border-slate-200/80 shadow-md">
              <NahlaMap
                users={users}
                zones={zones}
                onCreateZone={handleCreateZone}
                onUpdateZone={handleUpdateZone}
              />
            </div>
          )}
        </section>
      )}

      {/* ─── Activity Heatmap ────────────────────────────── */}
      {activeTab === 'activity' && (
        <section className="animate-scale-in" style={{ animationDelay: '120ms' }}>
          {loadingHeatmap && (
            <MapLoadingCard label={t('maps.loadingHeatmap')} />
          )}
          {heatmapError && (
            <MapErrorCard message={heatmapError} />
          )}
          {!loadingHeatmap && !heatmapError && heatmap && (
            <div className="overflow-hidden rounded-3xl border border-slate-200/80 shadow-md">
              <DashboardHeatmapMap points={heatmap.points} />
            </div>
          )}
        </section>
      )}
    </div>
  );
}