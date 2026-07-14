import React, { useEffect, useState } from 'react';
import { MapPin, Plus, Trash2 } from 'lucide-react';
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
  const activatePendingInvites = useTripsStore(state => state.activatePendingInvites);
  const user = useAuthStore(state => state.user);

  const uid = user?.uid ?? DEV_FALLBACK_UID;
  const [name, setName] = useState('');

  useEffect(() => {
    return subscribeToUser(uid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  // Spec: "Invited user signs in and membership activates" — best-effort;
  // see FirestoreTripsRepository.activatePendingInvites for the documented
  // rules-visibility gap that currently makes this a no-op for a genuine
  // not-yet-a-member invitee.
  useEffect(() => {
    if (!user?.email) return;
    void activatePendingInvites(uid, user.email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, user?.email]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    createTrip(trimmed, uid);
    setName('');
  };

  return (
    <div className="min-h-screen bg-brand-background p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="font-serif text-2xl font-black italic text-brand-primary">Tus Viajes</h1>

        <form onSubmit={handleCreate} className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="trip-name" className="sr-only">
              Nombre del Viaje
            </label>
            <input
              id="trip-name"
              type="text"
              placeholder="Ej. Islandia 2026"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-white border border-brand-primary/10 rounded-none py-2.5 px-3 text-xs focus:outline-none focus:border-brand-primary/30 font-sans"
            />
          </div>
          <button
            type="submit"
            className="bg-brand-primary hover:bg-brand-primary-container text-white px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Viaje</span>
          </button>
        </form>

        {trips.length === 0 ? (
          <div className="p-12 bg-white border border-brand-primary/10 rounded-none text-center">
            <MapPin className="w-8 h-8 text-brand-outline/40 mx-auto mb-3" />
            <p className="font-serif font-bold italic text-brand-primary text-sm mb-1">No tenés viajes todavía</p>
            <p className="text-xs text-brand-outline">Creá tu primer viaje con el formulario de arriba.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trips.map(trip => (
              <div
                key={trip.id}
                className="bg-white border border-brand-primary/10 rounded-none p-5 flex items-center justify-between gap-3"
              >
                <button
                  type="button"
                  onClick={() => onSelectTrip(trip.id)}
                  className="font-serif font-black italic text-brand-primary text-base text-left flex-1 cursor-pointer"
                >
                  {trip.name}
                </button>
                <button
                  type="button"
                  onClick={() => deleteTrip(trip.id)}
                  aria-label={`Eliminar ${trip.name}`}
                  title="Eliminar viaje"
                  className="text-brand-outline hover:text-red-600 transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
