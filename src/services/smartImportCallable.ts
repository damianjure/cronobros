import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';

export const IMPORTED_ACTIVITY_TYPES = [
  'Transportation',
  'Accommodation',
  'Dining',
  'Sightseeing',
  'Adventure',
  'Relaxation',
] as const;

export type ImportedActivityType = (typeof IMPORTED_ACTIVITY_TYPES)[number];

export interface ImportedActivity {
  date: string;
  time: string;
  title: string;
  description: string;
  location: string;
  type: ImportedActivityType;
}

export interface SmartImportResult {
  activities: ImportedActivity[];
}

export type TravelTextExtractor = (text: string) => Promise<SmartImportResult>;

export const importTravelTextCallable: TravelTextExtractor = async text => {
  const callable = httpsCallable<{ text: string }, SmartImportResult>(functions, 'importTravelText');
  const result = await callable({ text });
  return result.data;
};
