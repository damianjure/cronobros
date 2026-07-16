import { onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { activatePendingInvitesForUser } from './invitations';
import { extractTravelActivities, extractTravelDocument, validateTravelDocument } from './smartImport';

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

  const result = await activatePendingInvitesForUser(getFirestore(), uid, email);
  logger.info('pending_invites_activation_completed', { uid });
  return result;
});

export const importTravelText = onCall(
  { timeoutSeconds: 120, memory: '512MiB' },
  async request => {
    if (!request.auth?.uid) {
      throw new HttpsError('unauthenticated', 'Authentication is required.');
    }
    const text = request.data?.text;
    if (typeof text !== 'string' || text.trim().length < 10) {
      throw new HttpsError('invalid-argument', 'Travel text is required.');
    }
    if (text.length > 20_000) {
      throw new HttpsError('invalid-argument', 'Travel text is too long.');
    }
    const startedAt = Date.now();
    try {
      const result = await extractTravelActivities(text.trim());
      logger.info('smart_import_text_completed', { uid: request.auth.uid, durationMs: Date.now() - startedAt, activityCount: result.activities.length, textLength: text.length });
      return result;
    } catch (error) {
      logger.error('smart_import_text_failed', { uid: request.auth.uid, durationMs: Date.now() - startedAt, error: error instanceof Error ? error.message : 'unknown' });
      throw new HttpsError('internal', 'Could not extract travel activities.');
    }
  },
);

export const importTravelDocument = onCall(
  { timeoutSeconds: 120, memory: '1GiB' },
  async request => {
    if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'Authentication is required.');
    let document: { data: string; mimeType: string };
    try {
      document = validateTravelDocument(request.data?.data, request.data?.mimeType);
    } catch (error) {
      throw new HttpsError('invalid-argument', error instanceof Error ? error.message : 'Invalid document.');
    }
    const startedAt = Date.now();
    try {
      const result = await extractTravelDocument(document.data, document.mimeType);
      logger.info('smart_import_document_completed', { uid: request.auth.uid, durationMs: Date.now() - startedAt, activityCount: result.activities.length, mimeType: document.mimeType, encodedBytes: document.data.length });
      return result;
    } catch (error) {
      logger.error('smart_import_document_failed', { uid: request.auth.uid, durationMs: Date.now() - startedAt, mimeType: document.mimeType, error: error instanceof Error ? error.message : 'unknown' });
      throw new HttpsError('internal', 'Could not extract travel activities.');
    }
  },
);
