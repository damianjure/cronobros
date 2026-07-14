import { ItineraryActivity, PendingPlace } from '../types';

// Exhaustive mapping: every PendingPlace category maps to an explicit,
// intentional ActivityType. No default fallthrough — adding a new category
// to PendingPlace['category'] without updating this map is a compile error.
export function mapCategoryToActivityType(
  category: PendingPlace['category'],
): ItineraryActivity['type'] {
  switch (category) {
    case 'Relajación':
      return 'Relaxation';
    case 'Gastronomía':
      return 'Dining';
    case 'Turismo':
      return 'Sightseeing';
    case 'Aventura':
      return 'Adventure';
    case 'Alojamiento':
      return 'Accommodation';
  }
}
