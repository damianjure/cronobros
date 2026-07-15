import { onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { activatePendingInvitesForUser } from './invitations';

initializeApp();

/**
 * Delete cascade (design decision "Delete cascade"): the client owner-delete
 * only removes the `trips/{id}` document itself (see
 * `FirestoreTripsRepository.deleteTrip`) — it cannot safely recurse into
 * rule-protected subcollections (`itineraryDays`, `pins`, `pendingPlaces`,
 * `chat`) from the client. This trigger fires once the trip doc is gone and
 * uses the Admin SDK (which bypasses security rules) to recursively delete
 * everything left under it. A brief orphan window between trip-doc deletion
 * and this trigger completing is an accepted tradeoff (design: "simplest
 * option").
 */
export const cascadeDeleteTripSubcollections = onDocumentDeleted('trips/{tripId}', async event => {
  const tripRef = event.data?.ref;
  if (!tripRef) return;
  await getFirestore().recursiveDelete(tripRef);
});

export const activatePendingInvites = onCall(async request => {
  const uid = request.auth?.uid;
  const email = request.auth?.token.email;
  if (!uid) {
    throw new HttpsError('unauthenticated', 'Authentication is required.');
  }
  if (typeof email !== 'string' || email.trim() === '') {
    throw new HttpsError('failed-precondition', 'The authenticated account has no email.');
  }

  return activatePendingInvitesForUser(getFirestore(), uid, email);
});
