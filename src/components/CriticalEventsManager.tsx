import { useState, type FormEvent } from 'react';
import { CalendarClock, Pencil, Plus, Trash2, X } from 'lucide-react';
import type { CriticalEvent } from '../types';

interface CriticalEventsManagerProps {
  events: CriticalEvent[];
  onSave: (event: CriticalEvent) => Promise<void>;
  onDelete: (eventId: string) => Promise<void>;
  onClose: () => void;
}

type Draft = Omit<CriticalEvent, 'id' | 'coords'> & {
  id?: string;
  latitude: string;
  longitude: string;
};

function emptyDraft(): Draft {
  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
  return {
    type: 'hotel',
    title: '',
    subType: '',
    locationName: '',
    targetDate: localDate,
    targetTimeStr: '15:00',
    description: '',
    warningMessage: '',
    latitude: '',
    longitude: '',
  };
}

export default function CriticalEventsManager({
  events,
  onSave,
  onDelete,
  onClose,
}: CriticalEventsManagerProps) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const editEvent = (event: CriticalEvent) => {
    setDraft({
      ...event,
      latitude: String(event.coords.lat),
      longitude: String(event.coords.lon),
    });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft) return;
    const latitude = Number(draft.latitude);
    const longitude = Number(draft.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

    setIsSaving(true);
    try {
      await onSave({
        id: draft.id ?? `critical-${Date.now()}`,
        type: draft.type,
        title: draft.title.trim(),
        subType: draft.subType.trim(),
        locationName: draft.locationName.trim(),
        coords: { lat: latitude, lon: longitude },
        targetDate: draft.targetDate,
        targetTimeStr: draft.targetTimeStr,
        description: draft.description.trim(),
        warningMessage: draft.warningMessage.trim(),
      });
      setDraft(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-brand-primary/45 backdrop-blur-sm p-4 flex items-center justify-center">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="critical-events-manager-title"
        className="bg-white border border-brand-primary/15 w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl"
      >
        <header className="sticky top-0 z-10 bg-brand-primary text-brand-on-primary px-5 py-4 flex items-center gap-3">
          <CalendarClock className="w-5 h-5 text-brand-sunset" />
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-on-primary/60">
              Agenda del viaje
            </p>
            <h2 id="critical-events-manager-title" className="font-serif font-black italic text-xl">
              Horarios impostergables
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar gestión de eventos"
            className="ml-auto p-2 border border-brand-on-primary/20 hover:bg-brand-on-primary/10"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="p-5 space-y-5">
          {!draft && (
            <>
              <button
                type="button"
                onClick={() => setDraft(emptyDraft())}
                className="w-full border border-dashed border-brand-primary/25 bg-brand-background p-3 text-xs font-black uppercase tracking-widest text-brand-primary flex items-center justify-center gap-2 hover:border-brand-sunset"
              >
                <Plus className="w-4 h-4 text-brand-sunset" />
                Nuevo evento crítico
              </button>

              <div className="divide-y divide-brand-primary/10 border-y border-brand-primary/10">
                {events.length === 0 ? (
                  <p className="py-8 text-center text-xs text-brand-outline">
                    Todavía no hay horarios críticos en este viaje.
                  </p>
                ) : (
                  events.map(event => (
                    <div key={event.id} className="py-3 flex items-center gap-3">
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-brand-primary truncate">{event.title}</p>
                        <p className="text-[10px] uppercase tracking-wider text-brand-outline mt-0.5">
                          {event.targetDate ?? 'Sin fecha'} · {event.targetTimeStr} · {event.locationName}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => editEvent(event)}
                        aria-label={`Editar ${event.title}`}
                        className="ml-auto p-2 border border-brand-primary/10 text-brand-primary hover:bg-brand-background"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDelete(event.id)}
                        aria-label={`Eliminar ${event.title}`}
                        className="p-2 border border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {draft && (
            <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Título" value={draft.title} onChange={title => setDraft({ ...draft, title })} />
              <label className="space-y-1 text-[10px] font-black uppercase tracking-wider text-brand-outline">
                Tipo
                <select
                  value={draft.type}
                  onChange={event => setDraft({ ...draft, type: event.target.value as CriticalEvent['type'] })}
                  className="w-full bg-brand-background border border-brand-primary/15 p-2.5 text-xs text-brand-primary"
                >
                  <option value="hotel">Alojamiento</option>
                  <option value="flight">Vuelo</option>
                  <option value="car">Vehículo</option>
                </select>
              </label>
              <Field label="Categoría breve" value={draft.subType} onChange={subType => setDraft({ ...draft, subType })} />
              <Field label="Lugar" value={draft.locationName} onChange={locationName => setDraft({ ...draft, locationName })} />
              <Field label="Fecha" type="date" value={draft.targetDate ?? ''} onChange={targetDate => setDraft({ ...draft, targetDate })} />
              <Field label="Hora límite" type="time" value={draft.targetTimeStr} onChange={targetTimeStr => setDraft({ ...draft, targetTimeStr })} />
              <Field label="Latitud" type="number" step="any" value={draft.latitude} onChange={latitude => setDraft({ ...draft, latitude })} />
              <Field label="Longitud" type="number" step="any" value={draft.longitude} onChange={longitude => setDraft({ ...draft, longitude })} />
              <Field label="Descripción" value={draft.description} onChange={description => setDraft({ ...draft, description })} className="sm:col-span-2" />
              <Field label="Advertencia" value={draft.warningMessage} onChange={warningMessage => setDraft({ ...draft, warningMessage })} className="sm:col-span-2" />

              <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setDraft(null)} className="px-4 py-2 text-xs font-bold text-brand-outline">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-brand-primary text-brand-on-primary px-5 py-2 text-xs font-black uppercase tracking-wider disabled:opacity-50"
                >
                  {isSaving ? 'Guardando…' : 'Guardar evento'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  step?: string;
  className?: string;
}

function Field({ label, value, onChange, type = 'text', step, className = '' }: FieldProps) {
  return (
    <label className={`space-y-1 text-[10px] font-black uppercase tracking-wider text-brand-outline ${className}`}>
      {label}
      <input
        required
        type={type}
        step={step}
        value={value}
        onChange={event => onChange(event.target.value)}
        className="w-full bg-brand-background border border-brand-primary/15 p-2.5 text-xs text-brand-primary normal-case tracking-normal font-semibold"
      />
    </label>
  );
}
