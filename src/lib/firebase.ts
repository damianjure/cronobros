import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { initializeFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { USE_FIREBASE_EMULATORS } from './devFlags';

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
  ...(USE_FIREBASE_EMULATORS ? { projectId: 'demo-cronobros-test' } : {}),
};

const app = initializeApp(firebaseConfig);

// App Check tokens aren't valid against the emulators, and there is no
// emulator for the App Check service itself — skip it entirely rather than
// have every emulator-backed call silently fail App Check verification.
const appCheckSiteKey = import.meta.env.VITE_FIREBASE_APP_CHECK_SITE_KEY as string | undefined;
if (appCheckSiteKey && typeof window !== 'undefined' && !USE_FIREBASE_EMULATORS) {
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
}

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

if (USE_FIREBASE_EMULATORS) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
}
