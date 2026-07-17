import { describe, it, expect } from 'vitest';
import { getTripParticipants, getTripPendingInvitesCount } from './participants';
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

  it('labels other members with their stored profile name when available', () => {
    const trip = makeTrip({
      members: { 'owner-1': 'owner', 'editor-1': 'editor' },
      memberUids: ['owner-1', 'editor-1'],
      memberProfiles: { 'editor-1': { name: 'Damian Jure' } },
    });
    const result = getTripParticipants(trip, { uid: 'owner-1', label: 'Alex' });
    expect(result).toEqual(['Alex', 'Damian Jure']);
  });

  it('labels other members with a placeholder when no profile data is available', () => {
    const trip = makeTrip({
      members: { 'owner-1': 'owner', 'editor-1': 'editor' },
      memberUids: ['owner-1', 'editor-1'],
    });
    const result = getTripParticipants(trip, { uid: 'owner-1', label: 'Alex' });
    expect(result).toEqual(['Alex', 'Miembro editor-1']);
  });

  it('does not include pending invitees in the participant list', () => {
    const trip = makeTrip({
      pendingMemberships: {
        'friend@example.com': { email: 'friend@example.com', role: 'viewer', pending: true },
      },
    });
    const result = getTripParticipants(trip, { uid: 'owner-1', label: 'Alex' });
    expect(result).toEqual(['Alex']);
  });

  it('a genuinely empty new trip has only its owner as a participant', () => {
    const trip = makeTrip();
    const result = getTripParticipants(trip, null);
    expect(result).toEqual(['Miembro owner-1']);
  });
});

describe('getTripPendingInvitesCount', () => {
  it('returns 0 when there is no current trip', () => {
    expect(getTripPendingInvitesCount(null)).toBe(0);
  });

  it('returns 0 when there are no pending invites', () => {
    expect(getTripPendingInvitesCount(makeTrip())).toBe(0);
  });

  it('counts only still-pending memberships', () => {
    const trip = makeTrip({
      pendingMemberships: {
        'friend@example.com': { email: 'friend@example.com', role: 'viewer', pending: true },
        'activated@example.com': { email: 'activated@example.com', role: 'editor', pending: false },
      },
    });
    expect(getTripPendingInvitesCount(trip)).toBe(1);
  });
});
