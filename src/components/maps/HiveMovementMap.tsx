'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import { Movement } from '@/lib/types/user';
import { useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Icônes personnalisées
const startIcon = new L.Icon({
  iconUrl: '/marker-start.png', // Ajoute une icône verte dans public/
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const endIcon = new L.Icon({
  iconUrl: '/marker-end.png', // Ajoute une icône rouge dans public/
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Props {
  movements: Movement[];
}

export function HiveMovementMap({ movements }: Props) {
  // Extraire les points valides
  const locatedMovements = useMemo(() => {
    return movements
      .map(m => {
        const coords = m.coordinates || m.to || m.from;
        return {
          ...m,
          validCoords: (Array.isArray(coords) && coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1]))
            ? (coords as [number, number])
            : null,
        };
      })
      .filter((m): m is typeof m & { validCoords: [number, number] } => m.validCoords !== null);
  }, [movements]);

  // Calculer le centre de la carte (moyenne des points)
  const center = useMemo(() => {
    if (locatedMovements.length === 0) return [36.8, 10.18] as [number, number]; // Tunisie centre par défaut
    
    const avgLat = locatedMovements.reduce((sum, m) => sum + m.validCoords[0], 0) / locatedMovements.length;
    const avgLng = locatedMovements.reduce((sum, m) => sum + m.validCoords[1], 0) / locatedMovements.length;
    return [avgLat, avgLng] as [number, number];
  }, [locatedMovements]);

  if (movements.length === 0 || locatedMovements.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 text-gray-500">
        Aucun déplacement géolocalisé
      </div>
    );
  }

  // Trajet reliant les zones chronologiquement si plus d'un point
  const trajectoryPositions = locatedMovements.map(m => m.validCoords);

  return (
    <MapContainer 
      center={center} 
      zoom={8} 
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {trajectoryPositions.length > 1 && (
        <Polyline 
          positions={trajectoryPositions}
          color="#f97316"
          weight={3}
          dashArray="6, 8"
        />
      )}

      {locatedMovements.map((movement, index) => {
        const isLast = index === 0; // Plus récent
        const hiveTotal = movement.hives ?? movement.hiveCount ?? 0;
        
        return (
          <div key={movement._id}>
            <Marker position={movement.validCoords}>
              <Popup>
                <div className="p-2 space-y-1">
                  <p className="font-bold text-gray-900">
                    {movement.destination || `Déplacement #${locatedMovements.length - index}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(movement.date).toLocaleDateString()}
                    {movement.status && (
                      <> &bull; <span className="font-semibold text-orange-600">{movement.status}</span></>
                    )}
                  </p>
                  <p className="text-sm mt-1">
                    <strong>{hiveTotal}</strong> ruches déployées
                  </p>
                  {movement.rating && (
                    <p className="text-xs text-gray-600">Note: <strong>{movement.rating}</strong></p>
                  )}
                  {movement.feedbackNote && (
                    <p className="text-xs italic text-gray-500">« {movement.feedbackNote} »</p>
                  )}
                </div>
              </Popup>
            </Marker>

            <CircleMarker 
              center={movement.validCoords}
              radius={isLast ? 10 : 6}
              fillColor={isLast ? '#f97316' : '#9ca3af'}
              color={isLast ? '#c2410c' : '#4b5563'}
              fillOpacity={0.85}
            />
          </div>
        );
      })}
    </MapContainer>
  );
}