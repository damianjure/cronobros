import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, afterEach, beforeAll, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Formal rules-unit-testing coverage for `firestore.rules` (already deployed
// to the real project — see firestore.rules' header comment). Exercises the
// exact scenarios from sdd/cronobros-firebase spec's "Security rules reject
// unauthorized access" and "No owner-count guard" domains, against the real
// rule source (not a copy), via the local Firestore emulator on port 8080.
//
// Uses `testEnv.authenticatedContext(uid)` (not real sign-in) to fabricate
// arbitrary uids — the right tool for rules-unit-testing, which validates
// against `request.auth` without needing a real auth token.
let testEnv: RulesTestEnvironment;

const OWNER_UID = 'owner-1';
const EDITOR_UID = 'editor-1';
const VIEWER_UID = 'viewer-1';
const OUTSIDER_UID = 'outsider-1';

function tripWithMembers(members: Record<string, 'owner' | 'editor' | 'viewer'>) {
  return {
    id: 'trip-1',
    name: 'Test Trip',
    ownerUid: OWNER_UID,
    members,
    memberUids: Object.keys(members),
  };
}

async function seedTrip(tripId: string, data: Record<string, unknown>): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async context => {
    await setDoc(doc(context.firestore(), 'trips', tripId), data);
  });
}

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-cronobros-rules-test',
    firestore: {
      rules: readFileSync(resolve(__dirname, '../firestore.rules'), 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('firestore.rules', () => {
  it('rejects a read from a user not present in memberUids', async () => {
    await seedTrip('trip-1', tripWithMembers({ [OWNER_UID]: 'owner' }));
    const outsiderDb = testEnv.authenticatedContext(OUTSIDER_UID).firestore();

    await assertFails(getDoc(doc(outsiderDb, 'trips', 'trip-1')));
  });

  it('allows a read from a user present in memberUids', async () => {
    await seedTrip('trip-1', tripWithMembers({ [OWNER_UID]: 'owner' }));
    const ownerDb = testEnv.authenticatedContext(OWNER_UID).firestore();

    await assertSucceeds(getDoc(doc(ownerDb, 'trips', 'trip-1')));
  });

  it('rejects a viewer write to a subcollection under the trip', async () => {
    await seedTrip('trip-1', tripWithMembers({ [OWNER_UID]: 'owner', [VIEWER_UID]: 'viewer' }));
    const viewerDb = testEnv.authenticatedContext(VIEWER_UID).firestore();

    await assertFails(
      setDoc(doc(viewerDb, 'trips', 'trip-1', 'itineraryDays', 'day-1'), { dayNumber: 1, activities: [] }),
    );
  });

  it('allows an editor to write to a subcollection under the trip', async () => {
    await seedTrip('trip-1', tripWithMembers({ [OWNER_UID]: 'owner', [EDITOR_UID]: 'editor' }));
    const editorDb = testEnv.authenticatedContext(EDITOR_UID).firestore();

    await assertSucceeds(
      setDoc(doc(editorDb, 'trips', 'trip-1', 'itineraryDays', 'day-1'), { dayNumber: 1, activities: [] }),
    );
  });

  it('rejects an editor changing the trip membership', async () => {
    await seedTrip('trip-1', tripWithMembers({ [OWNER_UID]: 'owner', [EDITOR_UID]: 'editor' }));
    const editorDb = testEnv.authenticatedContext(EDITOR_UID).firestore();

    await assertFails(
      updateDoc(doc(editorDb, 'trips', 'trip-1'), {
        members: { [OWNER_UID]: 'owner', [EDITOR_UID]: 'viewer' },
        memberUids: [OWNER_UID, EDITOR_UID],
      }),
    );
  });

  it('allows the owner to change trip membership', async () => {
    await seedTrip('trip-1', tripWithMembers({ [OWNER_UID]: 'owner', [EDITOR_UID]: 'editor' }));
    const ownerDb = testEnv.authenticatedContext(OWNER_UID).firestore();

    await assertSucceeds(
      updateDoc(doc(ownerDb, 'trips', 'trip-1'), {
        members: { [OWNER_UID]: 'owner', [EDITOR_UID]: 'viewer' },
        memberUids: [OWNER_UID, EDITOR_UID],
      }),
    );
  });

  it('allows the last owner to remove themselves, orphaning the trip with zero owners', async () => {
    await seedTrip('trip-1', tripWithMembers({ [OWNER_UID]: 'owner', [VIEWER_UID]: 'viewer' }));
    const ownerDb = testEnv.authenticatedContext(OWNER_UID).firestore();

    await assertSucceeds(
      updateDoc(doc(ownerDb, 'trips', 'trip-1'), {
        members: { [VIEWER_UID]: 'viewer' },
        memberUids: [VIEWER_UID],
      }),
    );
  });

  it('allows the last owner to demote themselves without requiring another owner first', async () => {
    await seedTrip('trip-1', tripWithMembers({ [OWNER_UID]: 'owner' }));
    const ownerDb = testEnv.authenticatedContext(OWNER_UID).firestore();

    await assertSucceeds(
      updateDoc(doc(ownerDb, 'trips', 'trip-1'), {
        members: { [OWNER_UID]: 'editor' },
        memberUids: [OWNER_UID],
      }),
    );
  });
});
