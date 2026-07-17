import {
  arrayUnion,
  arrayRemove,
  collection,
  doc,
  deleteDoc,
  deleteField,
  FieldPath,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  type CollectionReference,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore';
import type { Trip, Role, MemberProfile } from '../types';
import type { Unsubscribe } from './ports';
import type { TripsRepository } from './tripsPort';
import { db as defaultDb } from '../lib/firebase';
import {
  activatePendingInvitesCallable,
  type PendingInvitesActivator,
} from './pendingInvitesCallable';

/**
 * Firestore adapter for `TripsRepository` (design decision "Trip/membership
 * ops"), same pattern as `FirestoreTripRepository`: constructor takes an
 * optional `Firestore` instance (defaulting to the app's shared `db`) so
 * tests can inject an emulator-connected instance. `trips/{id}` layout per
 * design's "Firestore Layout": `{name, ownerUid, members, memberUids}`.
 *
 * `inviteMember` only writes the membership-record shape described by spec's
 * "Invite creates a pending membership record" requirement; activation on
 * sign-in (matching email -> uid, promoting into `members`/`memberUids`) is
 * PR5 scope, same as the `InMemoryTripsRepository` stub it replaces.
 */
export class FirestoreTripsRepository implements TripsRepository {
  private readonly db: Firestore;
  private readonly pendingInvitesActivator: PendingInvitesActivator;

  constructor(
    firestoreDb: Firestore = defaultDb,
    pendingInvitesActivator: PendingInvitesActivator = activatePendingInvitesCallable,
  ) {
    this.db = firestoreDb;
    this.pendingInvitesActivator = pendingInvitesActivator;
  }

  private tripsRef(): CollectionReference<DocumentData> {
    return collection(this.db, 'trips');
  }

  subscribeTrips(uid: string, cb: (trips: Trip[]) => void): Unsubscribe {
    const q = query(this.tripsRef(), where('memberUids', 'array-contains', uid));
    return onSnapshot(q, snapshot => {
      cb(snapshot.docs.map(d => d.data() as Trip));
    });
  }

  async createTrip(name: string, ownerUid: string, ownerProfile?: MemberProfile): Promise<void> {
    const tripDocRef = doc(this.tripsRef());
    const trip: Trip = {
      id: tripDocRef.id,
      name,
      ownerUid,
      members: { [ownerUid]: 'owner' },
      memberUids: [ownerUid],
      ...(ownerProfile ? { memberProfiles: { [ownerUid]: ownerProfile } } : {}),
    };
    await setDoc(tripDocRef, trip);
  }

  async deleteTrip(tripId: string): Promise<void> {
    // Only removes the trip doc itself — recursive subcollection cleanup is
    // the Cloud Function's job (design decision "Delete cascade"), PR4.
    await deleteDoc(doc(this.tripsRef(), tripId));
  }

  async setArchived(tripId: string, archived: boolean): Promise<void> {
    await updateDoc(doc(this.tripsRef(), tripId), { archivedAt: archived ? new Date().toISOString() : null });
  }

  async inviteMember(tripId: string, email: string, role: Role): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    // `pendingMemberships` is additive (untouched by `firestore.rules`'
    // `membershipUnchanged()` guard), so an owner/editor's write here is
    // allowed by the existing rules with zero rule changes. `pendingEmails`
    // is a flattened array mirror of `pendingMemberships`' keys so
    // `activatePendingInvites` can query by email with `array-contains`
    // (map keys aren't directly queryable in Firestore). Uses `FieldPath`
    // (not a template-string dot-path) because emails contain literal dots,
    // which Firestore's string dot-path parser would otherwise misread as
    // nested-field separators.
    await updateDoc(
      doc(this.tripsRef(), tripId),
      new FieldPath('pendingMemberships', normalizedEmail),
      { email: normalizedEmail, role, pending: true },
      new FieldPath('pendingEmails'),
      arrayUnion(normalizedEmail),
    );
  }

  async cancelInvite(tripId: string, email: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    await updateDoc(
      doc(this.tripsRef(), tripId),
      new FieldPath('pendingMemberships', normalizedEmail),
      deleteField(),
      new FieldPath('pendingEmails'),
      arrayRemove(normalizedEmail),
    );
  }

  /**
   * Delegates activation to a callable Cloud Function. The server derives
   * uid/email from the verified Firebase Auth context and uses Admin SDK, so
   * an invitee never needs pre-membership read access to the trip document.
   */
  async activatePendingInvites(uid: string, email: string): Promise<void> {
    await this.pendingInvitesActivator(uid, email.trim().toLowerCase());
  }

  async updateRole(tripId: string, uid: string, role: Role): Promise<void> {
    await updateDoc(doc(this.tripsRef(), tripId), { [`members.${uid}`]: role });
  }

  async removeMember(tripId: string, uid: string): Promise<void> {
    const tripDocRef = doc(this.tripsRef(), tripId);
    const snapshot = await getDoc(tripDocRef);
    if (!snapshot.exists()) return;
    const trip = snapshot.data() as Trip;
    const { [uid]: _removed, ...members } = trip.members;
    void _removed;
    await updateDoc(tripDocRef, {
      members,
      memberUids: trip.memberUids.filter(memberUid => memberUid !== uid),
    });
  }
}
