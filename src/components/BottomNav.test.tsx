import { describe, it, expect, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BottomNav from './BottomNav';

/*
 * BottomNav uses <md-navigation-bar> (@material/web), whose shadow DOM and
 * click handling only work in a real browser — jsdom does not upgrade custom
 * elements or run their Lit render. So tab *clicks* are covered by browser
 * E2E, not here. What IS testable in jsdom is the component's own wiring: the
 * `navigation-bar-activated` listener attached via ref, and the plain-React
 * "Más" actions sheet. We drive that by dispatching the custom event the real
 * bar would emit.
 */

function renderBottomNav(overrides: Partial<React.ComponentProps<typeof BottomNav>> = {}) {
  const result = render(
    <BottomNav
      activeTab="dashboard"
      setActiveTab={vi.fn()}
      onInviteClick={vi.fn()}
      onSmartImport={vi.fn()}
      onHelpClick={vi.fn()}
      {...overrides}
    />,
  );
  return result.container.querySelector('md-navigation-bar')!;
}

function activateTab(bar: Element, activeIndex: number) {
  act(() => {
    bar.dispatchEvent(
      new CustomEvent('navigation-bar-activated', { detail: { activeIndex }, bubbles: true }),
    );
  });
}

const MORE_INDEX = 5;

describe('BottomNav', () => {
  it('renders the five destinations plus the "Más" tab', () => {
    const bar = renderBottomNav();
    expect(bar.querySelectorAll('md-navigation-tab')).toHaveLength(6);
  });

  it('navigates to the destination when its tab is activated', () => {
    const setActiveTab = vi.fn();
    const bar = renderBottomNav({ setActiveTab });

    activateTab(bar, 1);

    expect(setActiveTab).toHaveBeenCalledWith('itinerary');
  });

  it('does not show the more actions until the "Más" tab is activated', () => {
    renderBottomNav();

    expect(screen.queryByText('Invitar Amigos')).not.toBeInTheDocument();
    expect(screen.queryByText('Importar con IA')).not.toBeInTheDocument();
    expect(screen.queryByText('Ayuda')).not.toBeInTheDocument();
  });

  it('opens the actions sheet without navigating when "Más" is activated', () => {
    const setActiveTab = vi.fn();
    const bar = renderBottomNav({ setActiveTab });

    activateTab(bar, MORE_INDEX);

    expect(screen.getByText('Invitar Amigos')).toBeInTheDocument();
    expect(screen.getByText('Importar con IA')).toBeInTheDocument();
    expect(screen.getByText('Ayuda')).toBeInTheDocument();
    expect(setActiveTab).not.toHaveBeenCalled();
  });

  it('calls onInviteClick and closes the sheet when "Invitar Amigos" is clicked', async () => {
    const onInviteClick = vi.fn();
    const user = userEvent.setup();
    const bar = renderBottomNav({ onInviteClick });

    activateTab(bar, MORE_INDEX);
    await user.click(screen.getByText('Invitar Amigos'));

    expect(onInviteClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Invitar Amigos')).not.toBeInTheDocument();
  });

  it('calls onSmartImport and closes the sheet when "Importar con IA" is clicked', async () => {
    const onSmartImport = vi.fn();
    const user = userEvent.setup();
    const bar = renderBottomNav({ onSmartImport });

    activateTab(bar, MORE_INDEX);
    await user.click(screen.getByText('Importar con IA'));

    expect(onSmartImport).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Importar con IA')).not.toBeInTheDocument();
  });

  it('calls onHelpClick and closes the sheet when "Ayuda" is clicked', async () => {
    const onHelpClick = vi.fn();
    const user = userEvent.setup();
    const bar = renderBottomNav({ onHelpClick });

    activateTab(bar, MORE_INDEX);
    await user.click(screen.getByText('Ayuda'));

    expect(onHelpClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Ayuda')).not.toBeInTheDocument();
  });
});
