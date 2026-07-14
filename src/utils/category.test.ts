import { describe, expect, it } from 'vitest';
import { mapCategoryToActivityType } from './category';
import { PendingPlace } from '../types';

describe('mapCategoryToActivityType', () => {
  const cases: Array<[PendingPlace['category'], string]> = [
    ['Relajación', 'Relaxation'],
    ['Gastronomía', 'Dining'],
    ['Turismo', 'Sightseeing'],
    ['Aventura', 'Adventure'],
    ['Alojamiento', 'Accommodation'],
  ];

  it.each(cases)('maps %s to %s', (category, expected) => {
    expect(mapCategoryToActivityType(category)).toBe(expected);
  });

  it('covers every PendingPlace category with a defined, intentional mapping', () => {
    const allCategories: PendingPlace['category'][] = [
      'Relajación',
      'Gastronomía',
      'Turismo',
      'Aventura',
      'Alojamiento',
    ];
    for (const category of allCategories) {
      expect(mapCategoryToActivityType(category)).toBeDefined();
    }
  });
});
