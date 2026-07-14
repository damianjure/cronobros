import { create } from 'zustand';
import type { StoreApi, UseBoundStore } from 'zustand';
import type {
  ItineraryDay,
  ItineraryActivity,
  PinnedPoint,
  PendingPlace,
  ChatMessage,
} from '../types';
import type { TripRepository } from '../services/ports';
import { tripRepository as defaultRepository } from '../services';

// Single-trip app today — no trip switcher UI exists yet. Kept as a constant
// (rather than hardcoding the string at each call site) so a future
// multi-trip feature only has to change this one place.
export const TRIP_ID = 'default-trip';

export interface TripStoreState {
  itinerary: ItineraryDay[];
  pins: PinnedPoint[];
  pendingPlaces: PendingPlace[];
  chatMessages: ChatMessage[];

  addActivity: (dayId: string, activity: ItineraryActivity) => Promise<void>;
  deleteActivity: (dayId: string, activityId: string) => Promise<void>;
  updateActivityPeople: (dayId: string, activityId: string, people: string[]) => Promise<void>;
  addDay: (day: ItineraryDay) => Promise<void>;
  approvePlace: (placeId: string, targetDayId: string) => Promise<void>;
  addPendingPlace: (place: PendingPlace) => Promise<void>;
  deletePendingPlace: (placeId: string) => Promise<void>;
  addChatMessage: (message: ChatMessage) => Promise<void>;
}

/**
 * Builds a trip store bound to the given repository. Zustand stores live
 * outside React, so a repository's realtime `subscribe*` callback (today
 * synchronous in-memory, a Firestore `onSnapshot` in Phase 1) can push
 * directly into `store.setState` with no effect-bridge in components.
 *
 * Exported as a factory (rather than only a singleton) so tests can inject
 * an isolated `InMemoryTripRepository` instance instead of sharing the
 * app-wide singleton from `src/services`.
 */
export function createTripStore(
  repository: TripRepository,
): UseBoundStore<StoreApi<TripStoreState>> {
  const store = create<TripStoreState>(() => ({
    itinerary: [],
    pins: [],
    pendingPlaces: [],
    chatMessages: [],

    addActivity: (dayId, activity) => repository.addActivity(TRIP_ID, dayId, activity),
    deleteActivity: (dayId, activityId) => repository.deleteActivity(TRIP_ID, dayId, activityId),
    updateActivityPeople: (dayId, activityId, people) =>
      repository.updateActivityPeople(TRIP_ID, dayId, activityId, people),
    addDay: day => repository.addDay(TRIP_ID, day),
    approvePlace: (placeId, targetDayId) => repository.approvePlace(TRIP_ID, placeId, targetDayId),
    addPendingPlace: place => repository.addPendingPlace(TRIP_ID, place),
    deletePendingPlace: placeId => repository.deletePendingPlace(TRIP_ID, placeId),
    addChatMessage: message => repository.addChatMessage(TRIP_ID, message),
  }));

  // Subscribed AFTER `create()` returns: the repository fires each callback
  // synchronously once, and `store.setState` must exist first — calling
  // setState from inside the zustand initializer is discarded once the
  // initializer's return value is assigned as the store's initial state.
  repository.subscribeItinerary(TRIP_ID, itinerary => store.setState({ itinerary }));
  repository.subscribePins(TRIP_ID, pins => store.setState({ pins }));
  repository.subscribePendingPlaces(TRIP_ID, pendingPlaces => store.setState({ pendingPlaces }));
  repository.subscribeChat(TRIP_ID, chatMessages => store.setState({ chatMessages }));

  return store;
}

export const useTripStore = createTripStore(defaultRepository);
