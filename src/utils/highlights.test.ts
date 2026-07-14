import { describe, it, expect } from 'vitest';
import { deriveUpcomingHighlights } from './highlights';
import type { ItineraryDay } from '../types';

function makeDay(overrides: Partial<ItineraryDay> = {}): ItineraryDay {
  return {
    id: 'day-1',
    dayNumber: 1,
    date: '2026-08-12',
    dayOfWeek: 'Lunes',
    title: 'Día de prueba',
    location: 'Islandia',
    activities: [],
    ...overrides,
  };
}

describe('deriveUpcomingHighlights', () => {
  it('returns an empty list for an empty itinerary (genuinely empty new trip)', () => {
    expect(deriveUpcomingHighlights([])).toEqual([]);
  });

  it('flattens activities across days, in day order, up to the given limit', () => {
    const itinerary = [
      makeDay({
        id: 'day-1',
        dayNumber: 1,
        activities: [
          { id: 'act-1', time: '10:00 AM', type: 'Dining', title: 'Cena', description: 'desc' },
        ],
      }),
      makeDay({
        id: 'day-2',
        dayNumber: 2,
        activities: [
          { id: 'act-2', time: '9:00 AM', type: 'Sightseeing', title: 'Paseo', description: 'desc-2' },
          { id: 'act-3', time: '11:00 AM', type: 'Adventure', title: 'Aventura', description: 'desc-3' },
        ],
      }),
    ];

    const result = deriveUpcomingHighlights(itinerary, 2);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ id: 'act-1', day: 1, title: 'Cena', type: 'Dining' });
    expect(result[1]).toMatchObject({ id: 'act-2', day: 2, title: 'Paseo', type: 'Sightseeing' });
  });

  it('derives a CONFIRMED status from an activity status mentioning confirmation', () => {
    const itinerary = [
      makeDay({
        activities: [
          {
            id: 'act-1',
            time: '10:00 AM',
            type: 'Dining',
            title: 'Cena',
            description: 'desc',
            status: 'Reserva Confirmada',
          },
        ],
      }),
    ];

    expect(deriveUpcomingHighlights(itinerary)[0].status).toBe('CONFIRMED');
  });

  it('derives a RESERVED status from an activity status mentioning a reservation', () => {
    const itinerary = [
      makeDay({
        activities: [
          { id: 'act-1', time: '10:00 AM', type: 'Dining', title: 'Cena', description: 'desc', status: 'Reservado' },
        ],
      }),
    ];

    expect(deriveUpcomingHighlights(itinerary)[0].status).toBe('RESERVED');
  });

  it('defaults to PENDING when the activity has no recognizable status', () => {
    const itinerary = [
      makeDay({
        activities: [{ id: 'act-1', time: '10:00 AM', type: 'Dining', title: 'Cena', description: 'desc' }],
      }),
    ];

    expect(deriveUpcomingHighlights(itinerary)[0].status).toBe('PENDING');
  });

  it('falls back to an empty image string when the activity has none', () => {
    const itinerary = [
      makeDay({
        activities: [{ id: 'act-1', time: '10:00 AM', type: 'Dining', title: 'Cena', description: 'desc' }],
      }),
    ];

    expect(deriveUpcomingHighlights(itinerary)[0].image).toBe('');
  });
});
