import { describe, expect, it } from 'vitest';
import { calculateCountdown, formatDateToDisplay, getDayOfWeekInSpanish } from './date';

describe('calculateCountdown', () => {
  it('returns the remaining hours/minutes/seconds until a target time later today', () => {
    const now = new Date(2026, 6, 13, 10, 0, 0); // 2026-07-13 10:00:00 local
    const result = calculateCountdown('15:00', now);

    expect(result.hours).toBe(5);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(0);
    expect(result.targetDate.getDate()).toBe(13);
  });

  it('rolls over to tomorrow when the target time already passed today', () => {
    const now = new Date(2026, 6, 13, 16, 0, 0); // 2026-07-13 16:00:00 local
    const result = calculateCountdown('15:00', now);

    expect(result.targetDate.getDate()).toBe(14);
    expect(result.hours).toBe(23);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(0);
  });

  it('returns zero remaining time at the exact target instant', () => {
    const now = new Date(2026, 6, 13, 15, 0, 0);
    const result = calculateCountdown('15:00', now);

    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(0);
  });
});

describe('formatDateToDisplay', () => {
  it('formats an ISO date as "day Spanish-month-abbrev"', () => {
    expect(formatDateToDisplay('2026-08-14')).toBe('14 Ago');
  });

  it('returns an already-formatted date string unchanged', () => {
    expect(formatDateToDisplay('14 Ago')).toBe('14 Ago');
  });

  it('returns an empty string for an empty input', () => {
    expect(formatDateToDisplay('')).toBe('');
  });
});

describe('getDayOfWeekInSpanish', () => {
  it('returns the Spanish weekday name for a known ISO date', () => {
    // 2026-08-14 is a Friday
    expect(getDayOfWeekInSpanish('2026-08-14')).toBe('Viernes');
  });

  it('falls back to Lunes for a malformed date string', () => {
    expect(getDayOfWeekInSpanish('not-a-date')).toBe('Lunes');
  });
});
