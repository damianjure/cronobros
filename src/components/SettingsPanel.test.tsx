import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsPanel from './SettingsPanel';
import { useSettingsStore } from '../store/settingsStore';

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
    render(<SettingsPanel isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Configuración')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /d.lares/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /claro/i })).toBeChecked();
  });

  it('selecting a currency updates the settings store', async () => {
    const user = userEvent.setup();
    render(<SettingsPanel isOpen={true} onClose={vi.fn()} />);

    await user.click(screen.getByRole('radio', { name: /euros/i }));

    expect(useSettingsStore.getState().currency).toBe('EUR');
  });

  it('selecting dark theme updates the store and the document root', async () => {
    const user = userEvent.setup();
    render(<SettingsPanel isOpen={true} onClose={vi.fn()} />);

    await user.click(screen.getByRole('radio', { name: /oscuro/i }));

    expect(useSettingsStore.getState().theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<SettingsPanel isOpen={true} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: /cerrar/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
