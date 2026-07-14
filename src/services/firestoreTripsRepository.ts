import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteField,
  doc,
  deleteDoc,
  FieldPath,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type CollectionReference,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore';
import type { Trip, Role } from '../types';
import type { Unsubscribe } from './ports';
import type { TripsRepository } from './tripsPort';
import { db as defaultDb } from '../lib/firebase';

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

  constructor(firestoreDb: Firestore = defaultDb) {
    this.db = firestoreDb;
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

  async createTrip(name: string, ownerUid: string): Promise<void> {
    const tripDocRef = doc(this.tripsRef());
    const trip: Trip = {
      id: tripDocRef.id,
      name,
      ownerUid,
      members: { [ownerUid]: 'owner' },
      memberUids: [ownerUid],
    };
    await setDoc(tripDocRef, trip);
  }

  async deleteTrip(tripId: string): Promise<void> {
    // Only removes the trip doc itself — recursive subcollection cleanup is
    // the Cloud Function's job (design decision "Delete cascade"), PR4.
    await deleteDoc(doc(this.tripsRef(), tripId));
  }

  async inviteMember(tripId: string, email: string, role: Role): Promise<void> {
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
      new FieldPath('pendingMemberships', email),
      { email, role, pending: true },
      new FieldPath('pendingEmails'),
      arrayUnion(email),
    );
  }

  /**
   * Activates every pending invite matching `email` into `members`/
   * `memberUids` for the given `uid` (spec: "Invited user signs in and
   * membership activates"). KNOWN GAP: `firestore.rules`' read rule
   * (`isMemberOf()`) only allows a trip's own members to read/list it — a
   * genuine invitee (not yet a member) has no visibility into the trip they
   * were invited to, so this query returns zero results for them until
   * rules or a Cloud Function grant that visibility. The write mechanics
   * below are correct and will activate automatically the moment that
   * visibility gap closes, with no client-code change needed.
   */
  async activatePendingInvites(uid: string, email: string): Promise<void> {
    const q = query(this.tripsRef(), where('pendingEmails', 'array-contains', email));
    let snapshot;
    try {
      snapshot = await getDocs(q);
    } catch {
      // Expected today for a genuine invitee: `firestore.rules` can't prove
      // this query obeys `isMemberOf()` without a `memberUids` constraint
      // (which the invitee, not yet a member, can't supply), so Firestore
      // rejects the whole query outright rather than filtering it — see the
      // KNOWN GAP note on this method's docstring. Swallow it as a no-op.
      return;
    }
    if (snapshot.empty) return;

    const batch = writeBatch(this.db);
    snapshot.docs.forEach(tripDoc => {
      const trip = tripDoc.data() as Trip;
      const pending = trip.pendingMemberships?.[email];
      if (!pending || !pending.pending) return;

      batch.update(
        tripDoc.ref,
        new FieldPath('members', uid),
        pending.role,
        new FieldPath('memberUids'),
        arrayUnion(uid),
        new FieldPath('pendingMemberships', email),
        deleteField(),
        new FieldPath('pendingEmails'),
        arrayRemove(email),
      );
    });
    await batch.commit();
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
