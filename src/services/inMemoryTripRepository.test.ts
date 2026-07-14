import { describe, it, expect, vi } from 'vitest';
import { InMemoryTripRepository } from './inMemoryTripRepository';
import type { ItineraryDay, PendingPlace, ChatMessage } from '../types';

const TRIP_ID = 'trip-1';

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

describe('InMemoryTripRepository', () => {
  describe('subscribeItinerary', () => {
    it('fires the callback synchronously once with the current snapshot', () => {
      const seedDays = [makeDay()];
      const repo = new InMemoryTripRepository({ itinerary: seedDays });
      const cb = vi.fn();

      repo.subscribeItinerary(TRIP_ID, cb);

      expect(cb).toHaveBeenCalledTimes(1);
      expect(cb).toHaveBeenCalledWith(seedDays);
    });

    it('fires again on each mutation and stops firing after unsubscribe', async () => {
      const repo = new InMemoryTripRepository({ itinerary: [makeDay()] });
      const cb = vi.fn();
      const unsubscribe = repo.subscribeItinerary(TRIP_ID, cb);

      await repo.addActivity(TRIP_ID, 'day-1', {
        id: 'act-1',
        time: '10:00 AM',
        type: 'Sightseeing',
        title: 'Nueva actividad',
        description: '',
      });

      expect(cb).toHaveBeenCalledTimes(2);

      unsubscribe();
      await repo.addActivity(TRIP_ID, 'day-1', {
        id: 'act-2',
        time: '11:00 AM',
        type: 'Sightseeing',
        title: 'Otra actividad',
        description: '',
      });

      expect(cb).toHaveBeenCalledTimes(2);
    });
  });

  describe('addActivity / deleteActivity', () => {
    it('adds an activity to the target day only', async () => {
      const repo = new InMemoryTripRepository({
        itinerary: [makeDay({ id: 'day-1' }), makeDay({ id: 'day-2' })],
      });
      const cb = vi.fn();
      repo.subscribeItinerary(TRIP_ID, cb);

      await repo.addActivity(TRIP_ID, 'day-1', {
        id: 'act-1',
        time: '10:00 AM',
        type: 'Dining',
        title: 'Cena',
        description: '',
      });

      const latest = cb.mock.calls[cb.mock.calls.length - 1][0] as ItineraryDay[];
      expect(latest.find(d => d.id === 'day-1')?.activities).toHaveLength(1);
      expect(latest.find(d => d.id === 'day-2')?.activities).toHaveLength(0);
    });

    it('removes an activity by id', async () => {
      const repo = new InMemoryTripRepository({
        itinerary: [
          makeDay({
            activities: [
              { id: 'act-1', time: '10:00 AM', type: 'Dining', title: 'Cena', description: '' },
            ],
          }),
        ],
      });
      const cb = vi.fn();
      repo.subscribeItinerary(TRIP_ID, cb);

      await repo.deleteActivity(TRIP_ID, 'day-1', 'act-1');

      const latest = cb.mock.calls[cb.mock.calls.length - 1][0] as ItineraryDay[];
      expect(latest[0].activities).toHaveLength(0);
    });
  });

  describe('addDay', () => {
    it('inserts a new day, sorts by date, and re-numbers all days', async () => {
      const repo = new InMemoryTripRepository({
        itinerary: [
          makeDay({ id: 'day-1', date: '2026-08-12', dayNumber: 1 }),
          makeDay({ id: 'day-2', date: '2026-08-14', dayNumber: 2 }),
        ],
      });
      const cb = vi.fn();
      repo.subscribeItinerary(TRIP_ID, cb);

      await repo.addDay(TRIP_ID, makeDay({ id: 'day-new', date: '2026-08-13', dayNumber: 0 }));

      const latest = cb.mock.calls[cb.mock.calls.length - 1][0] as ItineraryDay[];
      expect(latest.map(d => d.id)).toEqual(['day-1', 'day-new', 'day-2']);
      expect(latest.map(d => d.dayNumber)).toEqual([1, 2, 3]);
    });
  });

  describe('updateActivityPeople', () => {
    it('replaces the people list on the matching activity only', async () => {
      const repo = new InMemoryTripRepository({
        itinerary: [
          makeDay({
            activities: [
              { id: 'act-1', time: '10:00 AM', type: 'Dining', title: 'Cena', description: '', people: ['Alex Thorne'] },
            ],
          }),
        ],
      });
      const cb = vi.fn();
      repo.subscribeItinerary(TRIP_ID, cb);

      await repo.updateActivityPeople(TRIP_ID, 'day-1', 'act-1', ['Alex Thorne', 'Sarah Miller']);

      const latest = cb.mock.calls[cb.mock.calls.length - 1][0] as ItineraryDay[];
      expect(latest[0].activities[0].people).toEqual(['Alex Thorne', 'Sarah Miller']);
    });
  });

  describe('addPendingPlace / deletePendingPlace', () => {
    it('prepends a new pending place', async () => {
      const repo = new InMemoryTripRepository({ pendingPlaces: [] });
      const cb = vi.fn();
      repo.subscribePendingPlaces(TRIP_ID, cb);

      const place = makePendingPlace();
      await repo.addPendingPlace(TRIP_ID, place);

      const latest = cb.mock.calls[cb.mock.calls.length - 1][0] as PendingPlace[];
      expect(latest).toEqual([place]);
    });

    it('removes a pending place by id', async () => {
      const place = makePendingPlace();
      const repo = new InMemoryTripRepository({ pendingPlaces: [place] });
      const cb = vi.fn();
      repo.subscribePendingPlaces(TRIP_ID, cb);

      await repo.deletePendingPlace(TRIP_ID, place.id);

      const latest = cb.mock.calls[cb.mock.calls.length - 1][0] as PendingPlace[];
      expect(latest).toEqual([]);
    });
  });

  describe('approvePlace', () => {
    it('moves a pending place into the target day, drops a map pin, and removes it from pending', async () => {
      const place = makePendingPlace({ category: 'Aventura', people: ['James'] });
      const repo = new InMemoryTripRepository({
        itinerary: [makeDay({ id: 'day-1' })],
        pendingPlaces: [place],
        pins: [],
      });

      const itineraryCb = vi.fn();
      const pinsCb = vi.fn();
      const pendingCb = vi.fn();
      repo.subscribeItinerary(TRIP_ID, itineraryCb);
      repo.subscribePins(TRIP_ID, pinsCb);
      repo.subscribePendingPlaces(TRIP_ID, pendingCb);

      await repo.approvePlace(TRIP_ID, place.id, 'day-1');

      const latestItinerary = itineraryCb.mock.calls[itineraryCb.mock.calls.length - 1][0] as ItineraryDay[];
      const latestPins = pinsCb.mock.calls[pinsCb.mock.calls.length - 1][0];
      const latestPending = pendingCb.mock.calls[pendingCb.mock.calls.length - 1][0] as PendingPlace[];

      expect(latestItinerary[0].activities).toHaveLength(1);
      expect(latestItinerary[0].activities[0].title).toBe(place.title);
      expect(latestItinerary[0].activities[0].type).toBe('Adventure');
      expect(latestItinerary[0].activities[0].people).toEqual(['James']);
      expect(latestPins).toHaveLength(1);
      expect(latestPending).toHaveLength(0);
    });

    it('falls back to the full friends list when the pending place has no people', async () => {
      const place = makePendingPlace({ people: undefined });
      const repo = new InMemoryTripRepository({
        itinerary: [makeDay({ id: 'day-1' })],
        pendingPlaces: [place],
      });
      const itineraryCb = vi.fn();
      repo.subscribeItinerary(TRIP_ID, itineraryCb);

      await repo.approvePlace(TRIP_ID, place.id, 'day-1');

      const latestItinerary = itineraryCb.mock.calls[itineraryCb.mock.calls.length - 1][0] as ItineraryDay[];
      expect(latestItinerary[0].activities[0].people?.length).toBeGreaterThan(1);
    });

    it('is a no-op when the place does not exist', async () => {
      const repo = new InMemoryTripRepository({ itinerary: [makeDay({ id: 'day-1' })], pendingPlaces: [] });
      const itineraryCb = vi.fn();
      repo.subscribeItinerary(TRIP_ID, itineraryCb);

      await repo.approvePlace(TRIP_ID, 'does-not-exist', 'day-1');

      expect(itineraryCb).toHaveBeenCalledTimes(1); // only the initial synchronous fire
    });
  });

  describe('addChatMessage', () => {
    it('appends a message to the chat log', async () => {
      const repo = new InMemoryTripRepository({ chat: [] });
      const cb = vi.fn();
      repo.subscribeChat(TRIP_ID, cb);

      const message: ChatMessage = {
        id: 'msg-1',
        sender: { name: 'Alex', avatar: 'a.png' },
        content: 'Hola',
        timestamp: '10:00 AM',
      };
      await repo.addChatMessage(TRIP_ID, message);

      const latest = cb.mock.calls[cb.mock.calls.length - 1][0] as ChatMessage[];
      expect(latest).toEqual([message]);
    });
  });
});
