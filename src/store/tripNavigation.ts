import { createContext, useContext } from 'react';

export interface TripNavigation {
  /** Deselects the current trip, returning the user to the trips list. */
  leaveTrip: () => void;
}

/**
 * Provided by `TripsGate` (which owns `selectedTripId`) at the same level as
 * `TripStoreProvider`, so anything rendered as `children` — including
 * `Header`, deep inside the per-trip view tree — can trigger "leave this
 * trip" without threading a callback prop through every intermediate
 * component. Fixes the audit finding that there was no way to leave a
 * selected trip short of a full page reload (see
 * cronobros/ui-ux-audit-findings, P0 #2).
 */
export const TripNavigationContext = createContext<TripNavigation | null>(null);

export function useTripNavigation(): TripNavigation {
  const ctx = useContext(TripNavigationContext);
  if (!ctx) {
    throw new Error('useTripNavigation must be used within a TripsGate/TripNavigationContext provider');
  }
  return ctx;
}
