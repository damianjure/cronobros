import { act, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { CriticalEvent } from '../types';
import CriticalEventsManager from './CriticalEventsManager';

// @material/web custom elements don't upgrade/render their Lit shadow DOM in
// jsdom, so icon/outlined/filled buttons expose no accessible role and their
// `label` prop never lands as a queryable attribute either — query the host
// directly (aria-label IS reflected as a real attribute) and drive it with
// real events wrapped in act(), same pattern as ItineraryView/MapView tests.
function clickByAriaLabel(container: HTMLElement, label: string) {
  const el = container.querySelector(`[aria-label="${label}"]`) as HTMLElement;
  act(() => {
    el.click();
  });
}

const event: CriticalEvent = {
  id: 'event-1',
  type: 'flight',
  title: 'Vuelo de regreso',
  subType: 'Vuelo',
  locationName: 'Aeropuerto',
  coords: { lat: 40, lon: -3 },
  targetDate: '2026-09-20',
  targetTimeStr: '18:30',
  description: 'Llegar temprano.',
  warningMessage: 'Cierra el embarque.',
};

describe('CriticalEventsManager', () => {
  it('edits an existing event without changing its id', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { container } = render(
      <CriticalEventsManager events={[event]} onSave={onSave} onDelete={vi.fn()} onClose={vi.fn()} />,
    );

    clickByAriaLabel(container, 'Editar Vuelo de regreso');

    // "Título" is the first md-outlined-text-field the form renders.
    const titleField = container.querySelector('md-outlined-text-field') as HTMLElement & { value: string };
    act(() => {
      titleField.value = 'Vuelo actualizado';
      titleField.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    });

    const form = container.querySelector('form')!;
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ id: 'event-1', title: 'Vuelo actualizado' }));
  });

  it('deletes an event from the ledger', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const { container } = render(
      <CriticalEventsManager events={[event]} onSave={vi.fn()} onDelete={onDelete} onClose={vi.fn()} />,
    );

    clickByAriaLabel(container, 'Eliminar Vuelo de regreso');

    expect(onDelete).toHaveBeenCalledWith('event-1');
  });
});
