import { create } from 'zustand';
import type { StoreApi, UseBoundStore } from 'zustand';
import type { Trip } from '../types';
import type { TripsRepository } from '../services/tripsPort';
import type { Unsubscribe } from '../services/ports';
import { tripsRepository as defaultRepository } from '../services';

export interface TripsStoreState {
  trips: Trip[];
  subscribeToUser: (uid: string) => Unsubscribe;
  createTrip: (name: string, ownerUid: string) => Promise<void>;
  deleteTrip: (tripId: string) => Promise<void>;
}

/**
 * Builds the app-level trips-list store (design decision "Trip selection
 * ownership") bound to the given `TripsRepository`. Subscription is NOT
 * started at module load — a caller (the trips list UI) must call
 * `subscribeToUser(uid)` once the current uid is known, mirroring the
 * design's move away from module-load singletons.
 *
 * Exported as a factory (rather than only a singleton) so tests can inject
 * an isolated `InMemoryTripsRepository` instance.
 */
export function createTripsStore(
  repository: TripsRepository,
): UseBoundStore<StoreApi<TripsStoreState>> {
  const store = create<TripsStoreState>(() => ({
    trips: [],
    subscribeToUser: uid => repository.subscribeTrips(uid, trips => store.setState({ trips })),
    createTrip: (name, ownerUid) => repository.createTrip(name, ownerUid),
    deleteTrip: tripId => repository.deleteTrip(tripId),
  }));

  return store;
}

export const useTripsStore = createTripsStore(defaultRepository);
