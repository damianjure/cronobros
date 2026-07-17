import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BottomNav from './BottomNav';

function renderBottomNav(overrides: Partial<React.ComponentProps<typeof BottomNav>> = {}) {
  return render(
    <BottomNav
      activeTab="dashboard"
      setActiveTab={vi.fn()}
      onInviteClick={vi.fn()}
      onSmartImport={vi.fn()}
      onHelpClick={vi.fn()}
      {...overrides}
    />,
  );
}

describe('BottomNav more sheet', () => {
  it('does not show the more actions until the "Más" button is clicked', () => {
    renderBottomNav();

    expect(screen.queryByText('Invitar Amigos')).not.toBeInTheDocument();
    expect(screen.queryByText('Importar con IA')).not.toBeInTheDocument();
    expect(screen.queryByText('Ayuda')).not.toBeInTheDocument();
  });

  it('opens the sheet with the three actions when "Más" is clicked', async () => {
    const user = userEvent.setup();
    renderBottomNav();

    await user.click(screen.getByRole('button', { name: 'Más' }));

    expect(screen.getByText('Invitar Amigos')).toBeInTheDocument();
    expect(screen.getByText('Importar con IA')).toBeInTheDocument();
    expect(screen.getByText('Ayuda')).toBeInTheDocument();
  });

  it('calls onInviteClick and closes the sheet when "Invitar Amigos" is clicked', async () => {
    const onInviteClick = vi.fn();
    const user = userEvent.setup();
    renderBottomNav({ onInviteClick });

    await user.click(screen.getByRole('button', { name: 'Más' }));
    await user.click(screen.getByText('Invitar Amigos'));

    expect(onInviteClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Invitar Amigos')).not.toBeInTheDocument();
  });

  it('calls onSmartImport and closes the sheet when "Importar con IA" is clicked', async () => {
    const onSmartImport = vi.fn();
    const user = userEvent.setup();
    renderBottomNav({ onSmartImport });

    await user.click(screen.getByRole('button', { name: 'Más' }));
    await user.click(screen.getByText('Importar con IA'));

    expect(onSmartImport).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Importar con IA')).not.toBeInTheDocument();
  });

  it('calls onHelpClick and closes the sheet when "Ayuda" is clicked', async () => {
    const onHelpClick = vi.fn();
    const user = userEvent.setup();
    renderBottomNav({ onHelpClick });

    await user.click(screen.getByRole('button', { name: 'Más' }));
    await user.click(screen.getByText('Ayuda'));

    expect(onHelpClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Ayuda')).not.toBeInTheDocument();
  });
});
