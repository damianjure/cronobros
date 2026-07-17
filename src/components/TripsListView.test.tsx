import { describe, it, expect, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TripsListView from './TripsListView';

// @material/web custom elements don't upgrade/render their Lit shadow DOM in
// jsdom, so they expose no accessible role/label association — query the
// host directly and drive it with real events wrapped in act(), same pattern
// as the other migrated components' tests.
function typeIntoField(field: Element, value: string) {
  act(() => {
    (field as HTMLElement & { value: string }).value = value;
    field.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  });
}

function submitForm(container: HTMLElement) {
  const form = container.querySelector('form')!;
  act(() => {
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
}

function clickByAriaLabel(container: HTMLElement, label: string) {
  const el = container.querySelector(`[aria-label="${label}"]`) as HTMLElement;
  act(() => {
    el.click();
  });
}

function clickButtonByText(container: HTMLElement, tag: string, text: string) {
  const button = [...container.querySelectorAll(tag)].find(el => el.textContent?.trim() === text) as HTMLElement;
  act(() => {
    button.click();
  });
}
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

  it('submitting the create-trip form calls createTrip with the trimmed name and current uid', () => {
    setAuthState();
    const state = setTripsState();

    const { container } = render(<TripsListView onSelectTrip={vi.fn()} />);
    typeIntoField(container.querySelector('md-outlined-text-field')!, 'Patagonia 2027');
    submitForm(container);

    expect(state.createTrip).toHaveBeenCalledWith('Patagonia 2027', 'user-1', undefined);
  });

  it('passes the signed-in user\'s display name as the owner profile when creating a trip', () => {
    setAuthState({ uid: 'user-1', displayName: 'Damian Jure', photoURL: 'https://example.com/p.jpg' } as AuthState['user']);
    const state = setTripsState();

    const { container } = render(<TripsListView onSelectTrip={vi.fn()} />);
    typeIntoField(container.querySelector('md-outlined-text-field')!, 'Patagonia 2027');
    submitForm(container);

    expect(state.createTrip).toHaveBeenCalledWith('Patagonia 2027', 'user-1', {
      name: 'Damian Jure',
      photo: 'https://example.com/p.jpg',
    });
  });

  it('clicking delete on a trip card calls deleteTrip with that trip id', () => {
    setAuthState();
    const state = setTripsState({ trips: [makeTrip()] });

    const { container } = render(<TripsListView onSelectTrip={vi.fn()} />);
    clickByAriaLabel(container, 'Eliminar Islandia 2026');

    expect(state.deleteTrip).toHaveBeenCalledWith('trip-1');
  });

  it('archives an active trip and can restore it from the archive', () => {
    setAuthState();
    const state = setTripsState({ trips: [makeTrip()] });
    const { container, rerender } = render(<TripsListView onSelectTrip={vi.fn()} />);
    clickByAriaLabel(container, 'Archivar Islandia 2026');
    expect(state.setArchived).toHaveBeenCalledWith('trip-1', true);

    setTripsState({ trips: [makeTrip({ archivedAt: '2026-07-15T00:00:00.000Z' })], setArchived: state.setArchived });
    rerender(<TripsListView onSelectTrip={vi.fn()} />);
    clickButtonByText(container, 'md-outlined-button', 'Ver archivo');
    clickByAriaLabel(container, 'Restaurar Islandia 2026');
    expect(state.setArchived).toHaveBeenCalledWith('trip-1', false);
  });

  it('activates pending invites for the signed-in uid/email on mount (spec: activation on sign-in)', () => {
    setAuthState({ uid: 'user-1', email: 'user1@example.com' } as AuthState['user']);
    const state = setTripsState();

    render(<TripsListView onSelectTrip={vi.fn()} />);

    expect(state.activatePendingInvites).toHaveBeenCalledWith('user-1', 'user1@example.com');
  });
});
