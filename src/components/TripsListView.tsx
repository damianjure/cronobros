import React, { useEffect, useState, type CSSProperties } from 'react';
import { Archive, MapPin, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useTripsStore } from '../store/tripsStore';
import { useAuthStore } from '../store/authStore';

// While AUTH_GATE_ENABLED is false (dev-comfort bypass, see
// src/lib/devFlags.ts), `useAuthStore`'s user is null since no real sign-in
// ever happened. Falling back to a fixed dev uid keeps trip creation/listing
// usable in that mode; remove once the flag flips back to true.
const DEV_FALLBACK_UID = 'dev-user';

interface TripsListViewProps {
  onSelectTrip: (tripId: string) => void;
}

/**
 * Trips list/create/delete UI (spec: trip-management domain), PR2. Delete
 * calls the stub `deleteTrip` directly — real cascade delete of
 * subcollections lands in PR4's Cloud Function; this PR only removes the
 * `trips/{id}` doc itself.
 */
export default function TripsListView({ onSelectTrip }: TripsListViewProps) {
  const trips = useTripsStore(state => state.trips);
  const subscribeToUser = useTripsStore(state => state.subscribeToUser);
  const createTrip = useTripsStore(state => state.createTrip);
  const deleteTrip = useTripsStore(state => state.deleteTrip);
  const setArchived = useTripsStore(state => state.setArchived);
  const activatePendingInvites = useTripsStore(state => state.activatePendingInvites);
  const user = useAuthStore(state => state.user);

  const uid = user?.uid ?? DEV_FALLBACK_UID;
  const [name, setName] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const visibleTrips = trips.filter(trip => Boolean(trip.archivedAt) === showArchived);

  useEffect(() => {
    return subscribeToUser(uid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  // Spec: "Invited user signs in and membership activates". The repository
  // delegates to an authenticated callable so the invitee does not need
  // pre-membership Firestore read access.
  useEffect(() => {
    if (!user?.email) return;
    void Promise.resolve(activatePendingInvites(uid, user.email)).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, user?.email]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const ownerName = user?.displayName ?? user?.email;
    createTrip(trimmed, uid, ownerName ? { name: ownerName, ...(user?.photoURL ? { photo: user.photoURL } : {}) } : undefined);
    setName('');
  };

  return (
    <div className="min-h-screen bg-brand-background p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-serif text-2xl font-black italic text-brand-primary">{showArchived ? 'Viajes archivados' : 'Tus Viajes'}</h1>
          <md-outlined-button type="button" onClick={() => setShowArchived(value => !value)}>
            {showArchived ? <RotateCcw slot="icon" className="h-3.5 w-3.5" /> : <Archive slot="icon" className="h-3.5 w-3.5" />}
            {showArchived ? 'Ver activos' : 'Ver archivo'}
          </md-outlined-button>
        </div>

        <form onSubmit={handleCreate} className="flex gap-3">
          <md-outlined-text-field
            label="Nombre del Viaje"
            placeholder="Ej. Vacaciones 2026"
            value={name}
            onInput={e => setName(e.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <md-filled-button type="submit">
            <Plus slot="icon" className="w-4 h-4" />
            Crear Viaje
          </md-filled-button>
        </form>

        {visibleTrips.length === 0 ? (
          <md-outlined-card style={{ display: 'block' } as CSSProperties} className="p-12 text-center">
            <MapPin className="w-8 h-8 text-brand-outline/40 mx-auto mb-3" />
            <p className="font-serif font-bold italic text-brand-primary text-sm mb-1">{showArchived ? 'No hay viajes archivados' : 'No tenés viajes todavía'}</p>
            <p className="text-xs text-brand-outline">{showArchived ? 'Los viajes que archives aparecerán acá.' : 'Creá tu primer viaje con el formulario de arriba.'}</p>
          </md-outlined-card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleTrips.map(trip => (
              <md-elevated-card
                key={trip.id}
                style={{ display: 'flex' } as CSSProperties}
                className="p-5 items-center justify-between gap-3"
              >
                {trip.members[uid] !== 'viewer' && <md-icon-button
                  type="button"
                  onClick={() => setArchived(trip.id, !showArchived)}
                  aria-label={`${showArchived ? 'Restaurar' : 'Archivar'} ${trip.name}`}
                  className="shrink-0"
                >
                  {showArchived ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                </md-icon-button>}
                {trip.ownerUid === uid && <button
                  type="button"
                  onClick={() => onSelectTrip(trip.id)}
                  className="font-serif font-black italic text-brand-primary text-base text-left flex-1 cursor-pointer"
                >
                  {trip.name}
                </button>}
                <md-icon-button
                  type="button"
                  onClick={() => deleteTrip(trip.id)}
                  aria-label={`Eliminar ${trip.name}`}
                  className="shrink-0"
                  style={{ '--md-icon-button-hover-icon-color': 'var(--md-sys-color-error)' } as CSSProperties}
                >
                  <Trash2 className="w-4 h-4" />
                </md-icon-button>
              </md-elevated-card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
