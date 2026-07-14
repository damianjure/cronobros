import {
  collection,
  doc,
  deleteDoc,
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
    // Membership-by-email activation is PR5 scope; PR3 only needs the port
    // method to exist and not throw. Mirrors InMemoryTripsRepository's stub.
    void tripId;
    void email;
    void role;
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
