import type { ImportedActivity } from './smartImportCallable';
import type { ItineraryActivity, ItineraryDay } from '../types';
import { getDayOfWeekInSpanish } from '../utils/date';

interface SaveImportedActivitiesOptions {
  imported: ImportedActivity[];
  itinerary: ItineraryDay[];
  participants: string[];
  addActivity: (dayId: string, activity: ItineraryActivity) => Promise<void>;
  addDay: (day: ItineraryDay) => Promise<void>;
  idFactory?: (prefix: string) => string;
}

export async function saveImportedActivities({
  imported,
  itinerary,
  participants,
  addActivity,
  addDay,
  idFactory = prefix => `${prefix}-${crypto.randomUUID()}`,
}: SaveImportedActivitiesOptions): Promise<void> {
  const existingDays = new Map(itinerary.map(day => [day.date, day]));
  const newDates = new Map<string, ImportedActivity[]>();

  const toActivity = (item: ImportedActivity): ItineraryActivity => ({
    id: idFactory('act-import'),
    time: item.time || 'Sin horario',
    type: item.type,
    title: item.title,
    description: item.description,
    location: item.location,
    status: 'Smart Imported',
    people: participants,
  });

  for (const item of imported) {
    const existingDay = existingDays.get(item.date);
    if (existingDay) {
      await addActivity(existingDay.id, toActivity(item));
      continue;
    }
    newDates.set(item.date, [...(newDates.get(item.date) ?? []), item]);
  }

  for (const [date, activities] of [...newDates].sort(([a], [b]) => a.localeCompare(b))) {
    const location = activities.find(item => item.location)?.location || 'Sin ubicación';
    await addDay({
      id: idFactory('day-import'),
      dayNumber: 0,
      date,
      dayOfWeek: getDayOfWeekInSpanish(date),
      title: 'Actividades importadas',
      location,
      activities: activities.map(toActivity),
    });
  }
}
