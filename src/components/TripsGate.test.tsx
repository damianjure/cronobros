import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TripsGate from './TripsGate';
import { tripRepository } from '../services';
import { useTripNavigation } from '../store/tripNavigation';

vi.mock('./TripsListView', () => ({
  default: ({ onSelectTrip }: { onSelectTrip: (id: string) => void }) => (
    <button onClick={() => onSelectTrip('trip-1')}>select-trip-stub</button>
  ),
}));

function LeaveTripStub() {
  const { leaveTrip } = useTripNavigation();
  return <button onClick={leaveTrip}>leave-trip-stub</button>;
}

// Selecting a trip mounts a real <TripStoreProvider>, which calls the real
// `tripRepository` seam (FirestoreTripRepository against the real project —
// see src/services/index.ts). Stub every subscribe* so this render test
// never opens a genuine, unauthenticated network listener.
function stubTripRepositorySubscriptions() {
  const noopUnsubscribe = () => vi.fn();
  return [
    vi.spyOn(tripRepository, 'subscribeItinerary').mockImplementation(noopUnsubscribe),
    vi.spyOn(tripRepository, 'subscribePins').mockImplementation(noopUnsubscribe),
    vi.spyOn(tripRepository, 'subscribePendingPlaces').mockImplementation(noopUnsubscribe),
    vi.spyOn(tripRepository, 'subscribeChat').mockImplementation(noopUnsubscribe),
    vi.spyOn(tripRepository, 'subscribeLogistics').mockImplementation(noopUnsubscribe),
    vi.spyOn(tripRepository, 'subscribeCriticalEvents').mockImplementation(noopUnsubscribe),
  ];
}

describe('TripsGate', () => {
  it('renders the trips list first, not the children', () => {
    render(
      <TripsGate>
        <div data-testid="app-stub">App</div>
      </TripsGate>,
    );

    expect(screen.getByText('select-trip-stub')).toBeInTheDocument();
    expect(screen.queryByTestId('app-stub')).not.toBeInTheDocument();
  });

  it('renders children once a trip has been selected', async () => {
    const spies = stubTripRepositorySubscriptions();
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();

    render(
      <TripsGate>
        <div data-testid="app-stub">App</div>
      </TripsGate>,
    );
    await user.click(screen.getByText('select-trip-stub'));

    expect(screen.getByTestId('app-stub')).toBeInTheDocument();

    spies.forEach(spy => spy.mockRestore());
  });

  it('returns to the trips list when leaveTrip is called from within a selected trip', async () => {
    const spies = stubTripRepositorySubscriptions();
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();

    render(
      <TripsGate>
        <LeaveTripStub />
      </TripsGate>,
    );
    await user.click(screen.getByText('select-trip-stub'));
    expect(screen.getByText('leave-trip-stub')).toBeInTheDocument();

    await user.click(screen.getByText('leave-trip-stub'));

    expect(screen.getByText('select-trip-stub')).toBeInTheDocument();
    expect(screen.queryByText('leave-trip-stub')).not.toBeInTheDocument();

    spies.forEach(spy => spy.mockRestore());
  });
});
