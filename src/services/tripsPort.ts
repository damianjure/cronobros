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
  setArchived(tripId: string, archived: boolean): Promise<void>;
  inviteMember(tripId: string, email: string, role: Role): Promise<void>;
  cancelInvite(tripId: string, email: string): Promise<void>;
  updateRole(tripId: string, uid: string, role: Role): Promise<void>;
  removeMember(tripId: string, uid: string): Promise<void>;

  // PR5 (spec "Invite creates a pending membership record, activated on
  // first matching sign-in"). Activates every pending membership matching
  // `email` across the trips visible to this call: moves the invitee's uid
  // into `members`/`memberUids` and clears the pending record. NOTE: under
  // the current (untouched-this-session) `firestore.rules`, a non-member
  // cannot read a trip doc they're only pending on, so
  // `FirestoreTripsRepository`'s implementation is correct but will
  // observably no-op for a real not-yet-a-member invitee until rules/a
  // Cloud Function grant that visibility — see apply-progress for the full
  // gap writeup.
  activatePendingInvites(uid: string, email: string): Promise<void>;
}
