import { render } from '@testing-library/react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InMemoryTripRepository } from '../services/inMemoryTripRepository';
import { CurrentTripContext } from '../store/currentTripContext';
import { createTripStore, TripStoreContext } from '../store/tripStore';
import { TripNavigationContext } from '../store/tripNavigation';
import type { Trip } from '../types';
import DashboardView from './DashboardView';
import Header from './Header';
import ItineraryView from './ItineraryView';
import LogisticsView from './LogisticsView';
import MapView from './MapView';
import PlacesView from './PlacesView';

vi.mock('../store/authStore', () => ({
  useAuthStore: (selector: (state: { user: { uid: string; displayName: string; email: string; photoURL: null } }) => unknown) =>
    selector({
      user: {
        uid: 'owner-1',
        displayName: 'Damian',
        email: 'damian@example.com',
        photoURL: null,
      },
    }),
}));

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Area: () => null,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  CartesianGrid: () => null,
  Legend: () => null,
}));

const emptyTrip: Trip = {
  id: 'trip-empty',
  name: 'Escapada de prueba',
  ownerUid: 'owner-1',
  members: { 'owner-1': 'owner' },
  memberUids: ['owner-1'],
};

describe('new trip experience', () => {
  it('does not leak destination-specific prototype content into empty trip views', async () => {
    const user = userEvent.setup();
    const { store } = createTripStore(
      new InMemoryTripRepository({
        itinerary: [],
        pins: [],
        pendingPlaces: [],
        chat: [],
        logistics: { drivers: [], vehicle: null },
        criticalEvents: [],
      }),
      emptyTrip.id,
    );

    const { container } = render(
      <TripNavigationContext.Provider value={{ leaveTrip: vi.fn() }}>
        <CurrentTripContext.Provider value={emptyTrip}>
          <TripStoreContext.Provider value={store}>
            <Header
              activeTab="dashboard"
              setActiveTab={vi.fn()}
              searchQuery=""
              setSearchQuery={vi.fn()}
              onNotificationClick={vi.fn()}
              onSettingsClick={vi.fn()}
            />
            <DashboardView setActiveTab={vi.fn()} />
            <ItineraryView
              setActiveTab={vi.fn()}
              showNewEntryModal={false}
              setShowNewEntryModal={vi.fn()}
            />
            <PlacesView />
            <LogisticsView />
            <MapView />
          </TripStoreContext.Provider>
        </CurrentTripContext.Provider>
      </TripNavigationContext.Provider>,
    );

    await user.click(container.querySelector('#header-notifications-btn')!);
    expect(screen.getByText('Sin novedades')).toBeInTheDocument();

    const renderedContent = `${container.textContent} ${Array.from(container.querySelectorAll('img'))
      .map(image => image.alt)
      .join(' ')}`;

    expect(renderedContent).not.toMatch(
      /Islandia|Iceland|Keflav[ií]k|Reykjavik|Reikiavik|Grindav[ií]k|Selfoss|Hr[ií]sey|Alex Thorne|Sarah Miller|Maya/i,
    );
  });
});
