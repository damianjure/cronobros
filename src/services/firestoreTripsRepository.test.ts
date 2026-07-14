import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, signInAnonymously, type Auth } from 'firebase/auth';
import {
  initializeFirestore,
  connectFirestoreEmulator,
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { FirestoreTripsRepository } from './firestoreTripsRepository';

// Runs directly against a real local Firestore emulator instance (not
// mocked), same pattern as firestoreTripRepository.test.ts: requires the
// emulator running locally (`firebase emulators:start --only firestore,auth
// --project demo-cronobros-test`). Rules are the REAL owner/editor/viewer
// rules (advanced ahead of PR4), so createTrip/deleteTrip/updateRole/
// removeMember all need to be performed as an authenticated uid that
// actually matches the trip's ownerUid/role — hence signing in anonymously
// and using that single real uid as the "current actor" in every test.
// Uids like 'editor-1'/'editor-2' below are pure data (members being
// modified/removed), never the acting party, so they stay as plain strings.
const testApp = initializeApp(
  { projectId: 'demo-cronobros-test', apiKey: 'demo-key' },
  'firestore-trips-repo-test',
);
const testAuth: Auth = getAuth(testApp);
connectAuthEmulator(testAuth, 'http://127.0.0.1:9099', { disableWarnings: true });
const testDb = initializeFirestore(testApp, { ignoreUndefinedProperties: true });
connectFirestoreEmulator(testDb, '127.0.0.1', 8080);

const repo = new FirestoreTripsRepository(testDb);

let testUid = '';

beforeAll(async () => {
  const credential = await signInAnonymously(testAuth);
  testUid = credential.user.uid;
});

// The emulator is a shared, long-lived process across test runs — clear the
// trips collection before each test so leftover documents from a prior run
// don't corrupt this run's `subscribeTrips` assertions (same lesson learned
// fixing firestoreTripRepository.test.ts's seed-cleanup bug).
// An unfiltered scan of the whole `trips` collection can't satisfy the real
// rules (Firestore can't prove a `list` obeys `resource.data.memberUids`
// checks without a matching `where` clause) — every trip this file creates
// has `testUid` as a member, so scoping the cleanup query the same way the
// rule does is both correct and sufficient.
async function clearAllTrips(): Promise<void> {
  const snapshot = await getDocs(query(collection(testDb, 'trips'), where('memberUids', 'array-contains', testUid)));
  if (snapshot.empty) return;
  const batch = writeBatch(testDb);
  snapshot.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
}

async function waitForLatestCall<T>(
  cb: ReturnType<typeof vi.fn>,
  predicate: (value: T) => boolean,
  timeoutMs = 4000,
): Promise<T> {
  const start = Date.now();
  for (;;) {
    if (cb.mock.calls.length > 0) {
      const latest = cb.mock.calls[cb.mock.calls.length - 1][0] as T;
      if (predicate(latest)) return latest;
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error(
        `Timed out after ${timeoutMs}ms waiting for callback state. Calls so far: ${cb.mock.calls.length}`,
      );
    }
    await new Promise(resolve => setTimeout(resolve, 20));
  }
}

describe('FirestoreTripsRepository', () => {
  beforeEach(async () => {
    await clearAllTrips();
  });

  it('createTrip writes a trip with the creator as sole owner, and subscribeTrips delivers it for that uid', async () => {
    const cb = vi.fn();
    const unsubscribe = repo.subscribeTrips(testUid, cb);

    await repo.createTrip('Islandia 2026', testUid);

    const latest = await waitForLatestCall<{ id: string; name: string }[]>(cb, trips => trips.length === 1);
    expect(latest[0].name).toBe('Islandia 2026');

    unsubscribe();
  });

  it('subscribeTrips only delivers trips where memberUids contains the given uid', async () => {
    // The security rule only lets a client list trips filtered by their OWN
    // uid (a query for someone else's uid is rejected outright, which is
    // correct — see firestore.rules), so proving isolation needs a second
    // real signed-in identity, not an arbitrary string passed as the filter.
    await repo.createTrip('Viaje de owner-2', testUid);

    const outsiderApp = initializeApp(
      { projectId: 'demo-cronobros-test', apiKey: 'demo-key' },
      'firestore-trips-repo-test-outsider',
    );
    const outsiderAuth = getAuth(outsiderApp);
    connectAuthEmulator(outsiderAuth, 'http://127.0.0.1:9099', { disableWarnings: true });
    const outsiderDb = initializeFirestore(outsiderApp, { ignoreUndefinedProperties: true });
    connectFirestoreEmulator(outsiderDb, '127.0.0.1', 8080);
    const outsiderCredential = await signInAnonymously(outsiderAuth);
    const outsiderRepo = new FirestoreTripsRepository(outsiderDb);

    const cb = vi.fn();
    const unsubscribe = outsiderRepo.subscribeTrips(outsiderCredential.user.uid, cb);
    await new Promise(resolve => setTimeout(resolve, 500));

    expect(cb.mock.calls.at(-1)?.[0]).toEqual([]);
    unsubscribe();
    await deleteApp(outsiderApp);
  });

  it('deleteTrip removes the trip document', async () => {
    const cb = vi.fn();
    const unsubscribe = repo.subscribeTrips(testUid, cb);
    await repo.createTrip('Viaje a borrar', testUid);
    const created = await waitForLatestCall<{ id: string }[]>(cb, trips => trips.length === 1);

    await repo.deleteTrip(created[0].id);

    await waitForLatestCall<{ id: string }[]>(cb, trips => trips.length === 0);
    unsubscribe();
  });

  it('updateRole updates a single member role without touching other members', async () => {
    const cb = vi.fn();
    const unsubscribe = repo.subscribeTrips(testUid, cb);
    await repo.createTrip('Viaje con roles', testUid);
    const created = await waitForLatestCall<{ id: string; members: Record<string, string> }[]>(
      cb,
      trips => trips.length === 1,
    );
    const tripId = created[0].id;
    await writeBatch(testDb)
      .update(doc(testDb, 'trips', tripId), { members: { [testUid]: 'owner', 'editor-1': 'editor' }, memberUids: [testUid, 'editor-1'] })
      .commit();

    await repo.updateRole(tripId, 'editor-1', 'viewer');

    const latest = await waitForLatestCall<{ members: Record<string, string> }[]>(
      cb,
      trips => trips[0]?.members?.['editor-1'] === 'viewer',
    );
    expect(latest[0].members).toEqual({ [testUid]: 'owner', 'editor-1': 'viewer' });
    unsubscribe();
  });

  it('removeMember removes the uid from both members and memberUids', async () => {
    const cb = vi.fn();
    const unsubscribe = repo.subscribeTrips(testUid, cb);
    await repo.createTrip('Viaje con miembro a remover', testUid);
    const created = await waitForLatestCall<{ id: string }[]>(cb, trips => trips.length === 1);
    const tripId = created[0].id;
    await writeBatch(testDb)
      .update(doc(testDb, 'trips', tripId), {
        members: { [testUid]: 'owner', 'editor-2': 'editor' },
        memberUids: [testUid, 'editor-2'],
      })
      .commit();

    await repo.removeMember(tripId, 'editor-2');

    const latest = await waitForLatestCall<{ members: Record<string, string>; memberUids: string[] }[]>(
      cb,
      trips => !('editor-2' in (trips[0]?.members ?? {})),
    );
    expect(latest[0].memberUids).toEqual([testUid]);
    unsubscribe();
  });

  it('inviteMember does not throw (membership-by-email activation is PR5 scope)', async () => {
    await expect(repo.inviteMember('some-trip-id', 'friend@example.com', 'editor')).resolves.toBeUndefined();
  });
});

afterAll(async () => {
  await clearAllTrips();
  await deleteApp(testApp);
});
