import { useContext } from 'react';
import type { Trip } from '../types';
import { useAuthStore } from './authStore';
import { CurrentTripContext } from './currentTripContext';

export interface CurrentUserLabel {
  uid: string;
  label?: string;
}

/**
 * Pure participant-list derivation (PR5: drop the global `friends` fixture —
 * a trip's real membership IS its participant list now, per design decision
 * "Friends/participants"). Only actual members are returned — pending
 * invitees are surfaced separately via `getTripPendingInvitesCount`, since
 * they can't be assigned to activities/places yet and shouldn't inflate any
 * "N participants"/"N active" count. A member's real name comes from
 * `trip.memberProfiles` (written at trip creation / invite activation); a
 * member with no stored profile is labeled by a short, honest placeholder
 * rather than a fabricated name.
 */
export function getTripParticipants(
  trip: Trip | null,
  currentUser: CurrentUserLabel | null,
): string[] {
  if (!trip) return [];

  return trip.memberUids.map(uid => {
    if (uid === currentUser?.uid && currentUser.label) return currentUser.label;
    const profileName = trip.memberProfiles?.[uid]?.name;
    return profileName ?? `Miembro ${uid}`;
  });
}

/** Count of not-yet-activated invites — shown separately from the member count/list. */
export function getTripPendingInvitesCount(trip: Trip | null): number {
  if (!trip) return 0;
  return Object.values(trip.pendingMemberships ?? {}).filter(membership => membership.pending).length;
}

/** React hook wiring: current trip (context) + signed-in user (authStore). */
export function useTripParticipants(): string[] {
  const trip = useContext(CurrentTripContext);
  const user = useAuthStore(state => state.user);
  const currentUser: CurrentUserLabel | null = user
    ? { uid: user.uid, label: user.displayName ?? user.email ?? undefined }
    : null;
  return getTripParticipants(trip, currentUser);
}

/** React hook wiring for `getTripPendingInvitesCount`. */
export function useTripPendingInvitesCount(): number {
  const trip = useContext(CurrentTripContext);
  return getTripPendingInvitesCount(trip);
}
