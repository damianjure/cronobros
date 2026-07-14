import { describe, it, expect } from 'vitest';
import { getTripParticipants } from './participants';
import type { Trip } from '../types';

function makeTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: 'trip-1',
    name: 'Viaje',
    ownerUid: 'owner-1',
    members: { 'owner-1': 'owner' },
    memberUids: ['owner-1'],
    ...overrides,
  };
}

describe('getTripParticipants (drops the global `friends` fixture — real trip membership IS the participant list now)', () => {
  it('returns an empty list when there is no current trip', () => {
    expect(getTripParticipants(null, null)).toEqual([]);
  });

  it('labels the current signed-in user with their real display name', () => {
    const trip = makeTrip();
    const result = getTripParticipants(trip, { uid: 'owner-1', label: 'Alex' });
    expect(result).toEqual(['Alex']);
  });

  it('labels other members (no profile data available) with a short uid-based label', () => {
    const trip = makeTrip({
      members: { 'owner-1': 'owner', 'editor-1': 'editor' },
      memberUids: ['owner-1', 'editor-1'],
    });
    const result = getTripParticipants(trip, { uid: 'owner-1', label: 'Alex' });
    expect(result).toEqual(['Alex', 'Miembro editor-1']);
  });

  it('appends pending invitees by email, marked as pending', () => {
    const trip = makeTrip({
      pendingMemberships: {
        'friend@example.com': { email: 'friend@example.com', role: 'viewer', pending: true },
      },
    });
    const result = getTripParticipants(trip, { uid: 'owner-1', label: 'Alex' });
    expect(result).toEqual(['Alex', 'friend@example.com (pendiente)']);
  });

  it('a genuinely empty new trip has only its owner as a participant', () => {
    const trip = makeTrip();
    const result = getTripParticipants(trip, null);
    expect(result).toEqual(['Miembro owner-1']);
  });
});
