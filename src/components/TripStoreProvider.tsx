import { useEffect, useState, type ReactNode } from 'react';
import type { StoreApi, UseBoundStore } from 'zustand';
import { createTripStore, TripStoreContext, type TripStoreState } from '../store/tripStore';
import { tripRepository } from '../services';

interface TripStoreProviderProps {
  tripId: string;
  children: ReactNode;
}

/**
 * Owns the per-selected-trip store's lifecycle (design decision "Trip-detail
 * store lifecycle" / spec "Store is auth- and trip-gated, not a module-load
 * singleton"). Creates a fresh `createTripStore(tripRepository, tripId)` on
 * mount and whenever `tripId` changes, tearing down the previous handle
 * FIRST so trip A's subscriptions are always unsubscribed before trip B's
 * start. Renders nothing until the store for the current `tripId` exists —
 * `useTripStore` (context consumer) has no sensible trip-less fallback.
 */
export default function TripStoreProvider({ tripId, children }: TripStoreProviderProps) {
  const [store, setStore] = useState<UseBoundStore<StoreApi<TripStoreState>> | null>(null);

  useEffect(() => {
    const handle = createTripStore(tripRepository, tripId);
    setStore(() => handle.store);

    return () => {
      handle.teardown();
      setStore(null);
    };
  }, [tripId]);

  if (!store) return null;

  return <TripStoreContext.Provider value={store}>{children}</TripStoreContext.Provider>;
}
