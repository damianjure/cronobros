import { FirestoreTripRepository } from './firestoreTripRepository';
import { FirestoreTripsRepository } from './firestoreTripsRepository';
import type { TripRepository } from './ports';
import type { TripsRepository } from './tripsPort';

export type { TripRepository, Unsubscribe } from './ports';
export type { TripsRepository } from './tripsPort';

// Single injection point for the trip data-access seam. Swapped from
// InMemoryTripRepository to FirestoreTripRepository in PR3 — nothing outside
// this file needs to change, since consumers only depend on the
// TripRepository interface.
export const tripRepository: TripRepository = new FirestoreTripRepository();

// Single injection point for the trip-collection/membership seam (design
// decision "Trip/membership ops"). PR3 swaps InMemoryTripsRepository for
// FirestoreTripsRepository — nothing outside this file needs to change,
// since consumers only depend on the TripsRepository interface.
export const tripsRepository: TripsRepository = new FirestoreTripsRepository();
