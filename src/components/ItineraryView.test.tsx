import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import ItineraryView from './ItineraryView';
import { createTripStore } from '../store/tripStore';
import type { TripStoreState } from '../store/tripStore';
import { InMemoryTripRepository } from '../services/inMemoryTripRepository';
import type { ItineraryDay, PendingPlace } from '../types';

function makeDay(overrides: Partial<ItineraryDay> = {}): ItineraryDay {
  return {
    id: 'day-1',
    dayNumber: 1,
    date: '2026-08-12',
    dayOfWeek: 'Lunes',
    title: 'Día de prueba',
    location: 'Islandia',
    activities: [],
    ...overrides,
  };
}

function makePendingPlace(overrides: Partial<PendingPlace> = {}): PendingPlace {
  return {
    id: 'pending-1',
    title: 'Lugar Turístico de Prueba',
    category: 'Turismo',
    description: 'Descripción de prueba',
    location: 'Reikiavik',
    ...overrides,
  };
}

let testStore: ReturnType<typeof createTripStore>['store'];

// ItineraryView reads the app-wide `useTripStore` singleton directly rather
// than receiving the store via props. Mock the module so each smoke test
// renders against an isolated in-memory repository instead of the shared
// production singleton — same injection pattern `createTripStore` was built
// for (see store/tripStore.ts's own doc comment and tripStore.test.ts).
vi.mock('../store/tripStore', async () => {
  const actual = await vi.importActual<typeof import('../store/tripStore')>('../store/tripStore');
  return {
    ...actual,
    useTripStore: <T,>(selector: (state: TripStoreState) => T) => testStore(selector),
  };
});

function renderItineraryView(seed: { itinerary: ItineraryDay[]; pendingPlaces?: PendingPlace[] }) {
  const repo = new InMemoryTripRepository({
    itinerary: seed.itinerary,
    pendingPlaces: seed.pendingPlaces ?? [],
    pins: [],
    chat: [],
  });
  const { store } = createTripStore(repo, 'test-trip');
  testStore = store;

  const result = render(
    <ItineraryView setActiveTab={vi.fn()} showNewEntryModal={false} setShowNewEntryModal={vi.fn()} />,
  );

  return { repo, store: testStore, container: result.container };
}

// @material/web custom elements don't upgrade/render their Lit shadow DOM in
// jsdom (no real <input>/<button> inside), so they expose no accessible role
// and userEvent.type/click can't drive them the way they drive native
// elements. Set the value and dispatch the real event React's onInput/onClick
// listens for directly on the host — this is the same host-element contract
// the real browser satisfies, just invoked without the shadow render.
function typeIntoTextField(field: Element, value: string) {
  (field as HTMLElement & { value: string }).value = value;
  field.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
}

// Behavior-preservation gate for the ItineraryView decomposition (SDD Phase
// 0, PR3). Written FIRST against the pre-decomposition monolith to establish
// a baseline, then re-run unchanged after ActivityCard/NewEntryForm/
// FriendChips are extracted — the DOM and store interactions asserted here
// must not change across that refactor.
describe('ItineraryView (behavior-preservation smoke tests)', () => {
  it('adding an activity via the sidebar form makes it appear in the visible itinerary list', async () => {
    const { container } = renderItineraryView({ itinerary: [makeDay()] });

    const titleField = container.querySelector('[placeholder="ej. Visita guiada"]');
    expect(titleField).not.toBeNull();
    act(() => {
      typeIntoTextField(titleField!, 'Caminata de prueba');
    });

    // md-filled-button's type="submit" only participates in native form
    // submission via its own (unregistered-in-jsdom) ElementInternals — click
    // alone won't submit the form here, so dispatch the submit event that
    // click would trigger in a real browser directly on the <form>.
    const form = container.querySelector('form')!;
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(await screen.findByText('Caminata de prueba')).toBeInTheDocument();
  });

  it('deleting an activity removes it from the visible itinerary list', async () => {
    const { container } = renderItineraryView({
      itinerary: [
        makeDay({
          activities: [
            {
              id: 'act-1',
              time: '10:00 AM',
              type: 'Dining',
              title: 'Actividad a eliminar',
              description: 'desc',
              location: 'loc',
            },
          ],
        }),
      ],
    });

    expect(screen.getByText('Actividad a eliminar')).toBeInTheDocument();

    const deleteButton = container.querySelector('md-icon-button[aria-label="Eliminar Actividad"]');
    expect(deleteButton).not.toBeNull();
    await act(async () => {
      (deleteButton as HTMLElement).click();
    });

    expect(screen.queryByText('Actividad a eliminar')).not.toBeInTheDocument();
  });

  it('approving a pending place is reflected reactively in the rendered itinerary list', async () => {
    const place = makePendingPlace();
    const { store } = renderItineraryView({
      itinerary: [makeDay()],
      pendingPlaces: [place],
    });

    expect(screen.queryByText(place.title)).not.toBeInTheDocument();

    // Approval is triggered from PlacesView in the real app, not from
    // ItineraryView itself. This asserts the store→view reactivity contract
    // that ItineraryView depends on: calling the same store command PlacesView
    // would call must still update ItineraryView's rendered list.
    await act(async () => {
      await store.getState().approvePlace(place.id, 'day-1');
    });

    expect(screen.getByText(place.title)).toBeInTheDocument();
  });
});
