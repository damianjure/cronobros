import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../services/smartImportCallable', () => ({
  IMPORTED_ACTIVITY_TYPES: ['Transportation', 'Accommodation', 'Dining', 'Sightseeing', 'Adventure', 'Relaxation'],
  importTravelTextCallable: vi.fn(),
}));

import SmartImportModal from './SmartImportModal';

describe('SmartImportModal', () => {
  it('analyzes text, allows editing the preview, and confirms it', async () => {
    const user = userEvent.setup();
    const extract = vi.fn().mockResolvedValue({
      activities: [{
        date: '2026-08-14',
        time: '08:15',
        title: 'Vuelo original',
        description: '',
        location: 'EZE',
        type: 'Transportation',
      }],
    });
    const onConfirm = vi.fn().mockResolvedValue(undefined);

    render(
      <SmartImportModal
        isOpen
        onClose={vi.fn()}
        onConfirm={onConfirm}
        extract={extract}
      />,
    );

    await user.type(screen.getByLabelText('Texto del viaje'), 'Reserva completa del vuelo a Madrid');
    await user.click(screen.getByRole('button', { name: 'Analizar con IA' }));

    expect(extract).toHaveBeenCalledWith('Reserva completa del vuelo a Madrid');
    const title = await screen.findByLabelText('Título 1');
    await user.clear(title);
    await user.type(title, 'Vuelo confirmado');
    await user.click(screen.getByRole('button', { name: 'Agregar 1 actividad' }));

    expect(onConfirm).toHaveBeenCalledWith([
      expect.objectContaining({ title: 'Vuelo confirmado', type: 'Transportation' }),
    ]);
  });
});
