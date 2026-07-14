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
