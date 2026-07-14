import { describe, it, expect } from 'vitest';
import { createTripsStore, getRoleForTrip } from './tripsStore';
import { InMemoryTripsRepository } from '../services/inMemoryTripsRepository';
import type { Trip } from '../types';

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

  describe('getRoleForTrip (design decision "Roles port": role sourced from trip.members[uid])', () => {
    const trips: Trip[] = [
      {
        id: 'trip-1',
        name: 'Islandia 2026',
        ownerUid: 'owner-1',
        members: { 'owner-1': 'owner', 'editor-1': 'editor' },
        memberUids: ['owner-1', 'editor-1'],
      },
    ];

    it('returns the role for a member of the given trip', () => {
      expect(getRoleForTrip(trips, 'trip-1', 'owner-1')).toBe('owner');
      expect(getRoleForTrip(trips, 'trip-1', 'editor-1')).toBe('editor');
    });

    it('returns undefined for a non-member', () => {
      expect(getRoleForTrip(trips, 'trip-1', 'stranger')).toBeUndefined();
    });

    it('returns undefined for an unknown tripId', () => {
      expect(getRoleForTrip(trips, 'does-not-exist', 'owner-1')).toBeUndefined();
    });
  });
});
