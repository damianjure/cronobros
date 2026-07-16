import { MapPin, Clock, CheckCircle2, Trash2 } from 'lucide-react';
import { ItineraryDay, ItineraryActivity } from '../types';
import FriendChips from './FriendChips';

interface ActivityCardProps {
  day: ItineraryDay;
  activity: ItineraryActivity;
  onDelete: (dayId: string, activityId: string) => void;
  isPickerOpen: boolean;
  onTogglePicker: () => void;
  onClosePicker: () => void;
  onTogglePerson: (day: ItineraryDay, activity: ItineraryActivity, name: string) => void;
}

/**
 * A single activity card in the itinerary timeline. Extracted as-is from
 * ItineraryView — markup and behavior unchanged, per PR3 scope (SDD Phase 0).
 */
export default function ActivityCard({
  day,
  activity,
  onDelete,
  isPickerOpen,
  onTogglePicker,
  onClosePicker,
  onTogglePerson,
}: ActivityCardProps) {
  return (
    <div
      className="relative bg-white border border-brand-primary/10 rounded-none overflow-hidden shadow-none hover:border-brand-primary/30 transition-all duration-300 flex flex-col md:flex-row group"
      id={`activity-card-${activity.id}`}
    >
      {/* Image Thumbnail if exists */}
      {activity.image && (
        <div className="w-full md:w-48 h-44 md:h-auto overflow-hidden relative shrink-0">
          <img
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
            src={activity.image}
            alt={activity.title}
          />
        </div>
      )}

      {/* Content panel */}
      <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2.5">
              <span className={`px-2.5 py-0.5 rounded-none text-[8px] font-black uppercase tracking-widest ${
                activity.type === 'Relaxation'
                  ? 'bg-[#E5EAE4] text-brand-primary'
                  : activity.type === 'Dining'
                  ? 'bg-[#F2EDE4] text-brand-primary'
                  : activity.type === 'Sightseeing'
                  ? 'bg-[#E4ECEB] text-brand-primary'
                  : 'bg-brand-primary text-white'
              }`}>
                {activity.type === 'Relaxation'
                  ? 'Relajación'
                  : activity.type === 'Dining'
                  ? 'Gastronomía'
                  : activity.type === 'Sightseeing'
                  ? 'Turismo'
                  : activity.type === 'Adventure'
                  ? 'Aventura'
                  : activity.type === 'Accommodation'
                  ? 'Alojamiento'
                  : activity.type === 'Transportation'
                  ? 'Traslado'
                  : activity.type}
              </span>

              <span className="flex items-center gap-1 text-brand-primary/70 font-bold text-[10px] uppercase tracking-wider">
                <Clock className="w-3 h-3 text-brand-primary/50" />
                <span>{activity.time}</span>
              </span>
            </div>

            {/* Delete Activity option */}
            <button
              onClick={() => onDelete(day.id, activity.id)}
              className="text-brand-outline hover:text-red-600 p-1 rounded-none hover:bg-brand-primary/5 transition-colors cursor-pointer active:scale-95"
              title="Eliminar Actividad"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <h3 className="font-serif font-black italic text-brand-primary text-base md:text-lg mb-1.5 group-hover:opacity-80 transition-colors leading-snug">
            {activity.title}
          </h3>
          <p className="text-xs text-brand-on-surface-variant/95 leading-relaxed font-sans">
            {activity.description}
          </p>

          <FriendChips
            day={day}
            activity={activity}
            isPickerOpen={isPickerOpen}
            onTogglePicker={onTogglePicker}
            onClosePicker={onClosePicker}
            onTogglePerson={onTogglePerson}
          />
        </div>

        {/* Location and special states */}
        <div className="mt-4 pt-3.5 border-t border-brand-primary/10 flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1 text-brand-primary/60 font-black text-[9px] uppercase tracking-widest">
            <MapPin className="w-3 h-3 shrink-0" />
            <span>{activity.location || 'Área local'}</span>
          </span>

          <div className="flex gap-2">
            {activity.status ? (
              <span className="flex items-center gap-1 text-white font-black text-[8px] uppercase tracking-widest bg-brand-primary px-2.5 py-1 rounded-none">
                <CheckCircle2 className="w-3 h-3 fill-current" />
                <span>
                  {activity.status === 'Smart Imported'
                    ? 'Importado Inteligente'
                    : activity.status}
                </span>
              </span>
            ) : (
              <div className="flex items-center gap-1.5">
                <button className="text-brand-primary font-black text-[9px] uppercase tracking-widest hover:opacity-80 cursor-pointer px-1.5 py-0.5 border border-brand-primary/10 bg-white">
                  Ver Boletos
                </button>
                <button className="text-brand-primary font-black text-[9px] uppercase tracking-widest hover:opacity-80 cursor-pointer px-1.5 py-0.5 border border-brand-primary/10 bg-white">
                  Cómo Llegar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
