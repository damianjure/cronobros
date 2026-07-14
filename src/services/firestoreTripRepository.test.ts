import { afterAll, beforeAll } from 'vitest';
import { initializeApp, deleteApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type Auth,
} from 'firebase/auth';
import {
  initializeFirestore,
  connectFirestoreEmulator,
  doc,
  setDoc,
  collection,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { FirestoreTripRepository } from './firestoreTripRepository';
import { runTripRepositoryContractTests, type TripRepositorySeed } from './tripRepository.contract';

// Runs the SAME contract suite that InMemoryTripRepository.test.ts runs
// (spec "firestore-trip-data": zero behavior drift), against a real
// Firestore emulator instance — not a mocked SDK. Requires the emulator
// running locally (`firebase emulators:start --only firestore,auth
// --project demo-cronobros-test`). Rules are the REAL owner/editor/viewer
// rules (advanced ahead of PR4), so every write needs an authenticated,
// trip-member uid — hence the anonymous sign-in below.
const testApp = initializeApp(
  { projectId: 'demo-cronobros-test', apiKey: 'demo-key' },
  'firestore-trip-repo-test',
);
const testAuth: Auth = getAuth(testApp);
connectAuthEmulator(testAuth, 'http://127.0.0.1:9099', { disableWarnings: true });
const testDb = initializeFirestore(testApp, { ignoreUndefinedProperties: true });
connectFirestoreEmulator(testDb, '127.0.0.1', 8080);

let testUid = '';

// A stable email/password identity (not `signInAnonymously`, which mints a
// fresh uid every run) so the deterministic tripIds this suite reuses always
// have the SAME owner across repeated `vitest run` invocations against the
// same long-lived emulator — otherwise a later run's uid can't satisfy the
// update rule on a trip doc a previous run's (different) uid still owns.
async function signInStableTestUser(auth: Auth, email: string, password: string) {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch {
    return await createUserWithEmailAndPassword(auth, email, password);
  }
}

beforeAll(async () => {
  const credential = await signInStableTestUser(testAuth, 'firestore-trip-repo-test@cronobros.test', 'test-password-123');
  testUid = credential.user.uid;
});

const TRIP_SUBCOLLECTIONS = ['itineraryDays', 'pins', 'pendingPlaces', 'chat'] as const;

// The emulator is a shared, long-lived process across test runs (not reset
// between `vitest run` invocations), and tripIds are deterministic per test
// name — without this, leftover documents from a prior run silently corrupt
// this run's assertions (e.g. addDay's renumbering count).
async function clearTrip(tripId: string): Promise<void> {
  const batch = writeBatch(testDb);
  for (const sub of TRIP_SUBCOLLECTIONS) {
    const snapshot = await getDocs(collection(testDb, 'trips', tripId, sub));
    snapshot.docs.forEach(d => batch.delete(d.ref));
  }
  await batch.commit();
}

// Rules gate every subcollection read/write on the parent `trips/{id}` doc's
// `members`/`memberUids` — without this, an otherwise-valid signed-in write
// is rejected because `get(trips/$(tripId))` finds no document at all.
async function ensureTripDoc(tripId: string): Promise<void> {
  await setDoc(doc(collection(testDb, 'trips'), tripId), {
    id: tripId,
    name: 'Test trip',
    ownerUid: testUid,
    members: { [testUid]: 'owner' },
    memberUids: [testUid],
  });
}

async function seedTrip(tripId: string, seed: TripRepositorySeed = {}): Promise<void> {
  await ensureTripDoc(tripId);
  await clearTrip(tripId);
  const writes: Promise<void>[] = [];
  for (const day of seed.itinerary ?? []) {
    writes.push(setDoc(doc(collection(testDb, 'trips', tripId, 'itineraryDays'), day.id), day));
  }
  for (const pin of (seed.pins ?? []) as Array<{ id: string }>) {
    writes.push(setDoc(doc(collection(testDb, 'trips', tripId, 'pins'), pin.id), pin));
  }
  for (const place of seed.pendingPlaces ?? []) {
    writes.push(setDoc(doc(collection(testDb, 'trips', tripId, 'pendingPlaces'), place.id), place));
  }
  for (const message of seed.chat ?? []) {
    writes.push(setDoc(doc(collection(testDb, 'trips', tripId, 'chat'), message.id), message));
  }
  await Promise.all(writes);
}

runTripRepositoryContractTests('FirestoreTripRepository', async (tripId, seed) => {
  await seedTrip(tripId, seed);
  return new FirestoreTripRepository(testDb);
});

afterAll(async () => {
  await deleteApp(testApp);
});
