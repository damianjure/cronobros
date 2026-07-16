import { describe, expect, it, vi } from 'vitest';
import { saveImportedActivities } from './saveImportedActivities';

describe('saveImportedActivities', () => {
  it('adds to existing dates and groups new dates into one itinerary day', async () => {
    const addActivity = vi.fn().mockResolvedValue(undefined);
    const addDay = vi.fn().mockResolvedValue(undefined);

    await saveImportedActivities({
      imported: [
        { date: '2026-08-14', time: '08:15', title: 'Vuelo', description: '', location: 'EZE', type: 'Transportation' },
        { date: '2026-08-15', time: '', title: 'Hotel', description: '', location: 'Madrid', type: 'Accommodation' },
        { date: '2026-08-15', time: '20:00', title: 'Cena', description: '', location: 'Centro', type: 'Dining' },
      ],
      itinerary: [{ id: 'day-existing', dayNumber: 1, date: '2026-08-14', dayOfWeek: 'Viernes', title: 'Llegada', location: 'Madrid', activities: [] }],
      participants: ['Damian'],
      addActivity,
      addDay,
      idFactory: (() => { let id = 0; return prefix => `${prefix}-${++id}`; })(),
    });

    expect(addActivity).toHaveBeenCalledTimes(1);
    expect(addActivity).toHaveBeenCalledWith('day-existing', expect.objectContaining({ title: 'Vuelo', type: 'Transportation' }));
    expect(addDay).toHaveBeenCalledTimes(1);
    expect(addDay).toHaveBeenCalledWith(expect.objectContaining({
      date: '2026-08-15',
      location: 'Madrid',
      activities: [
        expect.objectContaining({ title: 'Hotel' }),
        expect.objectContaining({ title: 'Cena' }),
      ],
    }));
  });
});
