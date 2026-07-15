import { InMemoryTripRepository } from './inMemoryTripRepository';
import { runTripRepositoryContractTests } from './tripRepository.contract';
import type { PinnedPoint } from '../types';

// tripId is accepted (per the port signature) but unused by this adapter —
// each test in the shared contract still passes a fresh id, ignored here.
runTripRepositoryContractTests('InMemoryTripRepository', async (_tripId, seed) => {
  void _tripId;
  return new InMemoryTripRepository({
    itinerary: seed?.itinerary,
    pins: seed?.pins as PinnedPoint[] | undefined,
    pendingPlaces: seed?.pendingPlaces,
    chat: seed?.chat,
    logistics: seed?.logistics,
    criticalEvents: seed?.criticalEvents,
  });
});
