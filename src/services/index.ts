import { InMemoryTripRepository } from './inMemoryTripRepository';
import type { TripRepository } from './ports';

export type { TripRepository, Unsubscribe } from './ports';

// Single injection point for the trip data-access seam. Phase 1 swaps this
// for a FirestoreTripRepository instance — nothing outside this file needs
// to change, since consumers only depend on the TripRepository interface.
export const tripRepository: TripRepository = new InMemoryTripRepository();

// Reserved for Phase 4 (owner/editor/viewer roles). Declared now, empty, to
// hold the seam next to TripRepository — no implementation this phase.
export interface RolesPort {
  readonly __rolesPortReserved?: never;
}
