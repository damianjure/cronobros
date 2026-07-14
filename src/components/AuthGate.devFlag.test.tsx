import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { AuthState } from '../store/authStore';

vi.mock('../lib/devFlags', () => ({ AUTH_GATE_ENABLED: false }));

vi.mock('../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

const { useAuthStore } = await import('../store/authStore');
const { default: AuthGate } = await import('./AuthGate');
const mockedUseAuthStore = vi.mocked(useAuthStore);

describe('AuthGate with AUTH_GATE_ENABLED=false (dev-comfort bypass)', () => {
  it('renders children even when signed out, skipping the gate entirely', () => {
    mockedUseAuthStore.mockImplementation(
      <T,>(selector: (state: AuthState) => T) =>
        selector({ user: null, status: 'out', error: null, signIn: vi.fn(), signOut: vi.fn() }),
    );

    render(
      <AuthGate>
        <div data-testid="trip-ui">Trip UI</div>
      </AuthGate>,
    );

    expect(screen.getByTestId('trip-ui')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /iniciar sesión/i })).not.toBeInTheDocument();
  });
});
