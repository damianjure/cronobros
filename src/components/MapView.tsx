import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { MapPin, Navigation, Plus, Search, X } from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { useCurrentTrip } from '../store/currentTripContext';
import { useTripParticipants } from '../store/participants';
import { useAuthStore } from '../store/authStore';
import type { PinnedPoint } from '../types';
import type { MapPoint, RouteSummary } from '../lib/googleMaps';
import GoogleMapCanvas from './GoogleMapCanvas';

function geographicPosition(pin: PinnedPoint): google.maps.LatLngLiteral | null {
  if ('lat' in pin.coords && 'lon' in pin.coords) {
    return { lat: pin.coords.lat, lng: pin.coords.lon };
  }
  return null;
}

function formatDuration(durationMillis: number | null): string {
  if (!durationMillis) return 'Sin estimación';
  const totalMinutes = Math.round(durationMillis / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`;
}

export default function MapView() {
  const pins = useTripStore(state => state.pins);
  const criticalEvents = useTripStore(state => state.criticalEvents);
  const upsertPin = useTripStore(state => state.upsertPin);
  const currentTrip = useCurrentTrip();
  const participants = useTripParticipants();
  const user = useAuthStore(state => state.user);
  const role = user ? currentTrip?.members[user.uid] : undefined;
  const canEdit = role === 'owner' || role === 'editor';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [draftPosition, setDraftPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Lugar');
  const [description, setDescription] = useState('');
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);

  const geographicPins = useMemo(
    () => pins.flatMap(pin => {
      const position = geographicPosition(pin);
      return position ? [{ id: pin.id, title: pin.title, position }] : [];
    }),
    [pins],
  );

  const mapPoints: MapPoint[] = useMemo(
    () => [
      ...geographicPins,
      ...criticalEvents.map(event => ({
        id: `critical:${event.id}`,
        title: event.title,
        position: { lat: event.coords.lat, lng: event.coords.lon },
      })),
    ],
    [criticalEvents, geographicPins],
  );

  const filteredPins = pins.filter(pin =>
    `${pin.title} ${pin.category}`.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const selectedPin = pins.find(pin => pin.id === selectedPointId) ?? null;

  const handleMapClick = useCallback((position: google.maps.LatLngLiteral) => {
    setDraftPosition(position);
  }, []);
  const handlePointClick = useCallback((id: string) => setSelectedPointId(id), []);
  const handleRouteSummary = useCallback((summary: RouteSummary | null) => setRouteSummary(summary), []);

  const handleSavePin = async (event: FormEvent) => {
    event.preventDefault();
    if (!draftPosition || !title.trim()) return;
    await upsertPin({
      id: globalThis.crypto?.randomUUID?.() ?? `pin-${Date.now()}`,
      title: title.trim(),
      category: category.trim() || 'Lugar',
      description: description.trim(),
      image: '',
      coords: { lat: draftPosition.lat, lon: draftPosition.lng },
    });
    setDraftPosition(null);
    setTitle('');
    setCategory('Lugar');
    setDescription('');
  };

  const openRoute = () => {
    if (mapPoints.length < 2) return;
    const origin = mapPoints[0].position;
    const destination = mapPoints[mapPoints.length - 1].position;
    const url = new URL('https://www.google.com/maps/dir/');
    url.searchParams.set('api', '1');
    url.searchParams.set('origin', `${origin.lat},${origin.lng}`);
    url.searchParams.set('destination', `${destination.lat},${destination.lng}`);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] -mx-6 md:-mx-16 -mb-12 relative overflow-hidden bg-brand-background">
      <aside className="w-full lg:w-80 bg-white border-r border-brand-primary/10 flex flex-col h-1/2 lg:h-full z-10">
        <div className="px-6 py-5 border-b border-brand-primary/10 shrink-0">
          <h2 className="font-serif font-black italic text-brand-primary text-xl">{currentTrip?.name ?? 'Tu viaje'}</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-on-surface-variant/75 mt-1">
            Grupo de {participants.length} · {mapPoints.length} puntos geográficos
          </p>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-outline w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Filtrar lugares..."
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-brand-background border border-brand-primary/10 text-xs focus:outline-none focus:border-brand-primary/30"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredPins.length === 0 ? (
            <div className="p-6 text-center border border-brand-primary/10 bg-brand-background">
              <MapPin className="w-5 h-5 mx-auto text-brand-primary/50 mb-2" />
              <p className="text-xs font-bold text-brand-primary">Sin lugares marcados</p>
              <p className="text-[10px] text-brand-outline mt-1">
                {canEdit ? 'Hacé clic en el mapa para guardar el primero.' : 'Los editores pueden agregar puntos.'}
              </p>
            </div>
          ) : filteredPins.map(pin => (
            <button
              key={pin.id}
              onClick={() => setSelectedPointId(pin.id)}
              className={`w-full text-left p-3 border transition-colors ${selectedPointId === pin.id ? 'bg-brand-background border-brand-primary' : 'border-brand-primary/10 hover:border-brand-primary/30'}`}
            >
              <span className="font-serif font-black italic text-sm text-brand-primary block">{pin.title}</span>
              <span className="text-[9px] text-brand-outline font-black uppercase tracking-widest">{pin.category}</span>
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 relative h-1/2 lg:h-full overflow-hidden">
        <GoogleMapCanvas
          points={mapPoints}
          editable={canEdit}
          onMapClick={handleMapClick}
          onPointClick={handlePointClick}
          onRouteSummary={handleRouteSummary}
        />

        {selectedPin && (
          <div className="absolute top-5 left-5 z-20 max-w-xs bg-white border border-brand-primary/10 p-4 shadow-lg">
            <button onClick={() => setSelectedPointId(null)} className="absolute right-3 top-3 text-brand-outline" aria-label="Cerrar detalle"><X className="w-4 h-4" /></button>
            <p className="text-[9px] uppercase tracking-widest font-black text-brand-outline">{selectedPin.category}</p>
            <h3 className="font-serif font-black italic text-brand-primary mt-1">{selectedPin.title}</h3>
            {selectedPin.description && <p className="text-xs text-brand-on-surface-variant mt-2">{selectedPin.description}</p>}
          </div>
        )}

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-4">
          <div className="bg-white border border-brand-primary/10 p-4 flex items-center justify-between gap-4 shadow-lg">
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-brand-outline">Ruta real</p>
              <p className="font-serif font-black italic text-brand-primary">
                {routeSummary ? `${(routeSummary.distanceMeters / 1000).toFixed(1)} km · ${formatDuration(routeSummary.durationMillis)}` : 'Agregá al menos dos puntos'}
              </p>
            </div>
            <button
              onClick={openRoute}
              disabled={mapPoints.length < 2}
              className="px-4 py-2.5 bg-brand-primary disabled:opacity-40 text-brand-on-primary text-[9px] font-black uppercase tracking-widest flex items-center gap-2"
            >
              <Navigation className="w-4 h-4" /> Abrir ruta
            </button>
          </div>
        </div>
      </main>

      {draftPosition && canEdit && (
        <div className="fixed inset-0 z-[60] bg-brand-primary/40 flex items-center justify-center p-4">
          <form onSubmit={handleSavePin} className="bg-white border border-brand-primary/10 p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-black italic text-brand-primary">Guardar lugar</h3>
              <button type="button" onClick={() => setDraftPosition(null)} aria-label="Cancelar"><X className="w-4 h-4" /></button>
            </div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-brand-outline">Nombre
              <input value={title} onChange={event => setTitle(event.target.value)} required className="mt-1 w-full border border-brand-primary/15 p-2.5 text-xs normal-case" />
            </label>
            <label className="block text-[10px] font-black uppercase tracking-wider text-brand-outline">Categoría
              <input value={category} onChange={event => setCategory(event.target.value)} className="mt-1 w-full border border-brand-primary/15 p-2.5 text-xs normal-case" />
            </label>
            <label className="block text-[10px] font-black uppercase tracking-wider text-brand-outline">Descripción
              <textarea value={description} onChange={event => setDescription(event.target.value)} className="mt-1 w-full border border-brand-primary/15 p-2.5 text-xs normal-case" rows={3} />
            </label>
            <button type="submit" className="w-full py-2.5 bg-brand-primary text-brand-on-primary text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Guardar en el mapa
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
