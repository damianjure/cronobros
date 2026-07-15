import { describe, it, expect, vi } from 'vitest';
import type {
  ItineraryDay,
  PendingPlace,
  ChatMessage,
  TripLogistics,
  CriticalEvent,
} from '../types';
import type { TripRepository } from './ports';

export interface TripRepositorySeed {
  itinerary?: ItineraryDay[];
  pins?: unknown[];
  pendingPlaces?: PendingPlace[];
  chat?: ChatMessage[];
  logistics?: TripLogistics;
  criticalEvents?: CriticalEvent[];
}

function makeDay(overrides: Partial<ItineraryDay> = {}): ItineraryDay {
  return {
    id: 'day-1',
    dayNumber: 1,
    date: '2026-08-12',
    dayOfWeek: 'Lunes',
    title: 'Día de prueba',
    location: 'Islandia',
    activities: [],
    ...overrides,
  };
}

function makePendingPlace(overrides: Partial<PendingPlace> = {}): PendingPlace {
  return {
    id: 'pending-1',
    title: 'Lugar de prueba',
    category: 'Turismo',
    description: 'Descripción de prueba',
    location: 'Reikiavik',
    ...overrides,
  };
}

/**
 * Polls a mocked callback's calls until `predicate` matches the latest
 * delivered value. `InMemoryTripRepository` fires `subscribe*` callbacks
 * synchronously, so this resolves on the first poll for it. Real Firestore
 * `onSnapshot` (even against the local emulator) is inherently async/
 * eventually-consistent — there is no synchronous "first callback"
 * guarantee — so the shared contract asserts on EVENTUAL delivered state
 * rather than exact synchronous call counts. This is a disclosed, deliberate
 * adaptation of the contract to real-world Firestore timing, not a relaxed
 * pass condition: the FINAL observable state asserted is identical for both
 * adapters.
 */
async function waitForLatestCall<T>(
  cb: ReturnType<typeof vi.fn>,
  predicate: (value: T) => boolean,
  timeoutMs = 4000,
): Promise<T> {
  const start = Date.now();
  for (;;) {
    if (cb.mock.calls.length > 0) {
      const latest = cb.mock.calls[cb.mock.calls.length - 1][0] as T;
      if (predicate(latest)) return latest;
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error(
        `Timed out after ${timeoutMs}ms waiting for callback state. Calls so far: ${cb.mock.calls.length}`,
      );
    }
    await new Promise(resolve => setTimeout(resolve, 20));
  }
}

/**
 * Shared behavioral contract for any `TripRepository` implementation (spec
 * "firestore-trip-data" domain: "no behavior drift" requirement). Both
 * `InMemoryTripRepository` and `FirestoreTripRepository` run this SAME suite
 * unmodified — only the `createRepo` factory (and each trip's id, to avoid
 * cross-test collisions on a shared backend like the Firestore emulator)
 * differs per adapter.
 */
