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
            <button
              type="button"
              onClick={() => setDaySelectionType('existing')}
              className={`flex-1 py-1 text-[8px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
                daySelectionType === 'existing'
                  ? 'bg-brand-primary text-white border-brand-primary'
                  : 'bg-white text-brand-primary border-brand-primary/10 hover:bg-brand-primary/5'
              }`}
            >
              Día Existente
            </button>
            <button
              type="button"
              onClick={() => setDaySelectionType('calendar')}
              className={`flex-1 py-1 text-[8px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
                daySelectionType === 'calendar'
                  ? 'bg-brand-primary text-white border-brand-primary'
                  : 'bg-white text-brand-primary border-brand-primary/10 hover:bg-brand-primary/5'
              }`}
            >
              Seleccionar Día
            </button>
          </div>

          {daySelectionType === 'existing' ? (
            <select
              value={newDayId}
              onChange={(e) => setNewDayId(e.target.value)}
              className="w-full bg-white border border-brand-primary/10 rounded-none py-2 px-2.5 text-xs focus:outline-none focus:border-brand-primary/30 transition-all font-sans"
            >
              {itinerary.map(day => (
                <option key={day.id} value={day.id}>Día {day.dayNumber} - {formatDateToDisplay(day.date)}</option>
              ))}
            </select>
          ) : (
            <div>
              <input
                type="date"
                value={newDayDate}
                onChange={(e) => setNewDayDate(e.target.value)}
                className="w-full bg-white border border-brand-primary/10 rounded-none py-2 px-2.5 text-xs focus:outline-none focus:border-brand-primary/30 transition-all font-sans"
                required={daySelectionType === 'calendar'}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[8px] font-black text-brand-outline uppercase tracking-widest mb-1">Hora</label>
            <input
              type="text"
              placeholder="ej. 11:00 AM"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full bg-white border border-brand-primary/10 rounded-none py-2 px-2.5 text-xs focus:outline-none focus:border-brand-primary/30 transition-all font-sans"
              required
            />
          </div>
          <div>
            <label className="block text-[8px] font-black text-brand-outline uppercase tracking-widest mb-1">Tipo</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as ItineraryActivity['type'])}
              className="w-full bg-white border border-brand-primary/10 rounded-none py-2 px-2.5 text-xs focus:outline-none focus:border-brand-primary/30 transition-all font-sans"
            >
              <option value="Relaxation">Relajación</option>
              <option value="Dining">Gastronomía</option>
              <option value="Sightseeing">Turismo</option>
              <option value="Adventure">Aventura</option>
              <option value="Accommodation">Alojamiento</option>
              <option value="Transportation">Traslado</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[8px] font-black text-brand-outline uppercase tracking-widest mb-1">Título de la Actividad</label>
          <input
            type="text"
            placeholder="ej. Caminata por la cascada"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full bg-white border border-brand-primary/10 rounded-none py-2 px-2.5 text-xs focus:outline-none focus:border-brand-primary/30 transition-all font-sans"
            required
          />
        </div>

        <div>
          <label className="block text-[8px] font-black text-brand-outline uppercase tracking-widest mb-1">Ubicación</label>
          <input
            type="text"
            placeholder="ej. Área de Geysir"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            className="w-full bg-white border border-brand-primary/10 rounded-none py-2 px-2.5 text-xs focus:outline-none focus:border-brand-primary/30 transition-all font-sans"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-none font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer active:scale-95"
        >
          Guardar Entrada
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-[9px] font-black text-brand-outline uppercase tracking-widest mb-1.5">Día de la Actividad</label>
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => setDaySelectionType('existing')}
            className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
              daySelectionType === 'existing'
                ? 'bg-brand-primary text-white border-brand-primary'
                : 'bg-white text-brand-primary border-brand-primary/10 hover:bg-brand-primary/5'
            }`}
          >
            Día Existente
          </button>
          <button
            type="button"
            onClick={() => setDaySelectionType('calendar')}
            className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
              daySelectionType === 'calendar'
                ? 'bg-brand-primary text-white border-brand-primary'
                : 'bg-white text-brand-primary border-brand-primary/10 hover:bg-brand-primary/5'
            }`}
          >
            Seleccionar Día
          </button>
        </div>

        {daySelectionType === 'existing' ? (
          <select
            value={newDayId}
            onChange={(e) => setNewDayId(e.target.value)}
            className="w-full bg-white border border-brand-primary/10 rounded-none py-2.5 px-3 text-xs focus:outline-none focus:border-brand-primary/30 transition-all font-sans"
          >
            {itinerary.map(day => (
              <option key={day.id} value={day.id}>Día {day.dayNumber} - {formatDateToDisplay(day.date)}</option>
            ))}
          </select>
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
        <div>
          <label className="block text-[9px] font-black text-brand-outline uppercase tracking-widest mb-1.5">Hora</label>
          <input
            type="text"
            placeholder="ej. 11:00 AM"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="w-full bg-white border border-brand-primary/10 rounded-none py-2.5 px-3 text-xs focus:outline-none focus:border-brand-primary/30 transition-all font-sans"
            required
          />
        </div>
        <div>
          <label className="block text-[9px] font-black text-brand-outline uppercase tracking-widest mb-1.5">Tipo</label>
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as ItineraryActivity['type'])}
            className="w-full bg-white border border-brand-primary/10 rounded-none py-2.5 px-3 text-xs focus:outline-none focus:border-brand-primary/30 transition-all font-sans"
          >
            <option value="Relaxation">Relajación</option>
            <option value="Dining">Gastronomía</option>
            <option value="Sightseeing">Turismo</option>
            <option value="Adventure">Aventura</option>
            <option value="Accommodation">Alojamiento</option>
            <option value="Transportation">Traslado</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[9px] font-black text-brand-outline uppercase tracking-widest mb-1.5">Título de la Actividad</label>
        <input
          type="text"
          placeholder="ej. Caminata por la cascada Gullfoss"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="w-full bg-white border border-brand-primary/10 rounded-none py-2.5 px-3 text-xs focus:outline-none focus:border-brand-primary/30 transition-all font-sans"
          required
        />
      </div>

      <div>
        <label className="block text-[9px] font-black text-brand-outline uppercase tracking-widest mb-1.5">Descripción</label>
        <textarea
          placeholder="Detalles sobre reservas, requisitos de equipo..."
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          rows={3}
          className="w-full bg-white border border-brand-primary/10 rounded-none py-2.5 px-3 text-xs focus:outline-none focus:border-brand-primary/30 transition-all font-sans"
        />
      </div>

      <div>
        <label className="block text-[9px] font-black text-brand-outline uppercase tracking-widest mb-1.5">Ubicación</label>
        <input
          type="text"
          placeholder="ej. Área de Geysir, Islandia"
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          className="w-full bg-white border border-brand-primary/10 rounded-none py-2.5 px-3 text-xs focus:outline-none focus:border-brand-primary/30 transition-all font-sans"
        />
      </div>

      <div className="pt-4 border-t border-brand-primary/10 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 border border-brand-primary/10 text-brand-primary rounded-none font-bold text-[10px] uppercase tracking-widest hover:bg-brand-primary/5 transition-all cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-none font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer"
        >
          Guardar Entrada
        </button>
      </div>
    </form>
  );
}
