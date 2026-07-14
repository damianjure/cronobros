import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TripsGate from './TripsGate';

vi.mock('./TripsListView', () => ({
  default: ({ onSelectTrip }: { onSelectTrip: (id: string) => void }) => (
    <button onClick={() => onSelectTrip('trip-1')}>select-trip-stub</button>
  ),
}));

describe('TripsGate', () => {
  it('renders the trips list first, not the children', () => {
    render(
      <TripsGate>
        <div data-testid="app-stub">App</div>
      </TripsGate>,
    );

    expect(screen.getByText('select-trip-stub')).toBeInTheDocument();
    expect(screen.queryByTestId('app-stub')).not.toBeInTheDocument();
  });

  it('renders children once a trip has been selected', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();

    render(
      <TripsGate>
        <div data-testid="app-stub">App</div>
      </TripsGate>,
    );
    await user.click(screen.getByText('select-trip-stub'));

    expect(screen.getByTestId('app-stub')).toBeInTheDocument();
  });
});
