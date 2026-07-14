import { useState, type ReactNode } from 'react';
import TripsListView from './TripsListView';

interface TripsGateProps {
  children: ReactNode;
}

/**
 * PR2 integration point between the auth gate and the app: shows the trips
 * list first, and reveals `children` once a trip is selected. `selectedTripId`
 * is NOT yet threaded into a per-trip data store — `children` (today's
 * single-trip `<App>`) keeps using the old `TRIP_ID` singleton regardless of
 * which trip was picked here. Wiring the real per-trip subscription is PR3's
 * job (`TripStoreProvider(tripId)` per design); this is a known, flagged gap,
 * not a silent shortcut.
 */
export default function TripsGate({ children }: TripsGateProps) {
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  if (!selectedTripId) {
    return <TripsListView onSelectTrip={setSelectedTripId} />;
  }

  return <>{children}</>;
}
