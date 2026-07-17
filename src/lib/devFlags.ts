/**
 * Temporary dev-comfort switch, requested explicitly by the user during
 * Phase 1 (cronobros-firebase) implementation: skip the mandatory auth gate
 * so trip UI is reachable without signing in while developing PR2+.
 *
 * Re-enabled once PR3 connected the app to the REAL crono-viajes-1779401310
 * Firestore project with real owner/editor/viewer rules deployed — those
 * rules require a genuine signed-in `request.auth.uid`, so bypassing sign-in
 * now only produces permission-denied errors, not a usable dev flow.
 */
export const AUTH_GATE_ENABLED = true;

/**
 * Points the app at the local Firebase Emulator Suite (Auth :9099, Firestore
 * :8080, Functions :5001) instead of the real crono-viajes project, via
 * `VITE_USE_FIREBASE_EMULATORS=true` in `.env.local` — never committed as
 * `true` in any shared env file. Lets the full signed-in UI (real
 * `AUTH_GATE_ENABLED` gate, real Google Sign-In via the Auth emulator's test
 * accounts) be driven locally without touching production data, without
 * hand-rewiring `src/lib/firebase.ts` each time (see the audit session's
 * throwaway version of this flag in Engram).
 */
export const USE_FIREBASE_EMULATORS = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';
