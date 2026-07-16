import type { ActiveTab, CriticalEvent, ItineraryDay, PinnedPoint } from '../types';

export interface TripSearchResult {
  id: string;
  title: string;
  detail: string;
  tab: ActiveTab;
}

export function searchTripData(
  query: string,
  itinerary: ItineraryDay[],
  pins: PinnedPoint[],
  criticalEvents: CriticalEvent[],
): TripSearchResult[] {
  const normalized = query.trim().toLocaleLowerCase('es');
  if (normalized.length < 2) return [];
  const matches = (values: Array<string | undefined>) =>
    values.some(value => value?.toLocaleLowerCase('es').includes(normalized));

  const activities = itinerary.flatMap(day => day.activities
    .filter(activity => matches([activity.title, activity.description, activity.location, day.title, day.date]))
    .map(activity => ({ id: `activity-${day.id}-${activity.id}`, title: activity.title, detail: `${day.date} · ${activity.location || 'Sin ubicación'}`, tab: 'itinerary' as const })));
  const places = pins
    .filter(pin => matches([pin.title, pin.description, pin.category]))
    .map(pin => ({ id: `pin-${pin.id}`, title: pin.title, detail: pin.category, tab: 'map' as const }));
  const events = criticalEvents
    .filter(event => matches([event.title, event.description, event.locationName, event.subType]))
    .map(event => ({ id: `event-${event.id}`, title: event.title, detail: `${event.targetDate || 'Sin fecha'} · ${event.locationName}`, tab: 'dashboard' as const }));
  return [...activities, ...places, ...events].slice(0, 12);
}
