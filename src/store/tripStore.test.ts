import { describe, it, expect } from 'vitest';
import { createTripStore, TRIP_ID } from './tripStore';
import { InMemoryTripRepository } from '../services/inMemoryTripRepository';
import type { ItineraryDay, PendingPlace } from '../types';

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

describe('tripStore', () => {
  it('hydrates itinerary/pins/pendingPlaces/chatMessages from the repository on creation', () => {
    const seedDays = [makeDay()];
    const repo = new InMemoryTripRepository({ itinerary: seedDays, pendingPlaces: [], pins: [], chat: [] });

    const store = createTripStore(repo);

    expect(store.getState().itinerary).toEqual(seedDays);
    expect(store.getState().pendingPlaces).toEqual([]);
    expect(store.getState().pins).toEqual([]);
    expect(store.getState().chatMessages).toEqual([]);
  });

  it('addActivity delegates to the repository and updates store state reactively', async () => {
    const repo = new InMemoryTripRepository({ itinerary: [makeDay()] });
    const store = createTripStore(repo);

    await store.getState().addActivity('day-1', {
      id: 'act-1',
      time: '10:00 AM',
      type: 'Dining',
      title: 'Cena',
      description: '',
    });

    expect(store.getState().itinerary[0].activities).toHaveLength(1);
  });

  it('deleteActivity delegates to the repository and updates store state reactively', async () => {
    const repo = new InMemoryTripRepository({
      itinerary: [
        makeDay({
          activities: [{ id: 'act-1', time: '10:00 AM', type: 'Dining', title: 'Cena', description: '' }],
        }),
      ],
    });
    const store = createTripStore(repo);

    await store.getState().deleteActivity('day-1', 'act-1');

    expect(store.getState().itinerary[0].activities).toHaveLength(0);
  });

  it('approvePlace moves a pending place into the itinerary and updates all affected slices', async () => {
    const place: PendingPlace = {
      id: 'pending-1',
      title: 'Lugar',
      category: 'Turismo',
      description: 'desc',
      location: 'loc',
    };
    const repo = new InMemoryTripRepository({
      itinerary: [makeDay()],
      pendingPlaces: [place],
      pins: [],
    });
    const store = createTripStore(repo);

    await store.getState().approvePlace('pending-1', 'day-1');

    expect(store.getState().itinerary[0].activities).toHaveLength(1);
    expect(store.getState().pendingPlaces).toHaveLength(0);
    expect(store.getState().pins).toHaveLength(1);
  });

  it('two independent stores over two independent repositories do not share state', async () => {
    const repoA = new InMemoryTripRepository({ itinerary: [makeDay({ id: 'a' })] });
    const repoB = new InMemoryTripRepository({ itinerary: [makeDay({ id: 'b' })] });
    const storeA = createTripStore(repoA);
    const storeB = createTripStore(repoB);

    await storeA.getState().addActivity('a', {
      id: 'act-1',
      time: '10:00 AM',
      type: 'Dining',
      title: 'Cena',
      description: '',
    });

    expect(storeA.getState().itinerary[0].activities).toHaveLength(1);
    expect(storeB.getState().itinerary[0].activities).toHaveLength(0);
  });

  it('exposes a stable TRIP_ID used for all repository calls', () => {
    expect(typeof TRIP_ID).toBe('string');
    expect(TRIP_ID.length).toBeGreaterThan(0);
  });
});
