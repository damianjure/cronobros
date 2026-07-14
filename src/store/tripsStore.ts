import { create } from 'zustand';
import type { StoreApi, UseBoundStore } from 'zustand';
import type { Trip, Role } from '../types';
import type { TripsRepository } from '../services/tripsPort';
import type { Unsubscribe } from '../services/ports';
import { tripsRepository as defaultRepository } from '../services';

export interface TripsStoreState {
  trips: Trip[];
  subscribeToUser: (uid: string) => Unsubscribe;
  createTrip: (name: string, ownerUid: string) => Promise<void>;
  deleteTrip: (tripId: string) => Promise<void>;
  inviteMember: (tripId: string, email: string, role: Role) => Promise<void>;
  activatePendingInvites: (uid: string, email: string) => Promise<void>;
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
    inviteMember: (tripId, email, role) => repository.inviteMember(tripId, email, role),
    activatePendingInvites: (uid, email) => repository.activatePendingInvites(uid, email),
  }));

  return store;
}

export const useTripsStore = createTripsStore(defaultRepository);

/**
 * Role selector (design decision "Roles port": `RolesPort` stub deleted —
 * role is read directly from `trip.members[uid]`, colocated with the trip
 * doc rather than a separate port). Pure function over the trips already
 * held by `tripsStore`, so consumers derive the current user's role for the
 * selected trip via `getRoleForTrip(useTripsStore(state => state.trips),
 * tripId, uid)` without any additional subscription.
 */
export function getRoleForTrip(trips: Trip[], tripId: string, uid: string): Role | undefined {
  return trips.find(trip => trip.id === tripId)?.members[uid];
}
