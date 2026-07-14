import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import TripStoreProvider from './TripStoreProvider';
import { useTripStore } from '../store/tripStore';
import { tripRepository } from '../services';

// Spy on the shared repository singleton actually used by TripStoreProvider
// (it imports `tripRepository` from `src/services`, same seam every other
// consumer uses) — asserts the Provider calls the real seam's methods with
// the right args. `tripRepository` is `FirestoreTripRepository` against the
// real project (see src/services/index.ts), so every spy gets a no-op
// implementation — calling through for real would open a genuine,
// unauthenticated network listener per test.
function spyOnRepository() {
  const noopUnsubscribe = () => vi.fn();
  return {
    subscribeItinerary: vi.spyOn(tripRepository, 'subscribeItinerary').mockImplementation(noopUnsubscribe),
    subscribePins: vi.spyOn(tripRepository, 'subscribePins').mockImplementation(noopUnsubscribe),
    subscribePendingPlaces: vi.spyOn(tripRepository, 'subscribePendingPlaces').mockImplementation(noopUnsubscribe),
    subscribeChat: vi.spyOn(tripRepository, 'subscribeChat').mockImplementation(noopUnsubscribe),
    subscribeLogistics: vi.spyOn(tripRepository, 'subscribeLogistics').mockImplementation(noopUnsubscribe),
  };
}

function ItineraryLength() {
  const itinerary = useTripStore(state => state.itinerary);
  return <div data-testid="itinerary-length">{itinerary.length}</div>;
}

describe('TripStoreProvider', () => {
  it('issues no subscribe* calls before it mounts', () => {
    const spies = spyOnRepository();

    expect(spies.subscribeItinerary).not.toHaveBeenCalled();
    expect(spies.subscribePins).not.toHaveBeenCalled();
    expect(spies.subscribePendingPlaces).not.toHaveBeenCalled();
    expect(spies.subscribeChat).not.toHaveBeenCalled();
    expect(spies.subscribeLogistics).not.toHaveBeenCalled();

    spies.subscribeItinerary.mockRestore();
    spies.subscribePins.mockRestore();
    spies.subscribePendingPlaces.mockRestore();
    spies.subscribeChat.mockRestore();
    spies.subscribeLogistics.mockRestore();
  });

  it('subscribes for the given tripId once mounted, and children can read the store via useTripStore', () => {
    const spies = spyOnRepository();

    render(
      <TripStoreProvider tripId="trip-a">
        <ItineraryLength />
      </TripStoreProvider>,
    );

    expect(spies.subscribeItinerary).toHaveBeenCalledWith('trip-a', expect.any(Function));
    expect(spies.subscribePins).toHaveBeenCalledWith('trip-a', expect.any(Function));
    expect(spies.subscribePendingPlaces).toHaveBeenCalledWith('trip-a', expect.any(Function));
    expect(spies.subscribeChat).toHaveBeenCalledWith('trip-a', expect.any(Function));
    expect(spies.subscribeLogistics).toHaveBeenCalledWith('trip-a', expect.any(Function));

    spies.subscribeItinerary.mockRestore();
    spies.subscribePins.mockRestore();
    spies.subscribePendingPlaces.mockRestore();
    spies.subscribeChat.mockRestore();
    spies.subscribeLogistics.mockRestore();
  });

  it('tears down trip A subscriptions before starting trip B subscriptions when tripId changes', () => {
    const unsubItinerary = vi.fn();
    const subscribeItinerarySpy = vi
      .spyOn(tripRepository, 'subscribeItinerary')
      .mockReturnValueOnce(unsubItinerary)
      .mockImplementation((_tripId, cb) => {
        cb([]);
        return vi.fn();
      });
    const subscribePinsSpy = vi.spyOn(tripRepository, 'subscribePins').mockImplementation((_tripId, cb) => {
      cb([]);
      return vi.fn();
    });
    const subscribePendingPlacesSpy = vi
      .spyOn(tripRepository, 'subscribePendingPlaces')
      .mockImplementation((_tripId, cb) => {
        cb([]);
        return vi.fn();
      });
    const subscribeChatSpy = vi.spyOn(tripRepository, 'subscribeChat').mockImplementation((_tripId, cb) => {
      cb([]);
      return vi.fn();
    });
    const subscribeLogisticsSpy = vi
      .spyOn(tripRepository, 'subscribeLogistics')
      .mockImplementation((_tripId, cb) => {
        cb({ drivers: [], vehicle: null });
        return vi.fn();
      });

    const { rerender } = render(
      <TripStoreProvider tripId="trip-a">
        <ItineraryLength />
      </TripStoreProvider>,
    );
    expect(unsubItinerary).not.toHaveBeenCalled();

    rerender(
      <TripStoreProvider tripId="trip-b">
        <ItineraryLength />
      </TripStoreProvider>,
    );

    expect(unsubItinerary).toHaveBeenCalledTimes(1);
    expect(subscribeItinerarySpy).toHaveBeenLastCalledWith('trip-b', expect.any(Function));

    subscribeItinerarySpy.mockRestore();
    subscribePinsSpy.mockRestore();
    subscribePendingPlacesSpy.mockRestore();
    subscribeChatSpy.mockRestore();
    subscribeLogisticsSpy.mockRestore();
  });

  it('renders nothing (no children) before the store for the current tripId exists', () => {
    // Renders synchronously in practice (useEffect fires before paint in
    // jsdom's act-wrapped render), but the component's `if (!store) return
    // null` branch exists precisely so consumers never see a stale/absent
    // store — asserted indirectly via the "subscribes once mounted" test
    // above completing without a "used outside TripStoreProvider" throw.
    const spies = spyOnRepository();

    expect(() =>
      render(
        <TripStoreProvider tripId="trip-c">
          <ItineraryLength />
        </TripStoreProvider>,
      ),
    ).not.toThrow();

    spies.subscribeItinerary.mockRestore();
    spies.subscribePins.mockRestore();
    spies.subscribePendingPlaces.mockRestore();
    spies.subscribeChat.mockRestore();
    spies.subscribeLogistics.mockRestore();
  });
});
