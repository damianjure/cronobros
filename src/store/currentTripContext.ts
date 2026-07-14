import { createContext, useContext } from 'react';
import type { Trip } from '../types';

/**
 * Holds the full `Trip` doc (name, members, memberUids, pendingMemberships)
 * for whichever trip is currently selected — provided by `TripStoreProvider`
 * alongside its existing `TripStoreContext` (PR5: Sidebar/Header need the
 * real trip name, and FriendChips/PlacesView/App need real membership
 * instead of the `friends` fixture). Separate from `TripStoreContext`
 * because it's trip METADATA (sourced from `tripsStore`), not per-trip
 * itinerary/pins/pendingPlaces/chat data.
 */
export const CurrentTripContext = createContext<Trip | null>(null);

export function useCurrentTrip(): Trip | null {
  return useContext(CurrentTripContext);
}
