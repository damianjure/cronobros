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

  it('archives and restores a trip without deleting memberships', async () => {
    const repo = new InMemoryTripsRepository();
    await repo.createTrip('Viaje', 'user-1');
    const cb = vi.fn();
    repo.subscribeTrips('user-1', cb);
    const tripId = cb.mock.calls.at(-1)![0][0].id;
    await repo.setArchived(tripId, true);
    expect(cb.mock.calls.at(-1)![0][0].archivedAt).toEqual(expect.any(String));
    await repo.setArchived(tripId, false);
    expect(cb.mock.calls.at(-1)![0][0]).toMatchObject({ archivedAt: null, memberUids: ['user-1'] });
  });

  describe('inviteMember (spec: "Owner/editor invites a collaborator by email")', () => {
    it('writes a pending membership record keyed by email, without touching members/memberUids', async () => {
      const repo = new InMemoryTripsRepository();
      await repo.createTrip('Viaje', 'user-1');
      const cb = vi.fn();
      repo.subscribeTrips('user-1', cb);
      const tripId = cb.mock.calls.at(-1)![0][0].id;

      await repo.inviteMember(tripId, 'friend@example.com', 'editor');

      const trip = cb.mock.calls.at(-1)![0][0];
      expect(trip.pendingMemberships).toEqual({
        'friend@example.com': { email: 'friend@example.com', role: 'editor', pending: true },
      });
      expect(trip.members).toEqual({ 'user-1': 'owner' });
      expect(trip.memberUids).toEqual(['user-1']);
    });
  });

  it('cancels a pending invitation without changing active members', async () => {
    const repo = new InMemoryTripsRepository();
    await repo.createTrip('Viaje', 'user-1');
    const cb = vi.fn();
    repo.subscribeTrips('user-1', cb);
    const tripId = cb.mock.calls.at(-1)![0][0].id;
    await repo.inviteMember(tripId, 'friend@example.com', 'editor');
    await repo.cancelInvite(tripId, 'friend@example.com');
    expect(cb.mock.calls.at(-1)![0][0]).toMatchObject({ pendingMemberships: {}, members: { 'user-1': 'owner' } });
  });

  describe('activatePendingInvites (spec: "Invited user signs in and membership activates")', () => {
    it('promotes a matching pending invite into members/memberUids and clears the pending record', async () => {
      const repo = new InMemoryTripsRepository();
      await repo.createTrip('Viaje', 'user-1');
      const ownerCb = vi.fn();
      repo.subscribeTrips('user-1', ownerCb);
      const tripId = ownerCb.mock.calls.at(-1)![0][0].id;
      await repo.inviteMember(tripId, 'friend@example.com', 'editor');

      await repo.activatePendingInvites('user-2', 'friend@example.com');

      const invitedCb = vi.fn();
      repo.subscribeTrips('user-2', invitedCb);
      const trip = invitedCb.mock.calls.at(-1)![0][0];
      expect(trip.members).toEqual({ 'user-1': 'owner', 'user-2': 'editor' });
      expect(trip.memberUids).toEqual(['user-1', 'user-2']);
      expect(trip.pendingMemberships).toEqual({});
    });

    it('is a no-op when no trip has a pending invite for the given email', async () => {
      const repo = new InMemoryTripsRepository();
      await repo.createTrip('Viaje', 'user-1');

      await expect(repo.activatePendingInvites('user-2', 'nobody@example.com')).resolves.toBeUndefined();
    });
  });
});
