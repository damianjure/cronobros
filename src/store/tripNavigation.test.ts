import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderHook } from '@testing-library/react';
import { TripNavigationContext, useTripNavigation } from './tripNavigation';

describe('useTripNavigation', () => {
  it('throws when used outside a TripNavigationContext provider', () => {
    expect(() => renderHook(() => useTripNavigation())).toThrow(
      /useTripNavigation must be used within/,
    );
  });

  it('returns the provided leaveTrip callback', () => {
    let called = false;
    const leaveTrip = () => {
      called = true;
    };
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(TripNavigationContext.Provider, { value: { leaveTrip } }, children);

    const { result } = renderHook(() => useTripNavigation(), { wrapper });
    result.current.leaveTrip();

    expect(called).toBe(true);
  });
});
