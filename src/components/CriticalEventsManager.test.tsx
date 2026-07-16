import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { CriticalEvent } from '../types';
import CriticalEventsManager from './CriticalEventsManager';

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
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <CriticalEventsManager events={[event]} onSave={onSave} onDelete={vi.fn()} onClose={vi.fn()} />,
    );

    await user.click(screen.getByRole('button', { name: 'Editar Vuelo de regreso' }));
    const title = screen.getByLabelText('Título');
    await user.clear(title);
    await user.type(title, 'Vuelo actualizado');
    await user.click(screen.getByRole('button', { name: 'Guardar evento' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ id: 'event-1', title: 'Vuelo actualizado' }));
  });

  it('deletes an event from the ledger', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockResolvedValue(undefined);
    render(
      <CriticalEventsManager events={[event]} onSave={vi.fn()} onDelete={onDelete} onClose={vi.fn()} />,
    );

    await user.click(screen.getByRole('button', { name: 'Eliminar Vuelo de regreso' }));

    expect(onDelete).toHaveBeenCalledWith('event-1');
  });
});
