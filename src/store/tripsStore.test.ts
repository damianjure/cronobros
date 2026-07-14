import { describe, it, expect } from 'vitest';
import { createTripsStore } from './tripsStore';
import { InMemoryTripsRepository } from '../services/inMemoryTripsRepository';

describe('tripsStore', () => {
  it('starts empty and does not subscribe until subscribeToUser is called', () => {
    const repo = new InMemoryTripsRepository();
    const store = createTripsStore(repo);

    expect(store.getState().trips).toEqual([]);
  });

  it('subscribeToUser populates trips for the given uid and stays reactive to mutations', async () => {
    const repo = new InMemoryTripsRepository();
    const store = createTripsStore(repo);

    store.getState().subscribeToUser('user-1');
    await store.getState().createTrip('Islandia 2026', 'user-1');

    expect(store.getState().trips).toHaveLength(1);
    expect(store.getState().trips[0].name).toBe('Islandia 2026');
  });

  it('deleteTrip removes the trip from the store reactively', async () => {
    const repo = new InMemoryTripsRepository();
    const store = createTripsStore(repo);

    store.getState().subscribeToUser('user-1');
    await store.getState().createTrip('Islandia 2026', 'user-1');
    const tripId = store.getState().trips[0].id;

    await store.getState().deleteTrip(tripId);

    expect(store.getState().trips).toHaveLength(0);
  });

  it('two independent stores over two independent repositories do not share state', async () => {
    const storeA = createTripsStore(new InMemoryTripsRepository());
    const storeB = createTripsStore(new InMemoryTripsRepository());
    storeA.getState().subscribeToUser('user-1');
    storeB.getState().subscribeToUser('user-1');

    await storeA.getState().createTrip('Viaje A', 'user-1');

    expect(storeA.getState().trips).toHaveLength(1);
    expect(storeB.getState().trips).toHaveLength(0);
  });
});
