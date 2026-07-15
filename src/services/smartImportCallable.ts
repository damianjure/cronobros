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
export type TravelDocumentExtractor = (file: File) => Promise<SmartImportResult>;

export const importTravelTextCallable: TravelTextExtractor = async text => {
  const callable = httpsCallable<{ text: string }, SmartImportResult>(functions, 'importTravelText');
  const result = await callable({ text });
  return result.data;
};

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.readAsDataURL(file);
  });
}

export const importTravelDocumentCallable: TravelDocumentExtractor = async file => {
  if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Formato no permitido.');
  }
  if (file.size > 7 * 1024 * 1024) throw new Error('El archivo supera 7 MB.');
  const data = await readFileAsBase64(file);
  const callable = httpsCallable<{ data: string; mimeType: string }, SmartImportResult>(functions, 'importTravelDocument');
  const result = await callable({ data, mimeType: file.type });
  return result.data;
};
