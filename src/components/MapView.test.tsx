import { render, screen, waitFor } from '@testing-library/react';
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
  render(
    <CurrentTripContext.Provider value={trip}>
      <TripStoreContext.Provider value={store}>
        <MapView />
      </TripStoreContext.Provider>
    </CurrentTripContext.Provider>,
  );
  return store;
}

describe('MapView', () => {
  it('lets an editor persist a real geographic pin by clicking the map', async () => {
    const user = userEvent.setup();
    const store = renderMap();

    await user.click(screen.getByRole('button', { name: 'Simular click mapa' }));
    await user.type(screen.getByLabelText('Nombre'), 'Estación central');
    await user.click(screen.getByRole('button', { name: 'Guardar en el mapa' }));

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
