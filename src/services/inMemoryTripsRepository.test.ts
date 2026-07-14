import { describe, it, expect, vi } from 'vitest';
import { InMemoryTripsRepository } from './inMemoryTripsRepository';

describe('InMemoryTripsRepository', () => {
  describe('createTrip', () => {
    it('sets the creator as owner in both members and memberUids (spec: Trip creation)', async () => {
      const repo = new InMemoryTripsRepository();
      const cb = vi.fn();
      repo.subscribeTrips('user-1', cb);

      await repo.createTrip('Islandia 2026', 'user-1');

      const latest = cb.mock.calls.at(-1)![0];
      expect(latest).toHaveLength(1);
      expect(latest[0]).toMatchObject({
        name: 'Islandia 2026',
        ownerUid: 'user-1',
        members: { 'user-1': 'owner' },
        memberUids: ['user-1'],
      });
    });
  });

  describe('subscribeTrips', () => {
    it('filters trips to only those where memberUids contains the given uid (spec: List my trips)', async () => {
      const repo = new InMemoryTripsRepository();
      await repo.createTrip('Mi viaje', 'user-1');
      await repo.createTrip('Viaje ajeno', 'user-2');

      const cb = vi.fn();
      repo.subscribeTrips('user-1', cb);

      const latest = cb.mock.calls.at(-1)![0];
      expect(latest).toHaveLength(1);
      expect(latest[0].name).toBe('Mi viaje');
    });

    it('fires again on each mutation and stops firing after unsubscribe', async () => {
      const repo = new InMemoryTripsRepository();
      const cb = vi.fn();
      const unsubscribe = repo.subscribeTrips('user-1', cb);

      await repo.createTrip('Viaje', 'user-1');
      expect(cb).toHaveBeenCalledTimes(2);

      unsubscribe();
      await repo.createTrip('Otro viaje', 'user-1');
      expect(cb).toHaveBeenCalledTimes(2);
    });
  });

  describe('deleteTrip', () => {
    it('removes the trip so it no longer appears for any member', async () => {
      const repo = new InMemoryTripsRepository();
      await repo.createTrip('Viaje', 'user-1');
      const cb = vi.fn();
      repo.subscribeTrips('user-1', cb);
      const tripId = cb.mock.calls.at(-1)![0][0].id;

      await repo.deleteTrip(tripId);

      expect(cb.mock.calls.at(-1)![0]).toHaveLength(0);
    });
  });
});
