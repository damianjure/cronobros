import { describe, expect, it } from 'vitest';
import { searchTripData } from './tripSearch';

describe('searchTripData', () => {
  it('finds real activities, pins and critical events and routes to their views', () => {
    const results = searchTripData('madrid', [{
      id: 'day-1', dayNumber: 1, date: '2026-08-14', dayOfWeek: 'Viernes', title: 'Llegada', location: 'Madrid',
      activities: [{ id: 'a1', time: '10:00', type: 'Sightseeing', title: 'Museo', description: '', location: 'Madrid' }],
    }], [{ id: 'p1', title: 'Plaza Madrid', description: '', category: 'Lugar', image: '', coords: { lat: 1, lon: 2 } }], [{
      id: 'e1', type: 'hotel', title: 'Hotel Madrid', subType: 'Check-in', locationName: 'Madrid', coords: { lat: 1, lon: 2 }, targetTimeStr: '15:00', description: '', warningMessage: '',
    }]);
    expect(results.map(result => result.tab)).toEqual(['itinerary', 'map', 'dashboard']);
  });
});
