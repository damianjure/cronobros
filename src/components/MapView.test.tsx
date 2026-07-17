import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InMemoryTripRepository } from '../services/inMemoryTripRepository';
import { CurrentTripContext } from '../store/currentTripContext';
import { createTripStore, TripStoreContext } from '../store/tripStore';
import type { CriticalEvent, PinnedPoint, Trip } from '../types';
import MapView from './MapView';

vi.mock('../store/authStore', () => ({
  useAuthStore: (selector: (state: { user: { uid: string } }) => unknown) =>
    selector({ user: { uid: 'owner-1' } }),
}));

vi.mock('./GoogleMapCanvas', () => ({
  default: ({
    points,
    editable,
    onMapClick,
  }: {
    points: Array<{ id: string }>;
    editable: boolean;
    onMapClick: (position: { lat: number; lng: number }) => void;
  }) => (
    <div>
      <span data-testid="map-point-count">{points.length}</span>
      {editable && (
        <button onClick={() => onMapClick({ lat: 40.4168, lng: -3.7038 })}>Simular click mapa</button>
      )}
    </div>
  ),
}));

const trip: Trip = {
  id: 'trip-map',
  name: 'Viaje con mapa',
  ownerUid: 'owner-1',
  members: { 'owner-1': 'owner' },
  memberUids: ['owner-1'],
};

function renderMap(pins: PinnedPoint[] = [], criticalEvents: CriticalEvent[] = []) {
  const { store } = createTripStore(
    new InMemoryTripRepository({
      itinerary: [],
      pins,
      pendingPlaces: [],
      chat: [],
      logistics: { drivers: [], vehicle: null },
      criticalEvents,
    }),
    trip.id,
  );
  const { container } = render(
    <CurrentTripContext.Provider value={trip}>
      <TripStoreContext.Provider value={store}>
        <MapView />
      </TripStoreContext.Provider>
    </CurrentTripContext.Provider>,
  );
  return { store, container };
}

describe('MapView', () => {
  it('lets an editor persist a real geographic pin by clicking the map', async () => {
    const user = userEvent.setup();
    const { store, container } = renderMap();

    await user.click(screen.getByRole('button', { name: 'Simular click mapa' }));

    // md-outlined-text-field doesn't upgrade/render its Lit shadow DOM in
    // jsdom, so its `label` never associates via an accessible name — query
    // the host directly and set value + dispatch the real 'input' event.
    const nameField = container.querySelector('md-outlined-text-field[label="Nombre"]') as HTMLElement & { value: string };
    act(() => {
      nameField.value = 'Estación central';
      nameField.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    });

    // md-filled-button's type="submit" doesn't natively submit the form here
    // either (its form association is implemented by the real Lit class,
    // which never registers in jsdom) — submit the form directly instead.
    const form = container.querySelector('form')!;
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    await waitFor(() => expect(store.getState().pins).toHaveLength(1));
    expect(store.getState().pins[0]).toMatchObject({
      title: 'Estación central',
      coords: { lat: 40.4168, lon: -3.7038 },
    });
    expect(screen.getByText('Estación central')).toBeInTheDocument();
  });

  it('routes only real geographic pins and dated critical events, ignoring legacy canvas coordinates', () => {
    renderMap(
      [
        { id: 'geo', title: 'Geo', description: '', category: 'Lugar', image: '', coords: { lat: 1, lon: 2 } },
        { id: 'legacy', title: 'Legacy', description: '', category: 'Lugar', image: '', coords: { x: 10, y: 20 } },
      ],
      [
        {
          id: 'flight',
          type: 'flight',
          title: 'Aeropuerto',
          subType: 'Vuelo',
          locationName: 'Terminal',
          coords: { lat: 3, lon: 4 },
          targetDate: '2026-09-20',
          targetTimeStr: '10:00',
          description: '',
          warningMessage: '',
        },
      ],
    );

    expect(screen.getByTestId('map-point-count')).toHaveTextContent('2');
  });
});
