import type { Trip, Role } from '../types';
import type { Unsubscribe } from './ports';

/**
 * Data-access seam for the trip *collection* (creation, listing, membership) —
 * a different granularity than `TripRepository`, which is scoped to one
 * already-selected trip's itinerary/pins/pendingPlaces/chat (design decision
 * "Trip/membership ops"). `InMemoryTripsRepository` implements this over an
 * in-memory array for PR2; `FirestoreTripsRepository` (PR3) swaps it in with
 * zero changes to consumers.
 */
export interface TripsRepository {
  subscribeTrips(uid: string, cb: (trips: Trip[]) => void): Unsubscribe;
  createTrip(name: string, ownerUid: string): Promise<void>;
  deleteTrip(tripId: string): Promise<void>;
  inviteMember(tripId: string, email: string, role: Role): Promise<void>;
  updateRole(tripId: string, uid: string, role: Role): Promise<void>;
  removeMember(tripId: string, uid: string): Promise<void>;
}
