import type { FormEvent } from 'react';
import { ItineraryDay, ItineraryActivity } from '../types';
import { formatDateToDisplay } from '../utils/date';

interface NewEntryFormProps {
  variant: 'sidebar' | 'modal';
  itinerary: ItineraryDay[];
  daySelectionType: 'existing' | 'calendar';
  setDaySelectionType: (type: 'existing' | 'calendar') => void;
  newDayId: string;
  setNewDayId: (id: string) => void;
  newDayDate: string;
  setNewDayDate: (date: string) => void;
  newTime: string;
  setNewTime: (time: string) => void;
  newType: ItineraryActivity['type'];
  setNewType: (type: ItineraryActivity['type']) => void;
  newTitle: string;
  setNewTitle: (title: string) => void;
  newDesc: string;
  setNewDesc: (desc: string) => void;
  newLocation: string;
  setNewLocation: (location: string) => void;
  onSubmit: (e: FormEvent) => void;
  onCancel?: () => void;
}

const ACTIVITY_TYPE_OPTIONS: { value: ItineraryActivity['type']; label: string }[] = [
  { value: 'Relaxation', label: 'Relajación' },
  { value: 'Dining', label: 'Gastronomía' },
  { value: 'Sightseeing', label: 'Turismo' },
  { value: 'Adventure', label: 'Aventura' },
  { value: 'Accommodation', label: 'Alojamiento' },
  { value: 'Transportation', label: 'Traslado' },
];

/**
 * Add-activity form. Rendered twice in ItineraryView (compact sidebar card +
 * full modal), sharing the same state and submit handler in the parent.
 * Extracted as-is per variant — markup/classNames/copy for each variant are
 * unchanged from the pre-decomposition monolith, per PR3 scope (SDD Phase 0).
 */