export function runTripRepositoryContractTests(
  label: string,
  createRepo: (tripId: string, seed?: TripRepositorySeed) => Promise<TripRepository>,
): void {
  describe(label, () => {
    describe('subscribeItinerary', () => {
      it('eventually delivers the current snapshot to the callback', async () => {
        const tripId = `${label}-itin-snapshot`;
        const seedDays = [makeDay()];
        const repo = await createRepo(tripId, { itinerary: seedDays });
        const cb = vi.fn();

        repo.subscribeItinerary(tripId, cb);

        const latest = await waitForLatestCall<ItineraryDay[]>(cb, () => true);
        expect(latest).toEqual(seedDays);
      });

      it('fires again on each mutation and stops firing after unsubscribe', async () => {
        const tripId = `${label}-itin-mutation`;
        const repo = await createRepo(tripId, { itinerary: [makeDay()] });
        const cb = vi.fn();
        const unsubscribe = repo.subscribeItinerary(tripId, cb);

        await repo.addActivity(tripId, 'day-1', {
          id: 'act-1',
          time: '10:00 AM',
          type: 'Sightseeing',
          title: 'Nueva actividad',
          description: '',
        });

        await waitForLatestCall<ItineraryDay[]>(
          cb,
          days => days.find(d => d.id === 'day-1')?.activities.length === 1,
        );
        const callsBeforeUnsubscribe = cb.mock.calls.length;

        unsubscribe();
        await repo.addActivity(tripId, 'day-1', {
          id: 'act-2',
          time: '11:00 AM',
          type: 'Sightseeing',
          title: 'Otra actividad',
          description: '',
        });
        await new Promise(resolve => setTimeout(resolve, 300));

        expect(cb.mock.calls.length).toBe(callsBeforeUnsubscribe);
      });
    });

    describe('addActivity / deleteActivity', () => {
      it('adds an activity to the target day only', async () => {
        const tripId = `${label}-add-activity`;
        const repo = await createRepo(tripId, {
          itinerary: [makeDay({ id: 'day-1' }), makeDay({ id: 'day-2' })],
        });
        const cb = vi.fn();
        repo.subscribeItinerary(tripId, cb);

        await repo.addActivity(tripId, 'day-1', {
          id: 'act-1',
          time: '10:00 AM',
          type: 'Dining',
          title: 'Cena',
          description: '',
        });

        const latest = await waitForLatestCall<ItineraryDay[]>(
          cb,
          days => (days.find(d => d.id === 'day-1')?.activities.length ?? 0) > 0,
        );
        expect(latest.find(d => d.id === 'day-1')?.activities).toHaveLength(1);
        expect(latest.find(d => d.id === 'day-2')?.activities).toHaveLength(0);
      });

      it('removes an activity by id', async () => {
        const tripId = `${label}-delete-activity`;
        const repo = await createRepo(tripId, {
          itinerary: [
            makeDay({
              activities: [
                { id: 'act-1', time: '10:00 AM', type: 'Dining', title: 'Cena', description: '' },
              ],
            }),
          ],
        });
        const cb = vi.fn();
        repo.subscribeItinerary(tripId, cb);

        await repo.deleteActivity(tripId, 'day-1', 'act-1');

        const latest = await waitForLatestCall<ItineraryDay[]>(
          cb,
          days => days[0]?.activities.length === 0,
        );
        expect(latest[0].activities).toHaveLength(0);
      });
    });

    describe('addDay', () => {
      it('inserts a new day, sorts by date, and re-numbers all days', async () => {
        const tripId = `${label}-add-day`;
        const repo = await createRepo(tripId, {
          itinerary: [
            makeDay({ id: 'day-1', date: '2026-08-12', dayNumber: 1 }),
            makeDay({ id: 'day-2', date: '2026-08-14', dayNumber: 2 }),
          ],
        });
        const cb = vi.fn();
        repo.subscribeItinerary(tripId, cb);

        await repo.addDay(tripId, makeDay({ id: 'day-new', date: '2026-08-13', dayNumber: 0 }));

        const latest = await waitForLatestCall<ItineraryDay[]>(cb, days => days.length === 3);
        expect(latest.map(d => d.id)).toEqual(['day-1', 'day-new', 'day-2']);
        expect(latest.map(d => d.dayNumber)).toEqual([1, 2, 3]);
      });
    });

    describe('updateActivityPeople', () => {
      it('replaces the people list on the matching activity only', async () => {
        const tripId = `${label}-update-people`;
        const repo = await createRepo(tripId, {
          itinerary: [
            makeDay({
              activities: [
                {
                  id: 'act-1',
                  time: '10:00 AM',
                  type: 'Dining',
                  title: 'Cena',
                  description: '',
                  people: ['Alex Thorne'],
                },
              ],
            }),
          ],
        });
        const cb = vi.fn();
        repo.subscribeItinerary(tripId, cb);

        await repo.updateActivityPeople(tripId, 'day-1', 'act-1', ['Alex Thorne', 'Sarah Miller']);

        const latest = await waitForLatestCall<ItineraryDay[]>(
          cb,
          days => (days[0]?.activities[0]?.people?.length ?? 0) === 2,
        );
        expect(latest[0].activities[0].people).toEqual(['Alex Thorne', 'Sarah Miller']);
      });
    });

    describe('addPendingPlace / deletePendingPlace', () => {
      it('adds a new pending place', async () => {
        const tripId = `${label}-add-pending`;
        const repo = await createRepo(tripId, { pendingPlaces: [] });
        const cb = vi.fn();
        repo.subscribePendingPlaces(tripId, cb);

        const place = makePendingPlace();
        await repo.addPendingPlace(tripId, place);

        const latest = await waitForLatestCall<PendingPlace[]>(cb, places => places.length === 1);
        expect(latest).toEqual([place]);
      });

      it('removes a pending place by id', async () => {
        const tripId = `${label}-delete-pending`;
        const place = makePendingPlace();
        const repo = await createRepo(tripId, { pendingPlaces: [place] });
        const cb = vi.fn();
        repo.subscribePendingPlaces(tripId, cb);
        await waitForLatestCall<PendingPlace[]>(cb, places => places.length === 1);

        await repo.deletePendingPlace(tripId, place.id);

        const latest = await waitForLatestCall<PendingPlace[]>(cb, places => places.length === 0);
        expect(latest).toEqual([]);
      });
    });

    describe('approvePlace', () => {
      it('moves a pending place into the target day, drops a map pin, and removes it from pending', async () => {
        const tripId = `${label}-approve`;
        const place = makePendingPlace({ category: 'Aventura', people: ['James'] });
        const repo = await createRepo(tripId, {
          itinerary: [makeDay({ id: 'day-1' })],
          pendingPlaces: [place],
          pins: [],
        });

        const itineraryCb = vi.fn();
        const pinsCb = vi.fn();
        const pendingCb = vi.fn();
        repo.subscribeItinerary(tripId, itineraryCb);
        repo.subscribePins(tripId, pinsCb);
        repo.subscribePendingPlaces(tripId, pendingCb);

        await repo.approvePlace(tripId, place.id, 'day-1');

        const latestItinerary = await waitForLatestCall<ItineraryDay[]>(
          itineraryCb,
          days => (days[0]?.activities.length ?? 0) === 1,
        );
        const latestPins = await waitForLatestCall<unknown[]>(pinsCb, pins => pins.length === 1);
        const latestPending = await waitForLatestCall<PendingPlace[]>(
          pendingCb,
          places => places.length === 0,
        );

        expect(latestItinerary[0].activities).toHaveLength(1);
        expect(latestItinerary[0].activities[0].title).toBe(place.title);
        expect(latestItinerary[0].activities[0].type).toBe('Adventure');
        expect(latestItinerary[0].activities[0].people).toEqual(['James']);
        expect(latestPins).toHaveLength(1);
        expect(latestPending).toHaveLength(0);
      });

      it('leaves people empty when the pending place has none (PR5: no global friends fixture to fall back to)', async () => {
        const tripId = `${label}-approve-fallback`;
        const place = makePendingPlace({ people: undefined });
        const repo = await createRepo(tripId, {
          itinerary: [makeDay({ id: 'day-1' })],
          pendingPlaces: [place],
        });
        const itineraryCb = vi.fn();
        repo.subscribeItinerary(tripId, itineraryCb);

        await repo.approvePlace(tripId, place.id, 'day-1');

        const latestItinerary = await waitForLatestCall<ItineraryDay[]>(
          itineraryCb,
          days => (days[0]?.activities.length ?? 0) === 1,
        );
        expect(latestItinerary[0].activities[0].people).toEqual([]);
      });

      it('is a no-op when the place does not exist', async () => {
        const tripId = `${label}-approve-noop`;
        const repo = await createRepo(tripId, { itinerary: [makeDay({ id: 'day-1' })], pendingPlaces: [] });
        const itineraryCb = vi.fn();
        repo.subscribeItinerary(tripId, itineraryCb);
        await waitForLatestCall<ItineraryDay[]>(itineraryCb, () => true);
        const callsAfterInitial = itineraryCb.mock.calls.length;

        await repo.approvePlace(tripId, 'does-not-exist', 'day-1');
        await new Promise(resolve => setTimeout(resolve, 300));

        expect(itineraryCb.mock.calls.length).toBe(callsAfterInitial);
        const latest = itineraryCb.mock.calls[itineraryCb.mock.calls.length - 1][0] as ItineraryDay[];
        expect(latest[0].activities).toHaveLength(0);
      });
    });

    describe('addChatMessage', () => {
      it('appends a message to the chat log', async () => {
        const tripId = `${label}-chat`;
        const repo = await createRepo(tripId, { chat: [] });
        const cb = vi.fn();
        repo.subscribeChat(tripId, cb);

        const message: ChatMessage = {
          id: 'msg-1',
          sender: { name: 'Alex', avatar: 'a.png' },
          content: 'Hola',
          timestamp: '10:00 AM',
        };
        await repo.addChatMessage(tripId, message);

        const latest = await waitForLatestCall<ChatMessage[]>(cb, messages => messages.length === 1);
        expect(latest).toEqual([message]);
      });
    });

    describe('subscribeLogistics / updateLogistics', () => {
      it('defaults to empty drivers and no vehicle for a brand-new trip', async () => {
        const tripId = `${label}-logistics-default`;
        const repo = await createRepo(tripId, {});
        const cb = vi.fn();
        repo.subscribeLogistics(tripId, cb);

        const latest = await waitForLatestCall<TripLogistics>(cb, () => true);
        expect(latest).toEqual({ drivers: [], vehicle: null });
      });

      it('updateLogistics persists drivers/vehicle and notifies subscribers', async () => {
        const tripId = `${label}-logistics-update`;
        const repo = await createRepo(tripId, {});
        const cb = vi.fn();
        repo.subscribeLogistics(tripId, cb);

        const newLogistics: TripLogistics = {
          drivers: [
            { id: 'drv-1', name: 'Ana', avatar: '', status: 'On Shift', role: 'Conductora', shift: '08:00-14:00' },
          ],
          vehicle: {
            name: 'Van',
            rentalId: 'R-1',
            provider: 'Rentals Co',
            phone: '+1 555',
            dates: '1-10 Ene',
            image: '',
          },
        };
        await repo.updateLogistics(tripId, newLogistics);

        const latest = await waitForLatestCall<TripLogistics>(cb, logistics => logistics.drivers.length === 1);
        expect(latest).toEqual(newLogistics);
      });
    });

    describe('subscribeCriticalEvents', () => {
      it('defaults to no events for a brand-new trip', async () => {
        const tripId = `${label}-critical-events-default`;
        const repo = await createRepo(tripId, {});
        const cb = vi.fn();

        repo.subscribeCriticalEvents(tripId, cb);

        const latest = await waitForLatestCall<CriticalEvent[]>(cb, () => true);
        expect(latest).toEqual([]);
      });

      it('delivers the critical events persisted for the selected trip', async () => {
        const tripId = `${label}-critical-events-seeded`;
        const event: CriticalEvent = {
          id: 'flight-1',
          type: 'flight',
          title: 'Vuelo de regreso',
          subType: 'Vuelo',
          locationName: 'Aeropuerto',
          coords: { lat: -34.8222, lon: -58.5358 },
          targetTimeStr: '18:30',
          description: 'Llegar con anticipación.',
          warningMessage: 'Check-in cierra una hora antes.',
        };
        const repo = await createRepo(tripId, { criticalEvents: [event] });
        const cb = vi.fn();

        repo.subscribeCriticalEvents(tripId, cb);

        const latest = await waitForLatestCall<CriticalEvent[]>(cb, events => events.length === 1);
        expect(latest).toEqual([event]);
      });
    });
  });
}
