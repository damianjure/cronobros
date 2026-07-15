import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// Firebase Web SDK config is non-secret (restricted by referrer/API key
// rules on the Firebase project itself), but still injected via `VITE_`
// env vars rather than hardcoded — see `.env.example` and design decision
// "Firebase init" (sdd/cronobros-firebase/design).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const functions = getFunctions(app);

// `ignoreUndefinedProperties` (PR3, sdd/cronobros-firebase): several domain
// types have optional fields (e.g. `ItineraryActivity.people`) that are
// frequently `undefined`. The default Firestore client throws on `undefined`
// in `setDoc`/`updateDoc` payloads; `InMemoryTripRepository` has no such
// restriction, so this setting is required for `FirestoreTripRepository` to
// match its "zero behavior drift" contract instead of throwing on writes the
// in-memory adapter accepts silently.
export const db = initializeFirestore(app, { ignoreUndefinedProperties: true });
