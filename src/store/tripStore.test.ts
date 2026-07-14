import { describe, it, expect, vi } from 'vitest';
import { createTripStore } from './tripStore';
import { InMemoryTripRepository } from '../services/inMemoryTripRepository';
import type { ItineraryDay, PendingPlace } from '../types';

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

describe('tripStore', () => {
  it('hydrates itinerary/pins/pendingPlaces/chatMessages from the repository on creation', () => {
    const seedDays = [makeDay()];
    const repo = new InMemoryTripRepository({ itinerary: seedDays, pendingPlaces: [], pins: [], chat: [] });

    const { store } = createTripStore(repo, 'trip-1');

    expect(store.getState().itinerary).toEqual(seedDays);
    expect(store.getState().pendingPlaces).toEqual([]);
    expect(store.getState().pins).toEqual([]);
    expect(store.getState().chatMessages).toEqual([]);
  });

  it('addActivity delegates to the repository (scoped to the given tripId) and updates store state reactively', async () => {
    const repo = new InMemoryTripRepository({ itinerary: [makeDay()] });
    const addActivitySpy = vi.spyOn(repo, 'addActivity');
    const { store } = createTripStore(repo, 'trip-1');

    await store.getState().addActivity('day-1', {
      id: 'act-1',
      time: '10:00 AM',
      type: 'Dining',
      title: 'Cena',
      description: '',
    });

    expect(store.getState().itinerary[0].activities).toHaveLength(1);
    expect(addActivitySpy).toHaveBeenCalledWith('trip-1', 'day-1', expect.objectContaining({ id: 'act-1' }));
  });

  it('deleteActivity delegates to the repository and updates store state reactively', async () => {
    const repo = new InMemoryTripRepository({
      itinerary: [
        makeDay({
          activities: [{ id: 'act-1', time: '10:00 AM', type: 'Dining', title: 'Cena', description: '' }],
        }),
      ],
    });
    const { store } = createTripStore(repo, 'trip-1');

    await store.getState().deleteActivity('day-1', 'act-1');

    expect(store.getState().itinerary[0].activities).toHaveLength(0);
  });

  it('approvePlace moves a pending place into the itinerary and updates all affected slices', async () => {
    const place: PendingPlace = {
      id: 'pending-1',
      title: 'Lugar',
      category: 'Turismo',
      description: 'desc',
      location: 'loc',
    };
    const repo = new InMemoryTripRepository({
      itinerary: [makeDay()],
      pendingPlaces: [place],
      pins: [],
    });
    const { store } = createTripStore(repo, 'trip-1');

    await store.getState().approvePlace('pending-1', 'day-1');

    expect(store.getState().itinerary[0].activities).toHaveLength(1);
    expect(store.getState().pendingPlaces).toHaveLength(0);
    expect(store.getState().pins).toHaveLength(1);
  });

  it('two independent stores over two independent repositories/tripIds do not share state', async () => {
    const repoA = new InMemoryTripRepository({ itinerary: [makeDay({ id: 'a' })] });
    const repoB = new InMemoryTripRepository({ itinerary: [makeDay({ id: 'b' })] });
    const { store: storeA } = createTripStore(repoA, 'trip-a');
    const { store: storeB } = createTripStore(repoB, 'trip-b');

    await storeA.getState().addActivity('a', {
      id: 'act-1',
      time: '10:00 AM',
      type: 'Dining',
      title: 'Cena',
      description: '',
    });

    expect(storeA.getState().itinerary[0].activities).toHaveLength(1);
    expect(storeB.getState().itinerary[0].activities).toHaveLength(0);
  });

  describe('teardown (spec "Store is auth- and trip-gated, not a module-load singleton")', () => {
    it('does not issue any subscribe* call until createTripStore is invoked for a tripId', () => {
      const repo = new InMemoryTripRepository({ itinerary: [makeDay()] });
      const subscribeItinerarySpy = vi.spyOn(repo, 'subscribeItinerary');
      const subscribePinsSpy = vi.spyOn(repo, 'subscribePins');
      const subscribePendingPlacesSpy = vi.spyOn(repo, 'subscribePendingPlaces');
      const subscribeChatSpy = vi.spyOn(repo, 'subscribeChat');

      expect(subscribeItinerarySpy).not.toHaveBeenCalled();
      expect(subscribePinsSpy).not.toHaveBeenCalled();
      expect(subscribePendingPlacesSpy).not.toHaveBeenCalled();
      expect(subscribeChatSpy).not.toHaveBeenCalled();

      createTripStore(repo, 'trip-1');

      expect(subscribeItinerarySpy).toHaveBeenCalledTimes(1);
      expect(subscribePinsSpy).toHaveBeenCalledTimes(1);
      expect(subscribePendingPlacesSpy).toHaveBeenCalledTimes(1);
      expect(subscribeChatSpy).toHaveBeenCalledTimes(1);
    });

    it('teardown() unsubscribes all four subscriptions', () => {
      const repo = new InMemoryTripRepository({ itinerary: [makeDay()] });
      const unsubscribeItinerary = vi.fn();
      const unsubscribePins = vi.fn();
      const unsubscribePendingPlaces = vi.fn();
      const unsubscribeChat = vi.fn();
      vi.spyOn(repo, 'subscribeItinerary').mockReturnValue(unsubscribeItinerary);
      vi.spyOn(repo, 'subscribePins').mockReturnValue(unsubscribePins);
      vi.spyOn(repo, 'subscribePendingPlaces').mockReturnValue(unsubscribePendingPlaces);
      vi.spyOn(repo, 'subscribeChat').mockReturnValue(unsubscribeChat);

      const { teardown } = createTripStore(repo, 'trip-1');
      teardown();

      expect(unsubscribeItinerary).toHaveBeenCalledTimes(1);
      expect(unsubscribePins).toHaveBeenCalledTimes(1);
      expect(unsubscribePendingPlaces).toHaveBeenCalledTimes(1);
      expect(unsubscribeChat).toHaveBeenCalledTimes(1);
    });

    it('switching tripId tears down the old subscriptions before the new store starts its own', () => {
      const repo = new InMemoryTripRepository({ itinerary: [makeDay()] });
      const unsubscribeA = vi.fn();
      const unsubscribeB = vi.fn();
      const subscribeItinerarySpy = vi
        .spyOn(repo, 'subscribeItinerary')
        .mockReturnValueOnce(unsubscribeA)
        .mockReturnValueOnce(unsubscribeB);

      const handleA = createTripStore(repo, 'trip-a');
      expect(unsubscribeA).not.toHaveBeenCalled();

      // Simulate the TripStoreProvider's tripId-change effect: tear down the
      // old handle, then create the new one.
      handleA.teardown();
      expect(unsubscribeA).toHaveBeenCalledTimes(1);

      createTripStore(repo, 'trip-b');
      expect(subscribeItinerarySpy).toHaveBeenCalledTimes(2);
      expect(subscribeItinerarySpy).toHaveBeenNthCalledWith(2, 'trip-b', expect.any(Function));
      expect(unsubscribeB).not.toHaveBeenCalled();
    });
  });
});
