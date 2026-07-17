import { useEffect } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import AuthGate from './AuthGate';
import { useAuthStore } from '../store/authStore';
import type { AuthState } from '../store/authStore';

vi.mock('../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('../lib/devFlags', () => ({ AUTH_GATE_ENABLED: true }));

const mockedUseAuthStore = vi.mocked(useAuthStore);

function setAuthState(
  status: AuthState['status'],
  signIn: AuthState['signIn'] = vi.fn(),
  error: AuthState['error'] = null,
) {
  mockedUseAuthStore.mockImplementation(
    <T,>(selector: (state: AuthState) => T) =>
      selector({ user: null, status, error, signIn, signOut: vi.fn() }),
  );
}

// Stands in for real trip-data components. A mount effect proxies for a
// Firestore `subscribe*` call (spec scenario "No data reaches the client
// pre-auth") — real subscriptions only start once a component using
// tripStore actually mounts, so asserting this effect never fires is
// equivalent to asserting no Firestore reads were issued.
function TripUiStub({ onMount }: { onMount: () => void }) {
  useEffect(() => {
    onMount();
  }, [onMount]);
  return <div data-testid="trip-ui">Trip UI</div>;
}

describe('AuthGate', () => {
  it('renders only a loading indicator while status is loading, no children in the tree', () => {
    setAuthState('loading');
    const onMount = vi.fn();

    render(
      <AuthGate>
        <TripUiStub onMount={onMount} />
      </AuthGate>,
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByTestId('trip-ui')).not.toBeInTheDocument();
    expect(onMount).not.toHaveBeenCalled();
  });

  it('renders only the sign-in screen while signed out, no children in the tree', () => {
    setAuthState('out');
    const onMount = vi.fn();

    const { container } = render(
      <AuthGate>
        <TripUiStub onMount={onMount} />
      </AuthGate>,
    );

    // md-filled-button doesn't upgrade/render its Lit shadow DOM in jsdom, so
    // it exposes no accessible role — query the host directly.
    expect(container.querySelector('md-filled-button')).not.toBeNull();
    expect(screen.queryByTestId('trip-ui')).not.toBeInTheDocument();
    expect(onMount).not.toHaveBeenCalled();
  });

  it('clicking the sign-in button calls signIn from the auth store', () => {
    const signIn = vi.fn();
    setAuthState('out', signIn);

    const { container } = render(
      <AuthGate>
        <TripUiStub onMount={vi.fn()} />
      </AuthGate>,
    );
    act(() => {
      container.querySelector('md-filled-button')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(signIn).toHaveBeenCalledTimes(1);
  });

  it('shows the auth store error message when sign-in fails', () => {
    setAuthState('out', vi.fn(), 'No pudimos iniciar sesión. Intentá de nuevo.');

    render(
      <AuthGate>
        <TripUiStub onMount={vi.fn()} />
      </AuthGate>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos iniciar sesión. Intentá de nuevo.');
  });

  it('renders children once signed in, and their mount effects run', () => {
    setAuthState('in');
    const onMount = vi.fn();

    render(
      <AuthGate>
        <TripUiStub onMount={onMount} />
      </AuthGate>,
    );

    expect(screen.getByTestId('trip-ui')).toBeInTheDocument();
    expect(onMount).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: /iniciar sesión/i })).not.toBeInTheDocument();
  });
});
