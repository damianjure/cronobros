import { useState, type CSSProperties, type FormEvent } from 'react';
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
      <md-elevated-card
        style={{ display: 'block' } as CSSProperties}
        role="dialog"
        aria-modal="true"
        aria-labelledby="critical-events-manager-title"
        className="w-full max-w-3xl max-h-[92vh] overflow-y-auto"
      >
        <header
          className="sticky top-0 z-10 px-5 py-4 flex items-center gap-3"
          style={
            {
              backgroundColor: 'var(--md-sys-color-primary)',
              color: 'var(--md-sys-color-on-primary)',
            } as CSSProperties
          }
        >
          <CalendarClock className="w-5 h-5 text-brand-sunset" />
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">
              Agenda del viaje
            </p>
            <h2 id="critical-events-manager-title" className="font-serif font-black italic text-xl">
              Horarios impostergables
            </h2>
          </div>
          <md-icon-button
            onClick={onClose}
            aria-label="Cerrar gestión de eventos"
            className="ml-auto"
            style={{ '--md-icon-button-icon-color': 'var(--md-sys-color-on-primary)' } as CSSProperties}
          >
            <X className="w-4 h-4" />
          </md-icon-button>
        </header>

        <div className="p-5 space-y-5">
          {!draft && (
            <>
              <md-outlined-button type="button" onClick={() => setDraft(emptyDraft())} style={{ width: '100%' }}>
                <Plus slot="icon" className="w-4 h-4" />
                Nuevo evento crítico
              </md-outlined-button>

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
                      <md-icon-button type="button" onClick={() => editEvent(event)} aria-label={`Editar ${event.title}`} className="ml-auto">
                        <Pencil className="w-4 h-4" />
                      </md-icon-button>
                      <md-icon-button
                        type="button"
                        onClick={() => void onDelete(event.id)}
                        aria-label={`Eliminar ${event.title}`}
                        style={{ '--md-icon-button-icon-color': 'var(--md-sys-color-error)' } as CSSProperties}
                      >
                        <Trash2 className="w-4 h-4" />
                      </md-icon-button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {draft && (
            <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Título" value={draft.title} onChange={title => setDraft({ ...draft, title })} />
              <md-outlined-select
                label="Tipo"
                value={draft.type}
                onChange={event => setDraft({ ...draft, type: event.currentTarget.value as CriticalEvent['type'] })}
                style={{ width: '100%', minWidth: 0 }}
              >
                <md-select-option value="hotel" selected={draft.type === 'hotel'}>
                  <div slot="headline">Alojamiento</div>
                </md-select-option>
                <md-select-option value="flight" selected={draft.type === 'flight'}>
                  <div slot="headline">Vuelo</div>
                </md-select-option>
                <md-select-option value="car" selected={draft.type === 'car'}>
                  <div slot="headline">Vehículo</div>
                </md-select-option>
              </md-outlined-select>
              <Field label="Categoría breve" value={draft.subType} onChange={subType => setDraft({ ...draft, subType })} />
              <Field label="Lugar" value={draft.locationName} onChange={locationName => setDraft({ ...draft, locationName })} />
              <Field label="Fecha" type="date" value={draft.targetDate ?? ''} onChange={targetDate => setDraft({ ...draft, targetDate })} />
              <Field label="Hora límite" type="time" value={draft.targetTimeStr} onChange={targetTimeStr => setDraft({ ...draft, targetTimeStr })} />
              <Field label="Latitud" type="number" step="any" value={draft.latitude} onChange={latitude => setDraft({ ...draft, latitude })} />
              <Field label="Longitud" type="number" step="any" value={draft.longitude} onChange={longitude => setDraft({ ...draft, longitude })} />
              <Field label="Descripción" value={draft.description} onChange={description => setDraft({ ...draft, description })} className="sm:col-span-2" />
              <Field label="Advertencia" value={draft.warningMessage} onChange={warningMessage => setDraft({ ...draft, warningMessage })} className="sm:col-span-2" />

              <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                <md-outlined-button type="button" onClick={() => setDraft(null)}>
                  Cancelar
                </md-outlined-button>
                <md-filled-button type="submit" disabled={isSaving}>
                  {isSaving ? 'Guardando…' : 'Guardar evento'}
                </md-filled-button>
              </div>
            </form>
          )}
        </div>
      </md-elevated-card>
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

// md-outlined-text-field doesn't support type="date"/"time" (listed as
// UnsupportedTextFieldType in @material/web's own types) — those two keep
// the native input so the browser's real date/time picker still works.
function Field({ label, value, onChange, type = 'text', step, className = '' }: FieldProps) {
  if (type === 'date' || type === 'time') {
    return (
      <label className={`space-y-1 text-[10px] font-black uppercase tracking-wider text-brand-outline ${className}`}>
        {label}
        <input
          required
          type={type}
          value={value}
          onChange={event => onChange(event.target.value)}
          className="w-full bg-brand-background border border-brand-primary/15 p-2.5 text-xs text-brand-primary normal-case tracking-normal font-semibold"
        />
      </label>
    );
  }

  return (
    <md-outlined-text-field
      label={label}
      required
      type={type}
      step={step}
      value={value}
      onInput={event => onChange(event.currentTarget.value)}
      className={className}
      style={{ width: '100%' } as CSSProperties}
    />
  );
}
