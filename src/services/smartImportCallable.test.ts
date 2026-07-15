import { beforeEach, describe, expect, it, vi } from 'vitest';

const callable = vi.fn();
const httpsCallable = vi.fn(() => callable);

vi.mock('firebase/functions', () => ({ httpsCallable }));
vi.mock('../lib/firebase', () => ({ functions: {} }));

describe('importTravelTextCallable', () => {
  beforeEach(() => {
    callable.mockReset();
    httpsCallable.mockClear();
  });

  it('calls the authenticated Firebase function and returns its activities', async () => {
    const activities = [{
      date: '2026-08-14',
      time: '08:15',
      title: 'Vuelo a Madrid',
      description: '',
      location: 'EZE',
      type: 'Transportation',
    }];
    callable.mockResolvedValue({ data: { activities } });

    const { importTravelTextCallable } = await import('./smartImportCallable');

    await expect(importTravelTextCallable('Reserva de vuelo a Madrid')).resolves.toEqual({ activities });
    expect(httpsCallable).toHaveBeenCalledWith({}, 'importTravelText');
    expect(callable).toHaveBeenCalledWith({ text: 'Reserva de vuelo a Madrid' });
  });
});
