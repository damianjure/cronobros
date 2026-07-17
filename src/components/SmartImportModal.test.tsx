import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

// @material/web custom elements don't upgrade/render their Lit shadow DOM in
// jsdom, so they expose no accessible role/label association and their
// text-field `value` isn't recognized by getByDisplayValue either — query the
// host directly (aria-label IS reflected as a real attribute unlike
// label/value) and drive it with real events wrapped in act().
function typeIntoField(field: Element, value: string) {
  act(() => {
    (field as HTMLElement & { value: string }).value = value;
    field.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  });
}

function clickButtonByText(container: HTMLElement, tag: string, text: string) {
  const button = [...container.querySelectorAll(tag)].find(el => el.textContent?.trim() === text) as HTMLElement;
  act(() => {
    button.click();
  });
}

vi.mock('../services/smartImportCallable', () => ({
  IMPORTED_ACTIVITY_TYPES: ['Transportation', 'Accommodation', 'Dining', 'Sightseeing', 'Adventure', 'Relaxation'],
  importTravelTextCallable: vi.fn(),
  importTravelDocumentCallable: vi.fn(),
}));

import SmartImportModal from './SmartImportModal';

describe('SmartImportModal', () => {
  it('analyzes text, allows editing the preview, and confirms it', async () => {
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

    const { container } = render(
      <SmartImportModal
        isOpen
        onClose={vi.fn()}
        onConfirm={onConfirm}
        extract={extract}
      />,
    );

    const textField = container.querySelector('md-outlined-text-field')!;
    typeIntoField(textField, 'Reserva completa del vuelo a Madrid');
    clickButtonByText(container, 'md-filled-button', 'Analizar con IA');

    expect(extract).toHaveBeenCalledWith('Reserva completa del vuelo a Madrid');

    const title = await waitFor(() => {
      const field = container.querySelector('[aria-label="Título 1"]');
      if (!field) throw new Error('not rendered yet');
      return field;
    });
    typeIntoField(title, 'Vuelo confirmado');
    clickButtonByText(container, 'md-filled-button', 'Agregar 1 actividad');

    await waitFor(() => expect(onConfirm).toHaveBeenCalled());
    expect(onConfirm).toHaveBeenCalledWith([
      expect.objectContaining({ title: 'Vuelo confirmado', type: 'Transportation' }),
    ]);
  });

  it('analyzes an uploaded PDF into the same editable preview', async () => {
    const user = userEvent.setup();
    const extractDocument = vi.fn().mockResolvedValue({ activities: [{
      date: '2026-09-20', time: '10:00', title: 'Check-in', description: '', location: 'Hotel', type: 'Accommodation',
    }] });
    const { container } = render(
      <SmartImportModal isOpen onClose={vi.fn()} onConfirm={vi.fn()} extract={vi.fn()} extractDocument={extractDocument} />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['pdf'], 'reserva.pdf', { type: 'application/pdf' });
    await user.upload(input, file);
    expect(extractDocument).toHaveBeenCalledWith(file);

    await waitFor(() => {
      // React renders the initial `value={activity.title}` prop as a DOM
      // attribute here (not a live property — that only happens once the
      // real Lit class upgrades the element, which never happens in jsdom),
      // so check the attribute rather than `.value`.
      const field = container.querySelector('[aria-label="Título 1"]');
      expect(field?.getAttribute('value')).toBe('Check-in');
    });
  });
});
