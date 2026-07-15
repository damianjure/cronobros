import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InMemoryTripRepository } from '../services/inMemoryTripRepository';
import { createTripStore, TripStoreContext } from '../store/tripStore';
import type { CriticalEvent } from '../types';
import CriticalEventsCard from './CriticalEventsCard';

function renderCard(criticalEvents: CriticalEvent[]) {
  const { store } = createTripStore(
    new InMemoryTripRepository({
      itinerary: [],
      pins: [],
      pendingPlaces: [],
      chat: [],
      criticalEvents,
    }),
    'trip-1',
  );

  return render(
    <TripStoreContext.Provider value={store}>
      <CriticalEventsCard />
    </TripStoreContext.Provider>,
  );
}

describe('CriticalEventsCard', () => {
  it('shows an empty state instead of destination fixture data for a trip without events', () => {
    renderCard([]);

    expect(screen.getByText('Sin eventos críticos')).toBeInTheDocument();
    expect(screen.queryByText(/Keflavík|Akureyri|Islandia/i)).not.toBeInTheDocument();
  });

  it('renders the event supplied by the selected trip', () => {
    renderCard([
      {
        id: 'train-1',
        type: 'car',
        title: 'Retiro del vehículo',
        subType: 'Traslado',
        locationName: 'Estación central',
        coords: { lat: 40.4168, lon: -3.7038 },
        targetTimeStr: '10:30',
        description: 'Presentar la reserva.',
        warningMessage: 'La oficina cierra a horario.',
      },
    ]);

    expect(screen.getByText('Retiro del vehículo')).toBeInTheDocument();
    expect(screen.getByText('Estación central')).toBeInTheDocument();
    expect(screen.queryByText(/Keflavík|Akureyri|Islandia/i)).not.toBeInTheDocument();
  });
});
