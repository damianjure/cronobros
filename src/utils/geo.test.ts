import { describe, expect, it } from 'vitest';
import { calculateDistanceInKm } from './geo';

describe('calculateDistanceInKm', () => {
  it('returns ~111.2km for two points exactly 1 degree of longitude apart at the equator', () => {
    const distance = calculateDistanceInKm(0, 0, 0, 1);
    expect(distance).toBeCloseTo(111.19, 1);
  });

  it('returns 0 for identical coordinates', () => {
    const distance = calculateDistanceInKm(63.4186, -19.006, 63.4186, -19.006);
    expect(distance).toBeCloseTo(0, 5);
  });

  it('matches the known Reykjavik-to-Vik distance within a small tolerance', () => {
    // Reykjavik preset (64.1265, -21.8174) to Vik i Myrdal (63.4186, -19.0060)
    // Known great-circle distance is ~155km.
    const distance = calculateDistanceInKm(64.1265, -21.8174, 63.4186, -19.006);
    expect(distance).toBeGreaterThan(145);
    expect(distance).toBeLessThan(165);
  });
});
