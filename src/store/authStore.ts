import { create } from 'zustand';
import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export type AuthStatus = 'loading' | 'in' | 'out';

export interface AuthState {
  user: User | null;
  status: AuthStatus;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * App-global auth state (spec: auth-gate domain). Kept as its own store,
 * separate from trip data, since sign-in status is orthogonal to which trip
 * (if any) is selected — see design decision "Auth state".
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'loading',
  error: null,
  signIn: async () => {
    set({ error: null });
    try {
      await signInWithRedirect(auth, new GoogleAuthProvider());
    } catch (err) {
      console.error('signIn failed', err);
      set({ error: 'No pudimos iniciar sesión. Intentá de nuevo.' });
    }
  },
  signOut: async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('signOut failed', err);
      set({ error: 'No pudimos cerrar sesión. Intentá de nuevo.' });
    }
  },
}));

// Registered once at module load, after `create()` returns, so `setState`
// exists before Firebase can invoke the callback (same ordering rationale
// as tripStore's `subscribe*` calls).
onAuthStateChanged(auth, user => {
  useAuthStore.setState({ user, status: user ? 'in' : 'out' });
});

// Completes the redirect flow started by `signIn`. A successful result is
// already picked up by `onAuthStateChanged` above; this only needs to surface
// failures (e.g. third-party storage restrictions), which otherwise fail
// silently and leave the user stuck on the sign-in screen with no feedback.
getRedirectResult(auth).catch(err => {
  console.error('getRedirectResult failed', err);
  useAuthStore.setState({ error: 'No pudimos completar el inicio de sesión. Intentá de nuevo.' });
});
