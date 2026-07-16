import type { ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';
import { AUTH_GATE_ENABLED } from '../lib/devFlags';

interface AuthGateProps {
  children: ReactNode;
}

/**
 * Mandatory authentication gate (spec: auth-gate domain). Wraps `<App>` in
 * `main.tsx` — while status is `loading`/`out`, no trip UI mounts, so no
 * component depending on `useTripStore`/Firestore subscriptions ever runs.
 */
export default function AuthGate({ children }: AuthGateProps) {
  const status = useAuthStore(state => state.status);
  const signIn = useAuthStore(state => state.signIn);
  const error = useAuthStore(state => state.error);

  if (!AUTH_GATE_ENABLED) {
    return <>{children}</>;
  }

  if (status === 'loading') {
    return (
      <div role="status" className="flex min-h-screen items-center justify-center bg-brand-background">
        <span className="sr-only">Cargando</span>
        <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'out') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-background p-6">
        <div className="max-w-sm w-full text-center space-y-6">
          <h1 className="font-serif text-2xl font-black italic text-brand-primary">Cronobros</h1>
          <p className="text-sm text-brand-on-surface-variant">
            Iniciá sesión para ver y editar tus viajes.
          </p>
          <button
            onClick={() => signIn()}
            className="w-full py-3 bg-brand-primary hover:bg-brand-primary-container text-white rounded-xl font-bold text-sm transition-all cursor-pointer"
          >
            Iniciar sesión con Google
          </button>
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
