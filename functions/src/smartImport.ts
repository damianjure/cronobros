import { GoogleGenAI } from '@google/genai';

export interface ImportedActivity {
  date: string;
  time: string;
  title: string;
  description: string;
  location: string;
  type: string;
}

export interface SmartImportResult {
  activities: ImportedActivity[];
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`La actividad no contiene ${field}.`);
  }
  return value.trim();
}

export function parseSmartImportResponse(raw: string): SmartImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Gemini no devolvió JSON válido.');
  }
  if (!parsed || typeof parsed !== 'object' || !('activities' in parsed)) {
    throw new Error('La respuesta no contiene actividades.');
  }
  const activities = (parsed as { activities: unknown }).activities;
  if (!Array.isArray(activities) || activities.length === 0) {
    throw new Error('La respuesta no contiene actividades.');
  }
  if (activities.length > 20) throw new Error('La respuesta contiene demasiadas actividades.');

  return {
    activities: activities.map(item => {
      if (!item || typeof item !== 'object') throw new Error('Actividad inválida.');
      const value = item as Record<string, unknown>;
      const date = requiredString(value.date, 'fecha');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('La actividad contiene una fecha inválida.');
      return {
        date,
        time: requiredString(value.time, 'hora'),
        title: requiredString(value.title, 'título'),
        description: typeof value.description === 'string' ? value.description.trim() : '',
        location: typeof value.location === 'string' ? value.location.trim() : '',
        type: requiredString(value.type, 'tipo'),
      };
    }),
  };
}

export async function extractTravelActivities(text: string): Promise<SmartImportResult> {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: 'crono-viajes-1779401310',
    location: 'global',
    apiVersion: 'v1',
  });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Extraé actividades concretas del siguiente texto de viaje. Devolvé solamente JSON con la forma {"activities":[{"date":"YYYY-MM-DD","time":"HH:mm","title":"...","description":"...","location":"...","type":"Transportation|Accommodation|Dining|Sightseeing|Adventure|Relaxation"}]}. No inventes datos; si una hora o ubicación no aparece, usá cadena vacía. La fecha y el título son obligatorios. Máximo 20 actividades.\n\nTEXTO:\n${text}`,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  });
  return parseSmartImportResponse(response.text ?? '');
}
