const { after, before, beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');
const { initializeApp, deleteApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { activatePendingInvitesForUser } = require('../lib/invitations');

process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080';

const app = initializeApp({ projectId: 'demo-cronobros-test' }, 'functions-invitations-test');
const db = getFirestore(app);
const tripRef = db.collection('trips').doc('functions-invite-test');

before(async () => {
  await tripRef.delete();
});

beforeEach(async () => {
  await tripRef.set({
    id: tripRef.id,
    name: 'Viaje invitado',
    ownerUid: 'owner-1',
    members: { 'owner-1': 'owner' },
    memberUids: ['owner-1'],
    pendingMemberships: {
      'friend.smith@example.com': {
        email: 'friend.smith@example.com',
        role: 'editor',
        pending: true,
      },
    },
    pendingEmails: ['friend.smith@example.com'],
  });
});

test('activates matching pending invites with Admin SDK permissions', async () => {
  const result = await activatePendingInvitesForUser(
    db,
    'invitee-1',
    'Friend.Smith@Example.com',
  );

  assert.deepEqual(result, { activatedTripIds: [tripRef.id] });
  const trip = (await tripRef.get()).data();
  assert.equal(trip.members['invitee-1'], 'editor');
  assert.deepEqual(trip.memberUids, ['owner-1', 'invitee-1']);
  assert.deepEqual(trip.pendingMemberships, {});
  assert.deepEqual(trip.pendingEmails, []);
});

test('writes the invitee display name into memberProfiles when a profile is provided', async () => {
  await activatePendingInvitesForUser(db, 'invitee-1', 'friend.smith@example.com', {
    name: 'Friend Smith',
    photo: 'https://example.com/photo.jpg',
  });

  const trip = (await tripRef.get()).data();
  assert.deepEqual(trip.memberProfiles['invitee-1'], {
    name: 'Friend Smith',
    photo: 'https://example.com/photo.jpg',
  });
});

test('does not write a memberProfiles entry when no name is provided', async () => {
  await activatePendingInvitesForUser(db, 'invitee-1', 'friend.smith@example.com');

  const trip = (await tripRef.get()).data();
  assert.equal(trip.memberProfiles, undefined);
});

test('is idempotent when no pending invite remains', async () => {
  await activatePendingInvitesForUser(db, 'invitee-1', 'friend.smith@example.com');

  const result = await activatePendingInvitesForUser(
    db,
    'invitee-1',
    'friend.smith@example.com',
  );

  assert.deepEqual(result, { activatedTripIds: [] });
});

after(async () => {
  await tripRef.delete();
  await deleteApp(app);
});
