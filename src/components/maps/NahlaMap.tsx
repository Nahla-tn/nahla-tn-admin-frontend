'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Badge } from '@/components/ui/badge';
import {
  SUBSCRIPTION_PLAN_LABELS,
  SUBSCRIPTION_PLAN_STYLES,
} from '@/lib/constants/auth.constants';
import { useRouter } from 'next/navigation';
import {
  CreateZonePayload,
  MapUser,
  NdviZone,
  UpdateZonePayload,
  ZoneStatus,
} from '@/features/maps/types/map.types';
import { useI18n } from '@/lib/hooks/useI18n';

const customIcon = new L.Icon({
  iconUrl:
    'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

const currentLocationIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

function getZoneColor(type: ZoneStatus) {
  switch (type) {
    case 'OPTIMAL':
      return '#22c55e';
    case 'RISQUE':
      return '#ef4444';
    case 'EAU':
      return '#3b82f6';
    default:
      return '#6b7280';
  }
}

function MapClickHandler({
  enabled,
  onAddZone,
}: {
  enabled: boolean;
  onAddZone: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(event) {
      if (!enabled) return;
      onAddZone(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

function MapViewController({
  currentPosition,
}: {
  currentPosition: [number, number] | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (currentPosition) {
      map.flyTo(currentPosition, 11, {
        duration: 1.2,
      });
    }
  }, [currentPosition, map]);

  return null;
}

type NahlaMapProps = {
  users: MapUser[];
  zones: NdviZone[];
  onCreateZone: (payload: CreateZonePayload) => Promise<NdviZone>;
  onUpdateZone: (
    id: string,
    payload: UpdateZonePayload,
  ) => Promise<NdviZone>;
};

export default function NahlaMap({
  users,
  zones: propZones,
  onCreateZone,
  onUpdateZone,
}: NahlaMapProps) {
  const router = useRouter();
  const { t } = useI18n();

  const center: [number, number] = [36.8065, 10.1815];

  const [zones, setZones] = useState<NdviZone[]>(propZones);
  const [selectedZone, setSelectedZone] = useState<NdviZone | null>(null);
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [isPickingOnMap, setIsPickingOnMap] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [isSavingZone, setIsSavingZone] = useState(false);

  const [currentPosition, setCurrentPosition] = useState<
    [number, number] | null
  >(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    setZones(propZones);
  }, [propZones]);

  const totalVisibleUsers = useMemo(() => {
    return users.filter((user) => user.latitude && user.longitude).length;
  }, [users]);

  const getZoneLabel = (type: ZoneStatus) => {
    switch (type) {
      case 'OPTIMAL':
        return t('maps.ndviOptimal');
      case 'RISQUE':
        return t('maps.riskSaturated');
      case 'EAU':
        return t('maps.waterPoint');
      default:
        return type;
    }
  };

  const updateSelectedZone = (updatedZones: NdviZone[], zoneId: string) => {
    setZones(updatedZones);
    setSelectedZone(updatedZones.find((zone) => zone._id === zoneId) || null);
  };

  const handleZoneTypeChange = (newType: ZoneStatus) => {
    if (!selectedZone) return;

    const genericLabels = [
      'Nouvelle zone',
      'New zone',
      'NDVI Optimal',
      'Risque / Saturée',
      'Risk / Saturated',
      "Point d'eau",
      'Water point',
    ];

    const updatedZones = zones.map((zone) =>
      zone._id === selectedZone._id
        ? {
            ...zone,
            type: newType,
            label: genericLabels.includes(zone.label)
              ? getZoneLabel(newType)
              : zone.label,
          }
        : zone,
    );

    updateSelectedZone(updatedZones, selectedZone._id);
  };

  const handleScoreChange = (value: number) => {
    if (!selectedZone) return;

    const safeValue = Math.max(0, Math.min(1, value));

    const updatedZones = zones.map((zone) =>
      zone._id === selectedZone._id
        ? {
            ...zone,
            ndviScore: safeValue,
          }
        : zone,
    );

    updateSelectedZone(updatedZones, selectedZone._id);
  };

  const handleDescriptionChange = (value: string) => {
    if (!selectedZone) return;

    const updatedZones = zones.map((zone) =>
      zone._id === selectedZone._id
        ? {
            ...zone,
            description: value,
          }
        : zone,
    );

    updateSelectedZone(updatedZones, selectedZone._id);
  };

  const handleHiveCountChange = (value: number) => {
    if (!selectedZone) return;

    const safeValue = Math.max(0, value);

    const updatedZones = zones.map((zone) =>
      zone._id === selectedZone._id
        ? {
            ...zone,
            hiveCount: safeValue,
          }
        : zone,
    );

    updateSelectedZone(updatedZones, selectedZone._id);
  };

  const handleRegionChange = (value: string) => {
    if (!selectedZone) return;

    const updatedZones = zones.map((zone) =>
      zone._id === selectedZone._id
        ? {
            ...zone,
            region: value,
          }
        : zone,
    );

    updateSelectedZone(updatedZones, selectedZone._id);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(t('maps.geolocationNotSupported'));
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setCurrentPosition([lat, lng]);
        setIsLocating(false);
      },
      () => {
        setLocationError(t('maps.geolocationError'));
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  };

  const createZoneAtCoordinates = async (lat: number, lng: number) => {
    try {
      setIsSavingZone(true);

      const createdZone = await onCreateZone({
        label: t('maps.newZone'),
        type: 'OPTIMAL',
        region: t('maps.newZone'),
        ndviScore: 0.5,
        hiveCount: 0,
        description: t('maps.newZoneDescription'),
        latitude: lat,
        longitude: lng,
      });

      setZones((prev) => [createdZone, ...prev]);
      setSelectedZone(createdZone);
      setIsPanelCollapsed(false);
      setIsAddingZone(false);
      setIsPickingOnMap(false);
    } catch (error) {
      console.error('Failed to create zone:', error);
    } finally {
      setIsSavingZone(false);
    }
  };

  const handleAddZoneOnMap = async (lat: number, lng: number) => {
    await createZoneAtCoordinates(lat, lng);
  };

  const handleCreateZoneFromCurrentLocation = async () => {
    if (!currentPosition) {
      setLocationError(t('maps.needCurrentLocationFirst'));
      return;
    }

    await createZoneAtCoordinates(currentPosition[0], currentPosition[1]);
  };

  const handleSaveZone = async () => {
    if (!selectedZone) return;

    try {
      setIsSavingZone(true);

      const updated = await onUpdateZone(selectedZone._id, {
        label: selectedZone.name || selectedZone.label,
        type: selectedZone.type,
        region: selectedZone.region,
        ndviScore: selectedZone.ndviScore,
        hiveCount: selectedZone.hiveCount,
        description: selectedZone.description,
        latitude: selectedZone.lat,
        longitude: selectedZone.lng,
      });

      const updatedZones = zones.map((zone) =>
        zone._id === updated._id ? updated : zone,
      );

      updateSelectedZone(updatedZones, updated._id);
    } catch (error) {
      console.error('Failed to update zone:', error);
    } finally {
      setIsSavingZone(false);
    }
  };

  return (
    <div className="relative h-[680px] w-full overflow-hidden rounded-3xl border bg-gray-50 shadow-inner">
      {/* Legend */}
      <div className="absolute right-4 top-4 z-[1000] space-y-3 rounded-2xl border border-white bg-white/90 p-4 shadow-xl backdrop-blur-md">
        <p className="mb-2 border-b pb-2 text-xs font-black uppercase tracking-widest text-gray-400">
          {t('maps.legend')}
        </p>

        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          <span className="text-sm font-bold text-gray-700">
            {t('maps.ndviOptimal')}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
          <span className="text-sm font-bold text-gray-700">
            {t('maps.riskSaturated')}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
          <span className="text-sm font-bold text-gray-700">
            {t('maps.waterPoint')}
          </span>
        </div>
      </div>

      {/* Stats + Actions */}
      <div className="absolute left-4 top-4 z-[1000] w-[300px] rounded-2xl border border-white bg-white/90 p-4 shadow-xl backdrop-blur-md">
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">
          {t('maps.mapPanel')}
        </p>

        <div className="mt-2 space-y-1 text-sm font-semibold text-slate-700">
          <p>
            {t('maps.ndviZonesCount')}: {zones.length}
          </p>
          <p>
            {t('maps.localizedBeekeepers')}: {totalVisibleUsers}
          </p>
          {currentPosition && (
            <p className="text-xs text-orange-700">
              {t('maps.currentPositionDetected')}
            </p>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={() => {
              setIsAddingZone((prev) => !prev);
              setIsPickingOnMap(false);
            }}
            className={`w-full rounded-xl px-4 py-2 text-sm font-bold transition ${
              isAddingZone
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {isAddingZone ? t('maps.cancelAddZone') : t('maps.addZone')}
          </button>

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="w-full rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-bold text-orange-700 transition hover:bg-orange-50 disabled:opacity-60"
          >
            {isLocating ? t('maps.locating') : t('maps.useCurrentLocation')}
          </button>

          {isAddingZone && (
            <div className="space-y-2 rounded-2xl border border-orange-100 bg-orange-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-orange-700">
                {t('maps.zoneCreation')}
              </p>

              <button
                type="button"
                onClick={() => {
                  setIsPickingOnMap(true);
                  setLocationError(null);
                }}
                className={`w-full rounded-xl px-4 py-2 text-sm font-bold transition ${
                  isPickingOnMap
                    ? 'bg-orange-600 text-white'
                    : 'bg-white text-orange-700 border border-orange-200 hover:bg-orange-100'
                }`}
              >
                {isPickingOnMap
                  ? t('maps.clickOnMapNow')
                  : t('maps.choosePointOnMap')}
              </button>

              <button
                type="button"
                onClick={handleCreateZoneFromCurrentLocation}
                disabled={!currentPosition || isSavingZone}
                className="w-full rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-bold text-orange-700 transition hover:bg-orange-100 disabled:opacity-50"
              >
                {isSavingZone
                  ? t('maps.creating')
                  : t('maps.createFromCurrentLocation')}
              </button>

              <p className="text-xs text-slate-600">
                {t('maps.createZoneHelp')}
              </p>
            </div>
          )}

          {locationError && (
            <p className="text-xs font-medium text-red-600">{locationError}</p>
          )}
        </div>
      </div>

      {/* Fiche synthèse */}
      {selectedZone && (
        <div
          className={`absolute bottom-4 left-4 z-[1000] rounded-3xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur-md transition-all duration-300 ${
            isPanelCollapsed
              ? 'w-[220px] p-3'
              : 'w-[360px] max-h-[75vh] overflow-y-auto p-5'
          }`}
        >
          {isPanelCollapsed ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  {t('maps.selectedZone')}
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {selectedZone.name || selectedZone.label}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPanelCollapsed(false)}
                  className="rounded-xl bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700 hover:bg-orange-200"
                >
                  {t('common.open')}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedZone(null);
                    setIsAddingZone(false);
                    setIsPickingOnMap(false);
                  }}
                  className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                    {t('maps.syntheticSheet')}
                  </p>
                  <h3 className="mt-1 text-xl font-black text-slate-900">
                    {selectedZone.name || selectedZone.label}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {selectedZone.region}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPanelCollapsed(true)}
                    className="rounded-xl bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700 hover:bg-orange-200"
                  >
                    {t('common.reduce')}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedZone(null);
                      setIsAddingZone(false);
                      setIsPickingOnMap(false);
                    }}
                    className="rounded-xl bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600 hover:bg-slate-200"
                  >
                    {t('common.close')}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-xs font-black uppercase text-slate-400">
                      {t('maps.ndviScore')}
                    </p>
                    <p className="mt-1 text-lg font-black text-slate-900">
                      {selectedZone.ndviScore}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-xs font-black uppercase text-slate-400">
                      {t('maps.hives')}
                    </p>
                    <p className="mt-1 text-lg font-black text-slate-900">
                      {selectedZone.hiveCount}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs font-black uppercase text-slate-400">
                    {t('maps.coordinates')}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {selectedZone.lat}, {selectedZone.lng}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs font-black uppercase text-slate-400">
                    {t('maps.lastUpdate')}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {selectedZone.updatedAt
                      ? new Date(selectedZone.updatedAt).toLocaleDateString()
                      : '-'}
                  </p>
                </div>

                <div className="space-y-3 rounded-2xl border border-orange-100 bg-orange-50 p-4">
                  <p className="text-sm font-black text-orange-800">
                    {t('maps.quickEdit')}
                  </p>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-orange-700">
                      {t('maps.label')}
                    </label>
                    <input
                      value={selectedZone.name || selectedZone.label}
                      onChange={(e) => {
                        const updatedZones = zones.map((zone) =>
                          zone._id === selectedZone._id
                            ? { ...zone, name: e.target.value, label: e.target.value }
                            : zone,
                        );
                        updateSelectedZone(updatedZones, selectedZone._id);
                      }}
                      className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-orange-700">
                      {t('maps.statusField')}
                    </label>
                    <select
                      value={selectedZone.type}
                      onChange={(e) =>
                        handleZoneTypeChange(e.target.value as ZoneStatus)
                      }
                      className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none"
                    >
                      <option value="OPTIMAL">{t('maps.ndviOptimal')}</option>
                      <option value="RISQUE">{t('maps.riskSaturated')}</option>
                      <option value="EAU">{t('maps.waterPoint')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-orange-700">
                      {t('maps.regionField')}
                    </label>
                    <input
                      value={selectedZone.region}
                      onChange={(e) => handleRegionChange(e.target.value)}
                      className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-orange-700">
                      {t('maps.ndviScore')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={selectedZone.ndviScore}
                      onChange={(e) =>
                        handleScoreChange(Number(e.target.value))
                      }
                      className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-orange-700">
                      {t('maps.hivesCount')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={selectedZone.hiveCount}
                      onChange={(e) =>
                        handleHiveCountChange(Number(e.target.value))
                      }
                      className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-orange-700">
                      {t('maps.descriptionField')}
                    </label>
                    <textarea
                      rows={3}
                      value={selectedZone.description}
                      onChange={(e) => handleDescriptionChange(e.target.value)}
                      className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveZone}
                    disabled={isSavingZone}
                    className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60"
                  >
                    {isSavingZone ? t('maps.saving') : t('maps.saveZone')}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <MapContainer
        center={center}
        zoom={8}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <MapViewController currentPosition={currentPosition} />
        <MapClickHandler
          enabled={isPickingOnMap}
          onAddZone={handleAddZoneOnMap}
        />

        {currentPosition && (
          <>
            <Marker position={currentPosition} icon={currentLocationIcon}>
              <Popup>
                <div className="text-sm font-semibold text-slate-800">
                  {t('maps.yourCurrentPosition')}
                </div>
              </Popup>
            </Marker>

            <CircleMarker
              center={currentPosition}
              radius={14}
              pathOptions={{
                fillColor: '#f97316',
                color: '#fff',
                weight: 2,
                fillOpacity: 0.35,
              }}
            />
          </>
        )}

        {users.map(
          (user) =>
            user.latitude &&
            user.longitude && (
              <Marker
                key={user._id}
                position={[user.latitude, user.longitude]}
                icon={customIcon}
              >
                <Popup>
                  <div className="min-w-[170px] space-y-3 p-2">
                    <div className="border-b pb-2">
                      <p className="text-base font-black text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs font-bold uppercase text-gray-400">
                        {user.region}
                      </p>
                    </div>

                    <Badge
                      className={`w-full justify-center ${
                        SUBSCRIPTION_PLAN_STYLES[
                          (user.subscriptionPlan as keyof typeof SUBSCRIPTION_PLAN_STYLES) ||
                            'FREE'
                        ]
                      }`}
                    >
                      {
                        SUBSCRIPTION_PLAN_LABELS[
                          (user.subscriptionPlan as keyof typeof SUBSCRIPTION_PLAN_LABELS) ||
                            'FREE'
                        ]
                      }
                    </Badge>

                    <button
                      onClick={() => router.push(`/users/${user._id}`)}
                      className="w-full rounded-xl bg-gray-900 py-2 text-xs font-bold text-white transition-all hover:bg-gray-800 active:scale-95"
                    >
                      {t('maps.viewProfile')}
                    </button>
                  </div>
                </Popup>
              </Marker>
            ),
        )}

        {zones.map((zone) => (
          <CircleMarker
            key={zone._id}
            center={[zone.lat, zone.lng]}
            radius={12}
            eventHandlers={{
              click: () => {
                setSelectedZone(zone);
                setIsPanelCollapsed(false);
              },
            }}
            pathOptions={{
              fillColor: getZoneColor(zone.type),
              color: 'white',
              weight: 2,
              fillOpacity: 0.85,
            }}
          >
            <Popup>
              <div className="space-y-1">
                <p className="font-bold text-slate-900">{zone.name || zone.label}</p>
                <p className="text-xs text-slate-500">{zone.region}</p>
                <p className="text-xs text-slate-600">
                  {t('maps.ndviScore')}: {zone.ndviScore}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}