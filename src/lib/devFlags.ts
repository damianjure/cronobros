/**
 * Temporary dev-comfort switch, requested explicitly by the user during
 * Phase 1 (cronobros-firebase) implementation: skip the mandatory auth gate
 * so trip UI is reachable without signing in while developing PR2+.
 *
 * Flip back to `true` before any real usage/deploy — the auth-gate spec
 * requirement ("mandatory authentication gate") is otherwise unmet.
 */
export const AUTH_GATE_ENABLED = false;