export default function NewEntryForm({
  variant,
  itinerary,
  daySelectionType,
  setDaySelectionType,
  newDayId,
  setNewDayId,
  newDayDate,
  setNewDayDate,
  newTime,
  setNewTime,
  newType,
  setNewType,
  newTitle,
  setNewTitle,
  newDesc,
  setNewDesc,
  newLocation,
  setNewLocation,
  onSubmit,
  onCancel,
}: NewEntryFormProps) {
  if (variant === 'sidebar') {
    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-[8px] font-black text-brand-outline uppercase tracking-widest mb-1.5">Día de la Actividad</label>
          <div className="flex gap-2 mb-2">
            {daySelectionType === 'existing' ? (
              <md-filled-button type="button" style={{ flex: 1 }} onClick={() => setDaySelectionType('existing')}>
                Día Existente
              </md-filled-button>
            ) : (
              <md-outlined-button type="button" style={{ flex: 1 }} onClick={() => setDaySelectionType('existing')}>
                Día Existente
              </md-outlined-button>
            )}
            {daySelectionType === 'calendar' ? (
              <md-filled-button type="button" style={{ flex: 1 }} onClick={() => setDaySelectionType('calendar')}>
                Seleccionar Día
              </md-filled-button>
            ) : (
              <md-outlined-button type="button" style={{ flex: 1 }} onClick={() => setDaySelectionType('calendar')}>
                Seleccionar Día
              </md-outlined-button>
            )}
          </div>

          {daySelectionType === 'existing' ? (
            <md-outlined-select
              value={newDayId}
              onChange={(e) => setNewDayId(e.currentTarget.value)}
              style={{ width: '100%', minWidth: 0 }}
            >
              {itinerary.map(day => (
                <md-select-option key={day.id} value={day.id} selected={day.id === newDayId}><div slot="headline">{`Día ${day.dayNumber} - ${formatDateToDisplay(day.date)}`}</div></md-select-option>
              ))}
            </md-outlined-select>
          ) : (
            <input
              type="date"
              value={newDayDate}
              onChange={(e) => setNewDayDate(e.target.value)}
              className="w-full bg-white border border-brand-primary/10 rounded-none py-2 px-2.5 text-xs focus:outline-none focus:border-brand-primary/30 transition-all font-sans"
              required={daySelectionType === 'calendar'}
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <md-outlined-text-field
            label="Hora"
            placeholder="ej. 11:00 AM"
            value={newTime}
            onInput={(e) => setNewTime(e.currentTarget.value)}
            required
          />
          <md-outlined-select label="Tipo" value={newType} onChange={(e) => setNewType(e.currentTarget.value as ItineraryActivity['type'])} style={{ width: '100%', minWidth: 0 }}>
            {ACTIVITY_TYPE_OPTIONS.map(option => (
              <md-select-option key={option.value} value={option.value} selected={option.value === newType}><div slot="headline">{option.label}</div></md-select-option>
            ))}
          </md-outlined-select>
        </div>

        <md-outlined-text-field
          label="Título de la Actividad"
          placeholder="ej. Visita guiada"
          value={newTitle}
          onInput={(e) => setNewTitle(e.currentTarget.value)}
          required
          style={{ width: '100%' }}
        />

        <md-outlined-text-field
          label="Ubicación"
          placeholder="ej. Centro histórico"
          value={newLocation}
          onInput={(e) => setNewLocation(e.currentTarget.value)}
          style={{ width: '100%' }}
        />

        <md-filled-button type="submit" style={{ width: '100%' }}>
          Guardar Entrada
        </md-filled-button>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-[9px] font-black text-brand-outline uppercase tracking-widest mb-1.5">Día de la Actividad</label>
        <div className="flex gap-2 mb-3">
          {daySelectionType === 'existing' ? (
            <md-filled-button type="button" style={{ flex: 1 }} onClick={() => setDaySelectionType('existing')}>
              Día Existente
            </md-filled-button>
          ) : (
            <md-outlined-button type="button" style={{ flex: 1 }} onClick={() => setDaySelectionType('existing')}>
              Día Existente
            </md-outlined-button>
          )}
          {daySelectionType === 'calendar' ? (
            <md-filled-button type="button" style={{ flex: 1 }} onClick={() => setDaySelectionType('calendar')}>
              Seleccionar Día
            </md-filled-button>
          ) : (
            <md-outlined-button type="button" style={{ flex: 1 }} onClick={() => setDaySelectionType('calendar')}>
              Seleccionar Día
            </md-outlined-button>
          )}
        </div>

        {daySelectionType === 'existing' ? (
          <md-outlined-select
            value={newDayId}
            onChange={(e) => setNewDayId(e.currentTarget.value)}
            style={{ width: '100%', minWidth: 0 }}
          >
            {itinerary.map(day => (
              <md-select-option key={day.id} value={day.id} selected={day.id === newDayId}><div slot="headline">{`Día ${day.dayNumber} - ${formatDateToDisplay(day.date)}`}</div></md-select-option>
            ))}
          </md-outlined-select>
        ) : (
          <div>
            <input
              type="date"
              value={newDayDate}
              onChange={(e) => setNewDayDate(e.target.value)}
              className="w-full bg-white border border-brand-primary/10 rounded-none py-2.5 px-3 text-xs focus:outline-none focus:border-brand-primary/30 transition-all font-sans"
              required={daySelectionType === 'calendar'}
            />
            <p className="text-[9px] text-brand-outline font-semibold mt-1">
              Si eliges un día que no está en el itinerario, se creará uno nuevo automáticamente.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <md-outlined-text-field
          label="Hora"
          placeholder="ej. 11:00 AM"
          value={newTime}
          onInput={(e) => setNewTime(e.currentTarget.value)}
          required
        />
        <md-outlined-select label="Tipo" value={newType} onChange={(e) => setNewType(e.currentTarget.value as ItineraryActivity['type'])} style={{ width: '100%', minWidth: 0 }}>
          {ACTIVITY_TYPE_OPTIONS.map(option => (
            <md-select-option key={option.value} value={option.value} selected={option.value === newType}><div slot="headline">{option.label}</div></md-select-option>
          ))}
        </md-outlined-select>
      </div>

      <md-outlined-text-field
        label="Título de la Actividad"
        placeholder="ej. Visita guiada"
        value={newTitle}
        onInput={(e) => setNewTitle(e.currentTarget.value)}
        required
        style={{ width: '100%' }}
      />

      <md-outlined-text-field
        label="Descripción"
        type="textarea"
        rows={3}
        placeholder="Detalles sobre reservas, requisitos de equipo..."
        value={newDesc}
        onInput={(e) => setNewDesc(e.currentTarget.value)}
        style={{ width: '100%' }}
      />

      <md-outlined-text-field
        label="Ubicación"
        placeholder="ej. Centro histórico"
        value={newLocation}
        onInput={(e) => setNewLocation(e.currentTarget.value)}
        style={{ width: '100%' }}
      />

      <div className="pt-4 border-t border-brand-primary/10 flex gap-3">
        <md-outlined-button type="button" onClick={onCancel} style={{ flex: 1 }}>
          Cancelar
        </md-outlined-button>
        <md-filled-button type="submit" style={{ flex: 1 }}>
          Guardar Entrada
        </md-filled-button>
      </div>
    </form>
  );
}
