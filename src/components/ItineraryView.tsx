import React, { useState } from 'react';
import {
  Share,
  Plus,
  ChevronRight,
  CheckCircle2,
  CalendarDays,
} from 'lucide-react';
import { ActiveTab, ItineraryDay, ItineraryActivity } from '../types';
import { formatDateToDisplay, getDayOfWeekInSpanish } from '../utils/date';
import { useTripStore } from '../store/tripStore';
import ActivityCard from './ActivityCard';
import NewEntryForm from './NewEntryForm';
import { useTripParticipants } from '../store/participants';
import { useCurrentTrip } from '../store/currentTripContext';

interface ItineraryViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  showNewEntryModal: boolean;
  setShowNewEntryModal: (show: boolean) => void;
}

export default function ItineraryView({
  showNewEntryModal,
  setShowNewEntryModal,
}: ItineraryViewProps) {
  const itinerary = useTripStore(state => state.itinerary);
  const addActivity = useTripStore(state => state.addActivity);
  const deleteActivity = useTripStore(state => state.deleteActivity);
  const addDay = useTripStore(state => state.addDay);
  const updateActivityPeople = useTripStore(state => state.updateActivityPeople);
  const defaultParticipants = useTripParticipants();
  const currentTrip = useCurrentTrip();

  const [showShareToast, setShowShareToast] = useState(false);

  // Which activity's participants popover is currently open (null = none)
  const [openPeoplePickerId, setOpenPeoplePickerId] = useState<string | null>(null);

  // New activity form states
  const [newDayId, setNewDayId] = useState('day-1');
  const [daySelectionType, setDaySelectionType] = useState<'existing' | 'calendar'>('existing');
  const [newDayDate, setNewDayDate] = useState('2026-08-14');
  const [newTime, setNewTime] = useState('11:00 AM');
  const [newType, setNewType] = useState<ItineraryActivity['type']>('Relaxation');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  const handleDeleteActivity = (dayId: string, actId: string) => {
    deleteActivity(dayId, actId);
  };

  const handleToggleActivityPerson = (day: ItineraryDay, activity: ItineraryActivity, name: string) => {
    const currentPeople = activity.people && activity.people.length > 0 ? activity.people : defaultParticipants;
    const updatedPeople = currentPeople.includes(name)
      ? currentPeople.filter(p => p !== name)
      : [...currentPeople, name];
    updateActivityPeople(day.id, activity.id, updatedPeople);
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newActivity: ItineraryActivity = {
      id: `act-${Date.now()}`,
      time: newTime,
      type: newType,
      title: newTitle,
      description: newDesc,
      location: newLocation,
      people: defaultParticipants,
    };

    if (daySelectionType === 'calendar') {
      const existingDay = itinerary.find(day => day.date === newDayDate);
      if (existingDay) {
        addActivity(existingDay.id, newActivity);
      } else {
        const newDay: ItineraryDay = {
          id: `day-${Date.now()}`,
          dayNumber: 0, // repository re-indexes all days after inserting
          date: newDayDate,
          dayOfWeek: getDayOfWeekInSpanish(newDayDate),
          title: `Exploración (${formatDateToDisplay(newDayDate)})`,
          location: newLocation.trim() || 'Sin ubicación',
          activities: [newActivity]
        };
        addDay(newDay);
      }
    } else {
      addActivity(newDayId, newActivity);
    }

    // Reset Form
    setNewTitle('');
    setNewDesc('');
    setNewLocation('');
    setShowNewEntryModal(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">

      {/* Share Notification Toast */}
      {showShareToast && (
        <md-elevated-card
          style={
            {
              display: 'flex',
              '--md-elevated-card-container-color': 'var(--md-sys-color-primary)',
              color: 'var(--md-sys-color-on-primary)',
            } as React.CSSProperties
          }
          className="fixed bottom-20 right-6 px-5 py-3 z-50 items-center gap-2 animate-bounce"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-semibold text-xs uppercase tracking-wider">¡Enlace del itinerario copiado al portapapeles!</span>
        </md-elevated-card>
      )}

      {/* Main Left Column (Itinerary days & events) */}
      <div className="flex-1 space-y-8">
                {/* Breadcrumbs & Header */}
        <div className="border-b border-brand-primary/10 pb-6">
          <nav className="flex items-center gap-1.5 text-[9px] font-black text-brand-on-surface-variant/80 mb-3 uppercase tracking-[0.2em]">
            <span>{currentTrip?.name ?? 'Tu viaje'}</span>
            {itinerary[0]?.location && (
              <>
                <ChevronRight className="w-3 h-3 text-brand-outline" />
                <span className="text-brand-primary font-bold">{itinerary[0].location}</span>
              </>
            )}
          </nav>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-black italic text-brand-primary tracking-tight">
                Itinerario de {currentTrip?.name ?? 'tu viaje'}
              </h1>
              <p className="text-xs md:text-sm text-brand-on-surface-variant/90 leading-relaxed font-sans max-w-2xl mt-2">
                Organizá días, actividades y participantes en un único lugar compartido.
              </p>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <md-outlined-button
                onClick={handleShare}
                id="itinerary-share-btn"
                style={{ flexGrow: 1, flexShrink: 0, flexBasis: 'auto', minWidth: '13ch' } as React.CSSProperties}
              >
                <Share slot="icon" className="w-3.5 h-3.5" />
                Compartir
              </md-outlined-button>
              <md-filled-button
                onClick={() => setShowNewEntryModal(true)}
                id="itinerary-new-entry-btn"
                style={{ flexGrow: 1, flexShrink: 0, flexBasis: 'auto', minWidth: '16ch' } as React.CSSProperties}
              >
                <Plus slot="icon" className="w-3.5 h-3.5" />
                Nueva Entrada
              </md-filled-button>
            </div>
          </div>
        </div>

        {/* Itinerary Timeline */}
        <div className="space-y-12">
          {itinerary.map((day) => (
            <section key={day.id} id={`itinerary-${day.id}`}>

              {/* Day Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-none bg-brand-primary flex flex-col items-center justify-center text-brand-on-primary border border-brand-primary/10 shadow-none shrink-0">
                  <span className="text-[8px] uppercase font-black tracking-widest text-brand-primary-fixed-dim/95 leading-none mb-0.5">
                    {formatDateToDisplay(day.date).split(' ')[1] || 'Ago'}
                  </span>
                  <span className="text-xl font-serif font-black italic leading-none">
                    {formatDateToDisplay(day.date).split(' ')[0] || '12'}
                  </span>
                </div>
                <div>
                  <h2 className="font-serif text-lg md:text-xl font-black italic text-brand-primary">
                    Día {day.dayNumber} - {formatDateToDisplay(day.date)}: {day.title}
                  </h2>
                  <p className="text-[10px] font-black uppercase tracking-wider text-brand-on-surface-variant/70 mt-0.5">
                    {day.dayOfWeek} • {day.location}
                  </p>
                </div>
              </div>

              {/* Day Activities List */}
              <div className="space-y-6 relative border-l border-brand-primary/10 ml-7 pl-6 md:pl-10">
                {day.activities.length === 0 ? (
                  <md-outlined-card style={{ display: 'block' }} className="p-6 text-center italic text-xs text-brand-outline font-medium">
                    No hay actividades programadas. ¡Haz clic en "Nueva Entrada" para añadir una!
                  </md-outlined-card>
                ) : (
                  day.activities.map((activity) => (
                    <ActivityCard
                      key={activity.id}
                      day={day}
                      activity={activity}
                      onDelete={handleDeleteActivity}
                      isPickerOpen={openPeoplePickerId === activity.id}
                      onTogglePicker={() => setOpenPeoplePickerId(prev => (prev === activity.id ? null : activity.id))}
                      onClosePicker={() => setOpenPeoplePickerId(null)}
                      onTogglePerson={handleToggleActivityPerson}
                    />
                  ))
                )}
              </div>
            </section>
          ))}
        </div>

      </div>

      {/* Right Column (Sidebar widgets) */}
      <div className="w-full lg:w-80 shrink-0 space-y-6">

        {/* Nueva Entrada Sidebar Card */}
        <md-elevated-card style={{ display: 'block' } as React.CSSProperties} className="p-6 space-y-4">
          <div>
            <h3 className="font-serif font-black italic text-lg text-brand-primary flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-brand-sunset" />
              <span>Nueva Entrada</span>
            </h3>
            <p className="text-[10px] text-brand-outline font-bold uppercase tracking-widest mt-1">
              Agregar actividad directamente
            </p>
          </div>

          <NewEntryForm
            variant="sidebar"
            itinerary={itinerary}
            daySelectionType={daySelectionType}
            setDaySelectionType={setDaySelectionType}
            newDayId={newDayId}
            setNewDayId={setNewDayId}
            newDayDate={newDayDate}
            setNewDayDate={setNewDayDate}
            newTime={newTime}
            setNewTime={setNewTime}
            newType={newType}
            setNewType={setNewType}
            newTitle={newTitle}
            setNewTitle={setNewTitle}
            newDesc={newDesc}
            setNewDesc={setNewDesc}
            newLocation={newLocation}
            setNewLocation={setNewLocation}
            onSubmit={handleAddActivity}
          />
        </md-elevated-card>

      </div>

      {/* New Entry Modal */}
      {showNewEntryModal && (
        <div className="fixed inset-0 bg-brand-primary/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <md-elevated-card
            style={{ display: 'block' } as React.CSSProperties}
            className="p-6 max-w-lg w-full animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-brand-primary/10">
              <h3 className="font-serif font-black italic text-xl text-brand-primary">Añadir Entrada al Itinerario</h3>
              <md-icon-button onClick={() => setShowNewEntryModal(false)} aria-label="Cerrar">
                <md-icon>close</md-icon>
              </md-icon-button>
            </div>

            <NewEntryForm
              variant="modal"
              itinerary={itinerary}
              daySelectionType={daySelectionType}
              setDaySelectionType={setDaySelectionType}
              newDayId={newDayId}
              setNewDayId={setNewDayId}
              newDayDate={newDayDate}
              setNewDayDate={setNewDayDate}
              newTime={newTime}
              setNewTime={setNewTime}
              newType={newType}
              setNewType={setNewType}
              newTitle={newTitle}
              setNewTitle={setNewTitle}
              newDesc={newDesc}
              setNewDesc={setNewDesc}
              newLocation={newLocation}
              setNewLocation={setNewLocation}
              onSubmit={handleAddActivity}
              onCancel={() => setShowNewEntryModal(false)}
            />
          </md-elevated-card>
        </div>
      )}

    </div>
  );
}
