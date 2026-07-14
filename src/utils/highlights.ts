import type { ItineraryDay, UpcomingHighlight } from '../types';

/**
 * Derives the Dashboard's "upcoming highlights" from the trip's real
 * itinerary instead of the discarded `data.ts` fixture (PR5 task 5.1) —
 * flattens activities across days in day order and takes the first `limit`.
 * A brand-new trip has no itinerary yet, so this must return `[]`, not
 * Iceland's fixture highlights.
 */
export function deriveUpcomingHighlights(
  itinerary: ItineraryDay[],
  limit = 3,
): UpcomingHighlight[] {
  const highlights: UpcomingHighlight[] = [];

  for (const day of itinerary) {
    for (const activity of day.activities) {
      highlights.push({
        id: activity.id,
        day: day.dayNumber,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        image: activity.image ?? '',
        status: deriveStatus(activity.status),
      });
      if (highlights.length >= limit) return highlights;
    }
  }

  return highlights;
}

function deriveStatus(status: string | undefined): UpcomingHighlight['status'] {
  const normalized = (status ?? '').toLowerCase();
  if (normalized.includes('confirm')) return 'CONFIRMED';
  if (normalized.includes('reserv')) return 'RESERVED';
  return 'PENDING';
}
