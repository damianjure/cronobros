let loadPromise: Promise<void> | null = null;

declare global {
  interface Window {
    __cronobrosGoogleMapsLoaded?: () => void;
  }
}

export function loadGoogleMaps(apiKey: string): Promise<void> {
  if (typeof window.google !== 'undefined' && window.google.maps) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    window.__cronobrosGoogleMapsLoaded = resolve;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async&callback=__cronobrosGoogleMapsLoaded&v=weekly&language=es&auth_referrer_policy=origin`;
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('No se pudo cargar Google Maps.'));
    };
    document.head.append(script);
  });

  return loadPromise;
}

export interface MapPoint {
  id: string;
  title: string;
  position: google.maps.LatLngLiteral;
}

export interface RouteSummary {
  distanceMeters: number;
  durationMillis: number | null;
}
