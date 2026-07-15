import { createContext, useContext } from 'react';
import { create } from 'zustand';
import type { StoreApi, UseBoundStore } from 'zustand';
import type {
  ItineraryDay,
  ItineraryActivity,
  PinnedPoint,
  PendingPlace,
  ChatMessage,
  TripLogistics,
  CriticalEvent,
} from '../types';
import type { TripRepository } from '../services/ports';

const EMPTY_LOGISTICS: TripLogistics = { drivers: [], vehicle: null };

export interface TripStoreState {
  itinerary: ItineraryDay[];
  pins: PinnedPoint[];
  pendingPlaces: PendingPlace[];
  chatMessages: ChatMessage[];
  logistics: TripLogistics;
  criticalEvents: CriticalEvent[];

  addActivity: (dayId: string, activity: ItineraryActivity) => Promise<void>;
  deleteActivity: (dayId: string, activityId: string) => Promise<void>;
  updateActivityPeople: (dayId: string, activityId: string, people: string[]) => Promise<void>;
  addDay: (day: ItineraryDay) => Promise<void>;
  approvePlace: (placeId: string, targetDayId: string) => Promise<void>;
  addPendingPlace: (place: PendingPlace) => Promise<void>;
  deletePendingPlace: (placeId: string) => Promise<void>;
  addChatMessage: (message: ChatMessage) => Promise<void>;
  updateLogistics: (logistics: TripLogistics) => Promise<void>;
}

export interface TripStoreHandle {
  store: UseBoundStore<StoreApi<TripStoreState>>;
  teardown: () => void;
}

/**
 * Builds a trip store bound to the given repository and tripId (design
 * decision "Trip-detail store lifecycle" / spec "Store is auth- and
 * trip-gated, not a module-load singleton"). Zustand stores live outside
 * React, so a repository's realtime `subscribe*` callback (in-memory today,
 * a Firestore `onSnapshot` for `FirestoreTripRepository`) can push directly
 * into `store.setState` with no effect-bridge in components.
 *
 * Unlike the pre-PR3 module-load singleton, `createTripStore` now REQUIRES a
 * `tripId` and returns a `teardown` alongside the store: callers (in
 * practice, `TripStoreProvider`) own the store's lifecycle and MUST call
 * `teardown()` before creating a new store for a different tripId, so old
 * subscriptions never leak into the new trip's data.
 */
export function createTripStore(repository: TripRepository, tripId: string): TripStoreHandle {
  const store = create<TripStoreState>(() => ({
    itinerary: [],
    pins: [],
    pendingPlaces: [],
    chatMessages: [],
    logistics: EMPTY_LOGISTICS,
    criticalEvents: [],

    addActivity: (dayId, activity) => repository.addActivity(tripId, dayId, activity),
    deleteActivity: (dayId, activityId) => repository.deleteActivity(tripId, dayId, activityId),
    updateActivityPeople: (dayId, activityId, people) =>
      repository.updateActivityPeople(tripId, dayId, activityId, people),
    addDay: day => repository.addDay(tripId, day),
    approvePlace: (placeId, targetDayId) => repository.approvePlace(tripId, placeId, targetDayId),
    addPendingPlace: place => repository.addPendingPlace(tripId, place),
    deletePendingPlace: placeId => repository.deletePendingPlace(tripId, placeId),
    addChatMessage: message => repository.addChatMessage(tripId, message),
    updateLogistics: logistics => repository.updateLogistics(tripId, logistics),
  }));

  // Subscribed AFTER `create()` returns: the repository fires each callback
  // synchronously once, and `store.setState` must exist first — calling
  // setState from inside the zustand initializer is discarded once the
  // initializer's return value is assigned as the store's initial state.
  const unsubscribeItinerary = repository.subscribeItinerary(tripId, itinerary =>
    store.setState({ itinerary }),
  );
  const unsubscribePins = repository.subscribePins(tripId, pins => store.setState({ pins }));
  const unsubscribePendingPlaces = repository.subscribePendingPlaces(tripId, pendingPlaces =>
    store.setState({ pendingPlaces }),
  );
  const unsubscribeChat = repository.subscribeChat(tripId, chatMessages =>
    store.setState({ chatMessages }),
  );
  const unsubscribeLogistics = repository.subscribeLogistics(tripId, logistics =>
    store.setState({ logistics }),
  );
  const unsubscribeCriticalEvents = repository.subscribeCriticalEvents(tripId, criticalEvents =>
    store.setState({ criticalEvents }),
  );

  return {
    store,
    teardown: () => {
      unsubscribeItinerary();
      unsubscribePins();
      unsubscribePendingPlaces();
      unsubscribeChat();
      unsubscribeLogistics();
      unsubscribeCriticalEvents();
    },
  };
}

// Context holding the currently-active per-trip store, provided by
// `TripStoreProvider` (`src/components/TripStoreProvider.tsx`). Declared here
// (rather than in the provider component file) so `useTripStore` below can
// stay a stable import path for every existing consumer
// (`import { useTripStore } from '../store/tripStore'`).
export const TripStoreContext = createContext<UseBoundStore<StoreApi<TripStoreState>> | null>(
  null,
);

/**
 * Drop-in replacement for the old singleton hook: same call shape
 * (`useTripStore(selector)`) for every existing consumer, but now reads the
 * store bound to the currently selected trip from `TripStoreContext` instead
 * of a module-load singleton. Throws if rendered outside a
 * `TripStoreProvider` — there is no sensible trip-less fallback.
 */
export function useTripStore<T>(selector: (state: TripStoreState) => T): T {
  const store = useContext(TripStoreContext);
  if (!store) {
    throw new Error('useTripStore must be used within a TripStoreProvider');
  }
  return store(selector);
}
