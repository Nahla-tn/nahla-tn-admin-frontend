'use client';

import { useEffect, useMemo } from 'react';
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { HeatmapPoint } from '../types/dashboard.types';
import { useI18n } from '@/lib/hooks/useI18n';

type HeatLayerProps = {
  points: HeatmapPoint[];
};

const HEAT_LAYER_OPTIONS = {
  radius: 28,
  blur: 18,
  maxZoom: 17,
  minOpacity: 0.35,
  gradient: {
    0.2: 'blue',
    0.4: 'lime',
    0.6: 'yellow',
    0.8: 'orange',
    1.0: 'red',
  },
};

function HeatLayer({ points }: HeatLayerProps) {
  const map = useMap();

  const heatPoints = useMemo(() => {
    return points
      .filter((point) => {
        return (
          Number.isFinite(point.latitude) && Number.isFinite(point.longitude)
        );
      })
      .map((point) => [point.latitude, point.longitude, point.intensity || 1]);
  }, [points]);

  useEffect(() => {
    if (!heatPoints.length) {
      return;
    }

    const heatLayer = (L as any).heatLayer(heatPoints, HEAT_LAYER_OPTIONS);

    heatLayer.addTo(map);

    return () => {
      if (map.hasLayer(heatLayer)) {
        map.removeLayer(heatLayer);
      }
    };
  }, [map, heatPoints]);

  return null;
}

type Props = {
  points: HeatmapPoint[];
};

export default function DashboardHeatmapMapClient({ points }: Props) {
  const { t } = useI18n();

  const defaultCenter: [number, number] = [34.0, 9.0];

  const center: [number, number] =
    points.length > 0
      ? [points[0].latitude, points[0].longitude]
      : defaultCenter;

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {t('dashboard.heatmapTitle')}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {t('dashboard.heatmapSubtitle')}
        </p>
      </div>

      <div className="h-[420px] overflow-hidden rounded-lg border">
        <MapContainer
          center={center}
          zoom={points.length > 0 ? 8 : 6}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <HeatLayer points={points} />

          {points.map((point) => (
            <CircleMarker
              key={point.id}
              center={[point.latitude, point.longitude]}
              radius={6}
              pathOptions={{
                color: '#f97316',
                fillColor: '#f97316',
                fillOpacity: 0.8,
              }}
            >
              <Popup>
                <div>
                  <p className="font-semibold">{point.name}</p>
                  <p>{point.email}</p>
                  <p>
                    {t('common.region')}: {point.region || '-'}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {points.length === 0 && (
        <p className="mt-3 text-sm text-gray-500">
          {t('dashboard.noLocationData')}
        </p>
      )}
    </div>
  );
}