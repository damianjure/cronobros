import { act, render, screen } from '@testing-library/react';
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

// @material/web custom elements don't upgrade/render their Lit shadow DOM in
// jsdom, so buttons/text-fields expose no accessible role or label
// association — query the host directly (by visible text for buttons, by
// DOM order for fields) and drive it with real events wrapped in act(),
// same pattern as ItineraryView/MapView/CriticalEventsManager tests.
function clickButtonByText(container: HTMLElement, tag: string, text: string) {
  const button = [...container.querySelectorAll(tag)].find(el => el.textContent?.trim() === text) as HTMLElement;
  act(() => {
    button.click();
  });
}

function clickByAriaLabel(container: HTMLElement, label: string) {
  const el = container.querySelector(`[aria-label="${label}"]`) as HTMLElement;
  act(() => {
    el.click();
  });
}

function typeIntoField(field: Element, value: string) {
  act(() => {
    (field as HTMLElement & { value: string }).value = value;
    field.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  });
}

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
    const { container } = renderCard([], editableTrip);

    clickButtonByText(container, 'md-outlined-button', 'Agregar evento crítico');
    clickButtonByText(container, 'md-outlined-button', 'Nuevo evento crítico');

    // Field order in the form: Título, Categoría breve, Lugar, Latitud,
    // Longitud, Descripción, Advertencia (Fecha/Hora límite stay native
    // inputs — md-outlined-text-field doesn't support type="date"/"time").
    const [tituloField, categoriaField, lugarField, latitudField, longitudField, descripcionField, advertenciaField] =
      container.querySelectorAll('md-outlined-text-field');

    typeIntoField(tituloField, 'Salida del ferry');
    typeIntoField(categoriaField, 'Embarque');
    typeIntoField(lugarField, 'Puerto central');
    typeIntoField(latitudField, '40.1');
    typeIntoField(longitudField, '-3.2');
    typeIntoField(descripcionField, 'Presentarse con el pase.');
    typeIntoField(advertenciaField, 'La puerta cierra 20 minutos antes.');

    const form = container.querySelector('form')!;
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    clickByAriaLabel(container, 'Cerrar gestión de eventos');

    expect(await screen.findByText('Salida del ferry')).toBeInTheDocument();
    expect(screen.getByText('Puerto central')).toBeInTheDocument();
  });
});
