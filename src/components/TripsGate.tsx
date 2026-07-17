import { useMemo, useState, type ReactNode } from 'react';
import TripsListView from './TripsListView';
import TripStoreProvider from './TripStoreProvider';
import { TripNavigationContext } from '../store/tripNavigation';

interface TripsGateProps {
  children: ReactNode;
}

/**
 * Integration point between the auth gate and the app: shows the trips list
 * first, and reveals `children` once a trip is selected. `selectedTripId` is
 * threaded into `TripStoreProvider` (PR3), which creates/tears down the
 * per-trip detail store as the selection changes — `children` (today's
 * `<App>`) reads that trip's data via `useTripStore`.
 *
 * Also provides `TripNavigationContext` so anything under `children` (e.g.
 * `Header`) can call `leaveTrip()` to deselect the trip and return here,
 * without a reload — see cronobros/ui-ux-audit-findings, P0 #2.
 */
export default function TripsGate({ children }: TripsGateProps) {
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const navigation = useMemo(() => ({ leaveTrip: () => setSelectedTripId(null) }), []);

  if (!selectedTripId) {
    return <TripsListView onSelectTrip={setSelectedTripId} />;
  }

  return (
    <TripNavigationContext.Provider value={navigation}>
      <TripStoreProvider tripId={selectedTripId}>{children}</TripStoreProvider>
    </TripNavigationContext.Provider>
  );
}
