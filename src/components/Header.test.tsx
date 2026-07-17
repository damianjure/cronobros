import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { create } from 'zustand';
import Header from './Header';
import { useAuthStore } from '../store/authStore';
import { TripNavigationContext } from '../store/tripNavigation';
import { TripStoreContext, type TripStoreState } from '../store/tripStore';
import type { User } from 'firebase/auth';

const stubTripStore = create<Pick<TripStoreState, 'criticalEvents'>>(() => ({ criticalEvents: [] }));

function renderHeader(leaveTrip = vi.fn()) {
  return render(
    <TripNavigationContext.Provider value={{ leaveTrip }}>
      <TripStoreContext.Provider value={stubTripStore as never}>
        <Header
          activeTab="dashboard"
          setActiveTab={vi.fn()}
          searchQuery=""
          setSearchQuery={vi.fn()}
          onNotificationClick={vi.fn()}
          onSettingsClick={vi.fn()}
        />
      </TripStoreContext.Provider>
    </TripNavigationContext.Provider>,
  );
}

describe('Header account menu', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { uid: 'u1', displayName: 'Damian Jure', email: 'damian@cronobros.test' } as User,
      status: 'in',
      error: null,
    });
  });

  it('does not show the account menu until the avatar is clicked', () => {
    renderHeader();
    expect(screen.queryByText('Mis viajes')).not.toBeInTheDocument();
    expect(screen.queryByText('Cerrar sesión')).not.toBeInTheDocument();
  });

  it('opens the account menu with "Mis viajes" and "Cerrar sesión" when the avatar is clicked', async () => {
    const user = userEvent.setup();
    renderHeader();

    await user.click(screen.getByRole('button', { name: /damian jure/i }));

    expect(screen.getByText('Mis viajes')).toBeInTheDocument();
    expect(screen.getByText('Cerrar sesión')).toBeInTheDocument();
  });

  it('calls leaveTrip when "Mis viajes" is clicked', async () => {
    const leaveTrip = vi.fn();
    const user = userEvent.setup();
    renderHeader(leaveTrip);

    await user.click(screen.getByRole('button', { name: /damian jure/i }));
    await user.click(screen.getByText('Mis viajes'));

    expect(leaveTrip).toHaveBeenCalledTimes(1);
  });

  it('calls authStore.signOut when "Cerrar sesión" is clicked', async () => {
    const signOutSpy = vi.spyOn(useAuthStore.getState(), 'signOut').mockResolvedValue();
    const user = userEvent.setup();
    renderHeader();

    await user.click(screen.getByRole('button', { name: /damian jure/i }));
    await user.click(screen.getByText('Cerrar sesión'));

    expect(signOutSpy).toHaveBeenCalledTimes(1);
    signOutSpy.mockRestore();
  });
});
