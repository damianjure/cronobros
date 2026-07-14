import { useState, type ReactNode } from 'react';
import TripsListView from './TripsListView';
import TripStoreProvider from './TripStoreProvider';

interface TripsGateProps {
  children: ReactNode;
}

/**
 * Integration point between the auth gate and the app: shows the trips list
 * first, and reveals `children` once a trip is selected. `selectedTripId` is
 * threaded into `TripStoreProvider` (PR3), which creates/tears down the
 * per-trip detail store as the selection changes — `children` (today's
 * `<App>`) reads that trip's data via `useTripStore`.
 */
export default function TripsGate({ children }: TripsGateProps) {
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  if (!selectedTripId) {
    return <TripsListView onSelectTrip={setSelectedTripId} />;
  }

  return <TripStoreProvider tripId={selectedTripId}>{children}</TripStoreProvider>;
}
