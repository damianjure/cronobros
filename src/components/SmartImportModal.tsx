import { useEffect, useState, type CSSProperties } from 'react';
import { FileUp, LoaderCircle, Sparkles, Trash2, X } from 'lucide-react';
import {
  IMPORTED_ACTIVITY_TYPES,
  importTravelTextCallable,
  importTravelDocumentCallable,
  type ImportedActivity,
  type TravelTextExtractor,
} from '../services/smartImportCallable';

interface SmartImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (activities: ImportedActivity[]) => Promise<void>;
  extract?: TravelTextExtractor;
  extractDocument?: typeof importTravelDocumentCallable;
}

const TYPE_LABELS: Record<ImportedActivity['type'], string> = {
  Transportation: 'Traslado',
  Accommodation: 'Alojamiento',
  Dining: 'Gastronomía',
  Sightseeing: 'Turismo',
  Adventure: 'Aventura',
  Relaxation: 'Relajación',
};

export default function SmartImportModal({
  isOpen,
  onClose,
  onConfirm,
  extract = importTravelTextCallable,
  extractDocument = importTravelDocumentCallable,
}: SmartImportModalProps) {
  const [text, setText] = useState('');
  const [activities, setActivities] = useState<ImportedActivity[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setText('');
      setActivities([]);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const updateActivity = (index: number, patch: Partial<ImportedActivity>) => {
    setActivities(current => current.map((activity, i) => i === index ? { ...activity, ...patch } : activity));
  };

  const analyze = async () => {
    if (text.trim().length < 10) {
      setError('Pegá al menos 10 caracteres para analizar.');
      return;
    }
    setIsAnalyzing(true);
    setError('');
    try {
      const result = await extract(text.trim());
      setActivities(result.activities);
    } catch {
      setError('No pudimos analizar ese texto. Revisalo e intentá nuevamente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeFile = async (file: File) => {
    setIsAnalyzing(true);
    setError('');
    try {
      const result = await extractDocument(file);
      setActivities(result.activities);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'No pudimos analizar ese archivo.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const confirm = async () => {
    if (activities.some(activity => !activity.date || !activity.title.trim())) {
      setError('Cada actividad necesita fecha y título.');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      await onConfirm(activities);
      onClose();
    } catch {
      setError('No pudimos guardar las actividades. Intentá nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-primary/40 p-4 backdrop-blur-sm">
      <md-elevated-card style={{ display: 'block' } as CSSProperties} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto p-6">
        <div className="mb-5 flex items-start justify-between border-b border-brand-primary/10 pb-4">
          <div>
            <h2 className="flex items-center gap-2 font-serif text-2xl font-black italic text-brand-primary">
              <Sparkles className="h-5 w-5 text-brand-sunset" /> Importar con IA
            </h2>
            <p className="mt-1 text-xs text-brand-on-surface-variant">
              Pegá reservas, confirmaciones o un itinerario. Vas a revisar todo antes de guardarlo.
            </p>
          </div>
          <md-icon-button onClick={onClose} aria-label="Cerrar importación">
            <X className="h-5 w-5" />
          </md-icon-button>
        </div>

        {activities.length === 0 ? (
          <div className="space-y-4">
            <md-outlined-text-field
              label="Texto del viaje"
              type="textarea"
              rows={10}
              value={text}
              onInput={event => setText(event.currentTarget.value)}
              maxLength={20000}
              placeholder="Ej.: Vuelo AR1132, 14/08/2026 a las 08:15 desde Ezeiza..."
              style={{ width: '100%' }}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2 border border-brand-primary/20 px-4 py-3 text-xs font-bold uppercase tracking-wider text-brand-primary hover:bg-brand-primary/5">
                <FileUp className="h-4 w-4" /> PDF o imagen
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={isAnalyzing}
                  onChange={event => {
                    const file = event.target.files?.[0];
                    if (file) void analyzeFile(file);
                    event.target.value = '';
                  }}
                />
              </label>
              <md-filled-button onClick={analyze} disabled={isAnalyzing}>
                {isAnalyzing && <LoaderCircle slot="icon" className="h-4 w-4 animate-spin" />}
                Analizar con IA
              </md-filled-button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-brand-primary">Vista previa editable</h3>
              <md-text-button onClick={() => setActivities([])}>Volver al texto</md-text-button>
            </div>
            {activities.map((activity, index) => (
              <div key={`${activity.date}-${index}`} className="grid gap-3 border border-brand-primary/15 bg-brand-surface-low p-4 md:grid-cols-6">
                <md-outlined-text-field
                  aria-label={`Título ${index + 1}`}
                  value={activity.title}
                  onInput={event => updateActivity(index, { title: event.currentTarget.value })}
                  className="md:col-span-3"
                  style={{ width: '100%' }}
                />
                <input aria-label={`Fecha ${index + 1}`} type="date" value={activity.date} onChange={event => updateActivity(index, { date: event.target.value })} className="border border-brand-primary/15 bg-white p-2 text-sm md:col-span-2" />
                <md-icon-button
                  aria-label={`Eliminar actividad ${index + 1}`}
                  onClick={() => setActivities(current => current.filter((_, i) => i !== index))}
                  style={{ '--md-icon-button-icon-color': 'var(--md-sys-color-error)' } as CSSProperties}
                >
                  <Trash2 className="h-4 w-4" />
                </md-icon-button>
                <input aria-label={`Hora ${index + 1}`} type="time" value={activity.time} onChange={event => updateActivity(index, { time: event.target.value })} className="border border-brand-primary/15 bg-white p-2 text-sm md:col-span-2" />
                <md-outlined-select
                  aria-label={`Tipo ${index + 1}`}
                  value={activity.type}
                  onChange={event => updateActivity(index, { type: event.currentTarget.value as ImportedActivity['type'] })}
                  className="md:col-span-2"
                  style={{ width: '100%', minWidth: 0 }}
                >
                  {IMPORTED_ACTIVITY_TYPES.map(type => (
                    <md-select-option key={type} value={type} selected={type === activity.type}>
                      <div slot="headline">{TYPE_LABELS[type]}</div>
                    </md-select-option>
                  ))}
                </md-outlined-select>
                <md-outlined-text-field
                  aria-label={`Ubicación ${index + 1}`}
                  value={activity.location}
                  onInput={event => updateActivity(index, { location: event.currentTarget.value })}
                  placeholder="Ubicación"
                  className="md:col-span-2"
                  style={{ width: '100%' }}
                />
                <md-outlined-text-field
                  aria-label={`Descripción ${index + 1}`}
                  type="textarea"
                  rows={2}
                  value={activity.description}
                  onInput={event => updateActivity(index, { description: event.currentTarget.value })}
                  placeholder="Descripción"
                  className="md:col-span-6"
                  style={{ width: '100%' }}
                />
              </div>
            ))}
            <div className="flex justify-end">
              <md-filled-button onClick={confirm} disabled={isSaving || activities.length === 0}>
                {isSaving && <LoaderCircle slot="icon" className="h-4 w-4 animate-spin" />}
                Agregar {activities.length} {activities.length === 1 ? 'actividad' : 'actividades'}
              </md-filled-button>
            </div>
          </div>
        )}

        {error && <p role="alert" className="mt-4 border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</p>}
      </md-elevated-card>
    </div>
  );
}
