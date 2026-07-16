import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TripsListView from './TripsListView';
import { useTripsStore } from '../store/tripsStore';
import { useAuthStore } from '../store/authStore';
import type { TripsStoreState } from '../store/tripsStore';
import type { AuthState } from '../store/authStore';
import type { Trip } from '../types';

vi.mock('../store/tripsStore', () => ({
  useTripsStore: vi.fn(),
}));

vi.mock('../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

const mockedUseTripsStore = vi.mocked(useTripsStore);
const mockedUseAuthStore = vi.mocked(useAuthStore);

function setTripsState(overrides: Partial<TripsStoreState> = {}) {
  const state: TripsStoreState = {
    trips: [],
    subscribeToUser: vi.fn(),
    createTrip: vi.fn(),
    deleteTrip: vi.fn(),
    setArchived: vi.fn(),
    inviteMember: vi.fn(),
    cancelInvite: vi.fn(),
    activatePendingInvites: vi.fn(),
    ...overrides,
  };
  mockedUseTripsStore.mockImplementation(<T,>(selector: (s: TripsStoreState) => T) => selector(state));
  return state;
}

function setAuthState(user: AuthState['user'] = { uid: 'user-1' } as AuthState['user']) {
  mockedUseAuthStore.mockImplementation(
    <T,>(selector: (state: AuthState) => T) =>
      selector({ user, status: 'in', error: null, signIn: vi.fn(), signOut: vi.fn() }),
  );
}

function makeTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: 'trip-1',
    name: 'Islandia 2026',
    ownerUid: 'user-1',
    members: { 'user-1': 'owner' },
    memberUids: ['user-1'],
    ...overrides,
  };
}

describe('TripsListView', () => {
  it('subscribes to the current uid on mount', () => {
    setAuthState();
    const state = setTripsState();

    render(<TripsListView onSelectTrip={vi.fn()} />);

    expect(state.subscribeToUser).toHaveBeenCalledWith('user-1');
  });

  it('shows an empty state when there are no trips', () => {
    setAuthState();
    setTripsState({ trips: [] });

    render(<TripsListView onSelectTrip={vi.fn()} />);

    expect(screen.getByText(/no ten[ée]s viajes/i)).toBeInTheDocument();
  });

  it('lists trips and calls onSelectTrip when one is opened', async () => {
    setAuthState();
    setTripsState({ trips: [makeTrip()] });
    const onSelectTrip = vi.fn();
    const user = userEvent.setup();

    render(<TripsListView onSelectTrip={onSelectTrip} />);
    await user.click(screen.getByRole('button', { name: 'Islandia 2026' }));

    expect(onSelectTrip).toHaveBeenCalledWith('trip-1');
  });

  it('submitting the create-trip form calls createTrip with the trimmed name and current uid', async () => {
    setAuthState();
    const state = setTripsState();
    const user = userEvent.setup();

    render(<TripsListView onSelectTrip={vi.fn()} />);
    await user.type(screen.getByLabelText(/nombre del viaje/i), 'Patagonia 2027');
    await user.click(screen.getByRole('button', { name: /crear viaje/i }));

    expect(state.createTrip).toHaveBeenCalledWith('Patagonia 2027', 'user-1');
  });

  it('clicking delete on a trip card calls deleteTrip with that trip id', async () => {
    setAuthState();
    const state = setTripsState({ trips: [makeTrip()] });
    const user = userEvent.setup();

    render(<TripsListView onSelectTrip={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /eliminar/i }));

    expect(state.deleteTrip).toHaveBeenCalledWith('trip-1');
  });

  it('archives an active trip and can restore it from the archive', async () => {
    setAuthState();
    const state = setTripsState({ trips: [makeTrip()] });
    const user = userEvent.setup();
    const { rerender } = render(<TripsListView onSelectTrip={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /archivar islandia/i }));
    expect(state.setArchived).toHaveBeenCalledWith('trip-1', true);

    setTripsState({ trips: [makeTrip({ archivedAt: '2026-07-15T00:00:00.000Z' })], setArchived: state.setArchived });
    rerender(<TripsListView onSelectTrip={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /ver archivo/i }));
    await user.click(screen.getByRole('button', { name: /restaurar islandia/i }));
    expect(state.setArchived).toHaveBeenCalledWith('trip-1', false);
  });

  it('activates pending invites for the signed-in uid/email on mount (spec: activation on sign-in)', () => {
    setAuthState({ uid: 'user-1', email: 'user1@example.com' } as AuthState['user']);
    const state = setTripsState();

    render(<TripsListView onSelectTrip={vi.fn()} />);

    expect(state.activatePendingInvites).toHaveBeenCalledWith('user-1', 'user1@example.com');
  });
});
