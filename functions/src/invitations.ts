import type { Firestore } from 'firebase-admin/firestore';

interface PendingMembership {
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  pending: boolean;
}

interface TripInviteData {
  members?: Record<string, string>;
  memberUids?: string[];
  pendingMemberships?: Record<string, PendingMembership>;
  pendingEmails?: string[];
}

export function normalizeInviteEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Activates invitations with Admin SDK permissions. The caller identity is
 * supplied exclusively by the callable's verified auth context; client data
 * is never trusted for uid/email selection.
 */
export async function activatePendingInvitesForUser(
  db: Firestore,
  uid: string,
  email: string,
): Promise<{ activatedTripIds: string[] }> {
  const normalizedEmail = normalizeInviteEmail(email);
  const snapshot = await db
    .collection('trips')
    .where('pendingEmails', 'array-contains', normalizedEmail)
    .get();

  const activatedTripIds = (
    await Promise.all(
      snapshot.docs.map(async tripDoc => {
        return db.runTransaction(async transaction => {
          const freshSnapshot = await transaction.get(tripDoc.ref);
          if (!freshSnapshot.exists) return null;

          const trip = freshSnapshot.data() as TripInviteData;
          const pendingMemberships = trip.pendingMemberships ?? {};
          const pending = pendingMemberships[normalizedEmail];
          if (!pending?.pending) return null;

          const { [normalizedEmail]: _activated, ...remainingPending } = pendingMemberships;
          void _activated;
          const memberUids = trip.memberUids ?? [];

          transaction.update(tripDoc.ref, {
            members: { ...(trip.members ?? {}), [uid]: pending.role },
            memberUids: memberUids.includes(uid) ? memberUids : [...memberUids, uid],
            pendingMemberships: remainingPending,
            pendingEmails: (trip.pendingEmails ?? []).filter(value => value !== normalizedEmail),
          });

          return tripDoc.id;
        });
      }),
    )
  ).filter((tripId): tripId is string => tripId !== null);

  return { activatedTripIds: activatedTripIds.sort() };
}
