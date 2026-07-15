import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { loadGoogleMaps, type MapPoint, type RouteSummary } from '../lib/googleMaps';

interface GoogleMapCanvasProps {
  points: MapPoint[];
  editable: boolean;
  onMapClick: (position: google.maps.LatLngLiteral) => void;
  onPointClick: (id: string) => void;
  onRouteSummary: (summary: RouteSummary | null) => void;
}

export default function GoogleMapCanvas({
  points,
  editable,
  onMapClick,
  onPointClick,
  onRouteSummary,
}: GoogleMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const mapId = (import.meta.env.VITE_GOOGLE_MAP_ID as string | undefined) || 'DEMO_MAP_ID';

  useEffect(() => {
    if (!apiKey || !containerRef.current) return;
    let cancelled = false;
    const markers: google.maps.marker.AdvancedMarkerElement[] = [];
    const polylines: google.maps.Polyline[] = [];
    const listeners: google.maps.MapsEventListener[] = [];

    void (async () => {
      try {
        await loadGoogleMaps(apiKey);
        const [{ Map }, { AdvancedMarkerElement }, { LatLngBounds }] = await Promise.all([
          google.maps.importLibrary('maps') as Promise<google.maps.MapsLibrary>,
          google.maps.importLibrary('marker') as Promise<google.maps.MarkerLibrary>,
          google.maps.importLibrary('core') as Promise<google.maps.CoreLibrary>,
        ]);
        if (cancelled || !containerRef.current) return;

        const map = new Map(containerRef.current, {
          center: points[0]?.position ?? { lat: -34.6037, lng: -58.3816 },
          zoom: points.length > 0 ? 10 : 3,
          mapId,
          streetViewControl: false,
          mapTypeControl: false,
        });

        if (editable) {
          listeners.push(
            map.addListener('click', (event: google.maps.MapMouseEvent) => {
              if (event.latLng) onMapClick(event.latLng.toJSON());
            }),
          );
        }

        const bounds = new LatLngBounds();
        points.forEach(point => {
          bounds.extend(point.position);
          const marker = new AdvancedMarkerElement({
            map,
            position: point.position,
            title: point.title,
          });
          marker.addListener('click', () => onPointClick(point.id));
          markers.push(marker);
        });
        if (points.length > 1) map.fitBounds(bounds, 64);

        if (points.length >= 2) {
          const { Route } = (await google.maps.importLibrary('routes')) as google.maps.RoutesLibrary;
          const { routes } = await Route.computeRoutes({
            origin: points[0].position,
            destination: points[points.length - 1].position,
            intermediates: points.slice(1, -1).map(point => ({ location: point.position })),
            travelMode: 'DRIVING',
            fields: ['path', 'distanceMeters', 'durationMillis'],
          });
          const route = routes?.[0];
          if (!route || cancelled) {
            onRouteSummary(null);
            return;
          }
          route.createPolylines().forEach(polyline => {
            polyline.setMap(map);
            polylines.push(polyline);
          });
          onRouteSummary({
            distanceMeters: route.distanceMeters ?? 0,
            durationMillis: route.durationMillis ?? null,
          });
        } else {
          onRouteSummary(null);
        }
      } catch {
        if (!cancelled) setError('No pudimos cargar el mapa o calcular la ruta.');
      }
    })();

    return () => {
      cancelled = true;
      listeners.forEach(listener => listener.remove());
      markers.forEach(marker => {
        marker.map = null;
      });
      polylines.forEach(polyline => polyline.setMap(null));
    };
  }, [apiKey, editable, mapId, onMapClick, onPointClick, onRouteSummary, points]);

  if (!apiKey) {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-8 text-center bg-brand-surface-low">
        <div className="max-w-sm bg-white border border-brand-primary/10 p-8">
          <MapPin className="w-7 h-7 text-brand-primary/50 mx-auto mb-3" />
          <p className="font-serif font-black italic text-brand-primary">Google Maps necesita configuración</p>
          <p className="text-xs text-brand-outline mt-2">Agregá la clave pública restringida para habilitar el mapa interactivo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="w-full h-full" aria-label="Mapa interactivo del viaje" />
      {error && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white border border-red-200 px-4 py-2 text-xs text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
