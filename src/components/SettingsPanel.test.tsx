import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import SettingsPanel from './SettingsPanel';
import { useSettingsStore } from '../store/settingsStore';

// @material/web custom elements don't upgrade/render their Lit shadow DOM in
// jsdom, so md-radio exposes no accessible role and its `checked` state is
// reflected only as a DOM attribute (not a live property) when set by React
// — query the host directly and drive/read it accordingly, same pattern as
// the other migrated components' tests.
function radioByValue(container: HTMLElement, name: string, value: string) {
  return [...container.querySelectorAll('md-radio')].find(
    el => el.getAttribute('name') === name && el.getAttribute('value') === value,
  ) as HTMLElement;
}

function selectRadio(radio: HTMLElement) {
  act(() => {
    radio.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  });
}

function clickByAriaLabel(container: HTMLElement, label: string) {
  const el = container.querySelector(`[aria-label="${label}"]`) as HTMLElement;
  act(() => {
    el.click();
  });
}

describe('SettingsPanel', () => {
  beforeEach(() => {
    localStorage.clear();
    useSettingsStore.setState({ currency: 'USD', theme: 'light' });
    document.documentElement.classList.remove('dark');
  });

  it('renders nothing when closed', () => {
    render(<SettingsPanel isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByText('Configuración')).not.toBeInTheDocument();
  });

  it('shows the current currency and theme when open', () => {
    const { container } = render(<SettingsPanel isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Configuración')).toBeInTheDocument();
    expect(radioByValue(container, 'currency', 'USD').hasAttribute('checked')).toBe(true);
    expect(radioByValue(container, 'theme', 'light').hasAttribute('checked')).toBe(true);
  });

  it('selecting a currency updates the settings store', () => {
    const { container } = render(<SettingsPanel isOpen={true} onClose={vi.fn()} />);

    selectRadio(radioByValue(container, 'currency', 'EUR'));

    expect(useSettingsStore.getState().currency).toBe('EUR');
  });

  it('selecting dark theme updates the store and the document root', () => {
    const { container } = render(<SettingsPanel isOpen={true} onClose={vi.fn()} />);

    selectRadio(radioByValue(container, 'theme', 'dark'));

    expect(useSettingsStore.getState().theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(<SettingsPanel isOpen={true} onClose={onClose} />);

    clickByAriaLabel(container, 'Cerrar');

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
