import { type CSSProperties } from 'react';
import { Users } from 'lucide-react';
import { ItineraryDay, ItineraryActivity } from '../types';
import { useTripParticipants } from '../store/participants';

interface FriendChipsProps {
  day: ItineraryDay;
  activity: ItineraryActivity;
  isPickerOpen: boolean;
  onTogglePicker: () => void;
  onClosePicker: () => void;
  onTogglePerson: (day: ItineraryDay, activity: ItineraryActivity, name: string) => void;
}

/**
 * Friend avatar chips for an itinerary activity, plus the accessible
 * multi-select popover used to add/remove participants. Extracted as-is from
 * ItineraryView (PR2's `window.prompt()` replacement) — behavior and markup
 * unchanged, per PR3 scope (SDD Phase 0).
 */
export default function FriendChips({
  day,
  activity,
  isPickerOpen,
  onTogglePicker,
  onClosePicker,
  onTogglePerson,
}: FriendChipsProps) {
  const tripParticipants = useTripParticipants();
  const currentPeople = activity.people && activity.people.length > 0 ? activity.people : tripParticipants;

  return (
    <div className="mt-4 pt-3 border-t border-brand-primary/5 flex flex-col gap-1.5 relative">
      <span className="text-[9px] font-black uppercase tracking-wider text-brand-outline flex items-center gap-1">
        <Users className="w-3 h-3 text-brand-primary/50" />
        <span>Amigos en este recorrido:</span>
      </span>
      <div className="flex flex-wrap items-center gap-1">
        {currentPeople.map((personName) => (
          <div
            key={personName}
            className="flex items-center gap-1 px-1.5 py-0.5 bg-brand-background border border-brand-primary/5 text-[9px] font-bold text-brand-primary"
            title={personName}
          >
            <span>{personName}</span>
          </div>
        ))}

        {/* Accessible multi-select trigger to add/remove participants */}
        <md-outlined-button
          type="button"
          onClick={onTogglePicker}
          aria-haspopup="true"
          aria-expanded={isPickerOpen}
          aria-controls={`people-picker-${activity.id}`}
        >
          + / - Integrantes
        </md-outlined-button>
      </div>

      {isPickerOpen && (
        <md-elevated-card
          style={{ display: 'grid' } as CSSProperties}
          id={`people-picker-${activity.id}`}
          role="group"
          aria-label={`Elegir integrantes de ${activity.title}`}
          className="absolute z-20 top-full left-0 mt-1 w-56 p-2 grid-cols-1 gap-1"
        >
          {tripParticipants.map((participantName) => {
            const isChecked = currentPeople.includes(participantName);
            return (
              <label
                key={participantName}
                className="flex items-center gap-2 px-1.5 py-1 hover:bg-brand-primary/5 cursor-pointer text-[10px] font-semibold text-brand-primary"
              >
                <md-checkbox
                  checked={isChecked}
                  onChange={() => onTogglePerson(day, activity, participantName)}
                />
                <span>{participantName}</span>
              </label>
            );
          })}
          <md-text-button type="button" onClick={onClosePicker}>
            Cerrar
          </md-text-button>
        </md-elevated-card>
      )}
    </div>
  );
}
