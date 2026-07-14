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
 * "Friends/participants"). No per-member display-name/avatar profile is
 * stored anywhere (`Trip.members` is only `uid -> Role`, and extending its
 * value shape would break `firestore.rules`' `roleIn()`, which reads it as a
 * plain role string) — so every member other than the current signed-in user
 * is labeled by a short, honest placeholder rather than a fabricated name.
 * Pending (not-yet-activated) invitees are listed by email.
 */
export function getTripParticipants(
  trip: Trip | null,
  currentUser: CurrentUserLabel | null,
): string[] {
  if (!trip) return [];

  const memberLabels = trip.memberUids.map(uid => {
    if (uid === currentUser?.uid && currentUser.label) return currentUser.label;
    return `Miembro ${uid}`;
  });

  const pendingLabels = Object.values(trip.pendingMemberships ?? {})
    .filter(membership => membership.pending)
    .map(membership => `${membership.email} (pendiente)`);

  return [...memberLabels, ...pendingLabels];
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
