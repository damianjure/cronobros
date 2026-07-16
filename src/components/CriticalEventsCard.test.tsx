import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InMemoryTripRepository } from '../services/inMemoryTripRepository';
import { CurrentTripContext } from '../store/currentTripContext';
import { createTripStore, TripStoreContext } from '../store/tripStore';
import type { CriticalEvent, Trip } from '../types';
import CriticalEventsCard from './CriticalEventsCard';

vi.mock('../store/authStore', () => ({
  useAuthStore: (selector: (state: { user: { uid: string } }) => unknown) =>
    selector({ user: { uid: 'owner-1' } }),
}));

const editableTrip: Trip = {
  id: 'trip-1',
  name: 'Viaje editable',
  ownerUid: 'owner-1',
  members: { 'owner-1': 'owner' },
  memberUids: ['owner-1'],
};

function renderCard(criticalEvents: CriticalEvent[], trip: Trip | null = null) {
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
    <CurrentTripContext.Provider value={trip}>
      <TripStoreContext.Provider value={store}>
        <CriticalEventsCard />
      </TripStoreContext.Provider>
    </CurrentTripContext.Provider>,
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
        targetDate: '2026-09-20',
        targetTimeStr: '10:30',
        description: 'Presentar la reserva.',
        warningMessage: 'La oficina cierra a horario.',
      },
    ]);

    expect(screen.getByText('Retiro del vehículo')).toBeInTheDocument();
    expect(screen.getByText('Estación central')).toBeInTheDocument();
    expect(screen.queryByText(/Keflavík|Akureyri|Islandia/i)).not.toBeInTheDocument();
  });

  it('lets an owner create a dated critical event from the empty state', async () => {
    const user = userEvent.setup();
    renderCard([], editableTrip);

    await user.click(screen.getByRole('button', { name: 'Agregar evento crítico' }));
    await user.click(screen.getByRole('button', { name: 'Nuevo evento crítico' }));
    await user.type(screen.getByLabelText('Título'), 'Salida del ferry');
    await user.type(screen.getByLabelText('Categoría breve'), 'Embarque');
    await user.type(screen.getByLabelText('Lugar'), 'Puerto central');
    await user.type(screen.getByLabelText('Latitud'), '40.1');
    await user.type(screen.getByLabelText('Longitud'), '-3.2');
    await user.type(screen.getByLabelText('Descripción'), 'Presentarse con el pase.');
    await user.type(screen.getByLabelText('Advertencia'), 'La puerta cierra 20 minutos antes.');
    await user.click(screen.getByRole('button', { name: 'Guardar evento' }));
    await user.click(screen.getByRole('button', { name: 'Cerrar gestión de eventos' }));

    expect(await screen.findByText('Salida del ferry')).toBeInTheDocument();
    expect(screen.getByText('Puerto central')).toBeInTheDocument();
  });
});
