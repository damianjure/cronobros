import { useCallback, useMemo, useState, type CSSProperties, type FormEvent } from 'react';
import { MapPin, Navigation, Plus, Search, X } from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { useCurrentTrip } from '../store/currentTripContext';
import { useTripParticipants, useTripPendingInvitesCount } from '../store/participants';
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
  const pendingInvitesCount = useTripPendingInvitesCount();
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
            Grupo de {participants.length}
            {pendingInvitesCount > 0 && ` (+${pendingInvitesCount} pendiente)`} · {mapPoints.length} puntos geográficos
          </p>
          <md-outlined-text-field
            placeholder="Filtrar lugares..."
            value={searchTerm}
            onInput={event => setSearchTerm(event.currentTarget.value)}
            style={{ width: '100%', marginTop: '12px' }}
          >
            <Search slot="leading-icon" className="w-3.5 h-3.5" />
          </md-outlined-text-field>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredPins.length === 0 ? (
            <md-outlined-card style={{ display: 'block' } as CSSProperties} className="p-6 text-center">
              <MapPin className="w-5 h-5 mx-auto text-brand-primary/50 mb-2" />
              <p className="text-xs font-bold text-brand-primary">Sin lugares marcados</p>
              <p className="text-[10px] text-brand-outline mt-1">
                {canEdit ? 'Hacé clic en el mapa para guardar el primero.' : 'Los editores pueden agregar puntos.'}
              </p>
            </md-outlined-card>
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
          <md-elevated-card style={{ display: 'block' } as CSSProperties} className="absolute top-5 left-5 z-20 max-w-xs p-4">
            <md-icon-button onClick={() => setSelectedPointId(null)} className="absolute right-1 top-1" aria-label="Cerrar detalle">
              <X className="w-4 h-4" />
            </md-icon-button>
            <p className="text-[9px] uppercase tracking-widest font-black text-brand-outline">{selectedPin.category}</p>
            <h3 className="font-serif font-black italic text-brand-primary mt-1">{selectedPin.title}</h3>
            {selectedPin.description && <p className="text-xs text-brand-on-surface-variant mt-2">{selectedPin.description}</p>}
          </md-elevated-card>
        )}

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-4">
          <md-elevated-card style={{ display: 'flex' } as CSSProperties} className="p-4 items-center justify-between gap-4">
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-brand-outline">Ruta real</p>
              <p className="font-serif font-black italic text-brand-primary">
                {routeSummary ? `${(routeSummary.distanceMeters / 1000).toFixed(1)} km · ${formatDuration(routeSummary.durationMillis)}` : 'Agregá al menos dos puntos'}
              </p>
            </div>
            <md-filled-button onClick={openRoute} disabled={mapPoints.length < 2}>
              <Navigation slot="icon" className="w-4 h-4" />
              Abrir ruta
            </md-filled-button>
          </md-elevated-card>
        </div>
      </main>

      {draftPosition && canEdit && (
        <div className="fixed inset-0 z-[60] bg-brand-primary/40 flex items-center justify-center p-4">
          <md-elevated-card style={{ display: 'block' } as CSSProperties} className="w-full max-w-sm">
            <form onSubmit={handleSavePin} className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-black italic text-brand-primary">Guardar lugar</h3>
                <md-icon-button type="button" onClick={() => setDraftPosition(null)} aria-label="Cancelar">
                  <X className="w-4 h-4" />
                </md-icon-button>
              </div>
              <md-outlined-text-field
                label="Nombre"
                value={title}
                onInput={event => setTitle(event.currentTarget.value)}
                required
                style={{ width: '100%' }}
              />
              <md-outlined-text-field
                label="Categoría"
                value={category}
                onInput={event => setCategory(event.currentTarget.value)}
                style={{ width: '100%' }}
              />
              <md-outlined-text-field
                label="Descripción"
                type="textarea"
                rows={3}
                value={description}
                onInput={event => setDescription(event.currentTarget.value)}
                style={{ width: '100%' }}
              />
              <md-filled-button type="submit" style={{ width: '100%' }}>
                <Plus slot="icon" className="w-4 h-4" />
                Guardar en el mapa
              </md-filled-button>
            </form>
          </md-elevated-card>
        </div>
      )}
    </div>
  );
}
