import type {
  ItineraryDay,
  ItineraryActivity,
  PinnedPoint,
  PendingPlace,
  ChatMessage,
  TripLogistics,
} from '../types';

export type Unsubscribe = () => void;

/**
 * Data-access seam for trip/itinerary/pins/pending-places/chat data (Phase 0
 * design, PR2). Today `InMemoryTripRepository` implements this over `data.ts`;
 * Phase 1 swaps in a `FirestoreTripRepository` with zero changes to consumers.
 *
 * Load-bearing shape: reads are realtime `subscribe*` methods returning an
 * `Unsubscribe`, NOT Promise-returning getters — this is what makes a future
 * Firestore `onSnapshot` adapter a drop-in replacement.
 */
export interface TripRepository {
  subscribeItinerary(tripId: string, cb: (days: ItineraryDay[]) => void): Unsubscribe;
  subscribePins(tripId: string, cb: (pins: PinnedPoint[]) => void): Unsubscribe;
  subscribePendingPlaces(tripId: string, cb: (places: PendingPlace[]) => void): Unsubscribe;
  subscribeChat(tripId: string, cb: (messages: ChatMessage[]) => void): Unsubscribe;

  addActivity(tripId: string, dayId: string, activity: ItineraryActivity): Promise<void>;
  deleteActivity(tripId: string, dayId: string, activityId: string): Promise<void>;
  approvePlace(tripId: string, placeId: string, targetDayId: string): Promise<void>;
  addPendingPlace(tripId: string, place: PendingPlace): Promise<void>;
  addChatMessage(tripId: string, message: ChatMessage): Promise<void>;

  // NOT enumerated in the Phase 0 design's illustrative port sketch (which
  // listed addActivity/deleteActivity/approvePlace/addPendingPlace/
  // addChatMessage). Added during PR2 apply because removing alert()/prompt()
  // (task 2.8) and making itinerary/pendingPlaces single-source-of-truth
  // (task 2.6) requires these two existing mutations to also go through the
  // repository instead of bypassing it via direct setState. Same
  // command+subscribe shape, same Firestore-compatibility rationale. Flagged
  // here rather than silently added — see apply-progress deviation note.
  deletePendingPlace(tripId: string, placeId: string): Promise<void>;
  updateActivityPeople(
    tripId: string,
    dayId: string,
    activityId: string,
    people: string[],
  ): Promise<void>;

  // Also not in the original sketch: creating a new itinerary day (the
  // "Seleccionar Día" calendar path in ItineraryView's add-activity form,
  // when the picked date has no existing day yet) needs to persist a whole
  // new ItineraryDay, sorted and re-numbered — addActivity alone (which
  // assumes dayId already exists) can't express that.
  addDay(tripId: string, day: ItineraryDay): Promise<void>;

  // PR5: LogisticsView's drivers/vehicle had no Firestore-backed home (design
  // deferred this explicitly). Same subscribe/mutate shape as the rest of
  // this port — a brand-new trip has no drivers and no vehicle, so this must
  // default to an empty state, not Iceland's fixture data.
  subscribeLogistics(tripId: string, cb: (logistics: TripLogistics) => void): Unsubscribe;
  updateLogistics(tripId: string, logistics: TripLogistics): Promise<void>;
}
