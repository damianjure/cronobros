import type { ItineraryDay, ChatMessage, PinnedPoint, PendingPlace } from './types';

// Legacy compatibility exports. Production and test repositories now start
// from explicit, empty or injected state; no destination fixture is bundled.
export const initialItinerary: ItineraryDay[] = [];
export const initialChatMessages: ChatMessage[] = [];
export const pinnedPoints: PinnedPoint[] = [];
export const initialPendingPlaces: PendingPlace[] = [];
