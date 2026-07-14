import React, { useState } from 'react';
import {
  Share,
  Plus,
  ChevronRight,
  CheckCircle2,
  Bookmark,
  Bed,
  Star,
  TrendingDown,
  CalendarDays,
} from 'lucide-react';
import { ActiveTab, ItineraryDay, ItineraryActivity } from '../types';
import { formatDateToDisplay, getDayOfWeekInSpanish } from '../utils/date';
import { useTripStore } from '../store/tripStore';
import ActivityCard from './ActivityCard';
import NewEntryForm from './NewEntryForm';
import { DEFAULT_PARTICIPANTS } from './FriendChips';

interface ItineraryViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  showNewEntryModal: boolean;
  setShowNewEntryModal: (show: boolean) => void;
}

export default function ItineraryView({
  setActiveTab,
  showNewEntryModal,
  setShowNewEntryModal,
}: ItineraryViewProps) {
  const itinerary = useTripStore(state => state.itinerary);
  const addActivity = useTripStore(state => state.addActivity);
  const deleteActivity = useTripStore(state => state.deleteActivity);
  const addDay = useTripStore(state => state.addDay);
  const updateActivityPeople = useTripStore(state => state.updateActivityPeople);

  const [showShareToast, setShowShareToast] = useState(false);

  // Which activity's participants popover is currently open (null = none)
  const [openPeoplePickerId, setOpenPeoplePickerId] = useState<string | null>(null);

  // New activity form states
  const [newDayId, setNewDayId] = useState('day-1');
  const [daySelectionType, setDaySelectionType] = useState<'existing' | 'calendar'>('existing');
  const [newDayDate, setNewDayDate] = useState('2026-08-14');
  const [newTime, setNewTime] = useState('11:00 AM');
  const [newType, setNewType] = useState<'Relaxation' | 'Dining' | 'Sightseeing' | 'Adventure' | 'Accommodation'>('Relaxation');
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
    const currentPeople = activity.people && activity.people.length > 0 ? activity.people : DEFAULT_PARTICIPANTS;
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
      people: DEFAULT_PARTICIPANTS
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
          location: 'Islandia',
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
        <div className="fixed bottom-20 right-6 bg-brand-primary text-white px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-brand-secondary" />
          <span className="font-semibold text-xs uppercase tracking-wider">¡Enlace del itinerario copiado al portapapeles!</span>
        </div>
      )}

      {/* Main Left Column (Itinerary days & events) */}
      <div className="flex-1 space-y-8">
                {/* Breadcrumbs & Header */}
        <div className="border-b border-brand-primary/10 pb-6">
          <nav className="flex items-center gap-1.5 text-[9px] font-black text-brand-on-surface-variant/80 mb-3 uppercase tracking-[0.2em]">
            <span>Islandia</span>
            <ChevronRight className="w-3 h-3 text-brand-outline" />
            <span>Península del Sur</span>
            <ChevronRight className="w-3 h-3 text-brand-outline" />
            <span className="text-brand-primary font-bold">Grindavík</span>
          </nav>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-black italic text-brand-primary tracking-tight">
                Tu Viaje Comienza
              </h1>
              <p className="text-xs md:text-sm text-brand-on-surface-variant/90 leading-relaxed font-sans max-w-2xl mt-2">
                Una exploración curada a través del corazón volcánico de la Península del Sur. La relajación se encuentra con la geología escarpada.
              </p>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={handleShare}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-none border border-brand-primary/20 text-brand-primary font-bold text-[10px] uppercase tracking-widest hover:bg-brand-primary/5 transition-all active:scale-95 cursor-pointer"
                id="itinerary-share-btn"
              >
                <Share className="w-3.5 h-3.5" />
                <span>Compartir</span>
              </button>
              <button
                onClick={() => setShowNewEntryModal(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-none bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-[10px] uppercase tracking-widest shadow-none transition-all active:scale-95 cursor-pointer"
                id="itinerary-new-entry-btn"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva Entrada</span>
              </button>
            </div>
          </div>
        </div>

        {/* Itinerary Timeline */}
        <div className="space-y-12">
          {itinerary.map((day) => (
            <section key={day.id} id={`itinerary-${day.id}`}>

              {/* Day Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-none bg-brand-primary flex flex-col items-center justify-center text-white border border-brand-primary/10 shadow-none shrink-0">
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
                  <div className="p-6 bg-brand-surface-low border border-brand-primary/15 rounded-none text-center italic text-xs text-brand-outline font-medium">
                    No hay actividades programadas. ¡Haz clic en "Nueva Entrada" para añadir una!
                  </div>
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
        <div className="bg-white p-6 rounded-none shadow-none border border-brand-primary/10 space-y-4">
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
        </div>

        {/* Accommodation Sync Card */}
        <div className="bg-white rounded-none border border-brand-primary/10 overflow-hidden shadow-none">
          <div className="h-32 overflow-hidden relative">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbMnz_GWC2KnnlhGFWLNaFIw8MTtLMBeRX6N9I7wE52LhwiCzBLHVK3Rfqw5G3M7vY05GOIRyE6c400_Qbz1xfvVP9k9KHXpGmP4vPuQvOt7JY6YuGAlC5vsJpj4Uhen_phIeQnlSE9Y7UBVmsPtIUsGdQXxE-80ul8qKHh8ytltJRZn_-CoUo6QnOOxlSiPAoPej-KVL-PM-DPtVJQS0JDRLXRmFym4QAy8Zr0ikwjXs1midbBvxO8EXdhQlrOR7GIlWjcPQwy3rl"
              alt="The Retreat Suite"
            />
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 bg-brand-primary text-white text-[8px] font-black rounded-none uppercase tracking-widest flex items-center gap-1 shadow-none">
                <Bookmark className="w-3.5 h-3.5 fill-current" />
                <span>Sincronizado de Email</span>
              </span>
            </div>
          </div>

          <div className="p-5">
            <h3 className="font-serif font-black italic text-brand-primary text-base">
              The Retreat en Blue Lagoon
            </h3>

            <div className="flex items-center gap-4 text-brand-outline font-black text-[10px] uppercase tracking-wider mt-2 mb-4">
              <span className="flex items-center gap-1">
                <Bed className="w-4 h-4 text-brand-primary" />
                <span>3 Noches</span>
              </span>
              <span className="flex items-center gap-0.5">
                <Star className="w-4 h-4 fill-brand-sunset text-brand-sunset" />
                <span className="text-brand-primary">5.0</span>
              </span>
            </div>

            <div className="flex gap-2">
              <div
                className="w-16 h-16 rounded-none bg-cover bg-center border border-brand-primary/10 shadow-none shrink-0"
                style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBjtM-E91N7RHjJFt39abAwIGn9hrYoCG_-9NJsBqdHvppVoNzwty-0xF2NoD4ydzP3uBKMZ80DyUA_u8lFA41wbjqC2Wxgtru3eVBz2kQ3yMQ3cV6c-6wcEcUn-iSDzshP2fQnHIGpV4F6sHE_SbZq6xwxFKDTP-gbOlJfyILC3bymFvzisN-ph2a8J831sMHYAfuMkOYbWTizK1JnzLBK1C6B9wiLaMSU-HNvqHTPsKqiAZ4zPfNXQ85HwksTRR6KvD8GGYsmAHF6')` }}
              />
              <div className="flex-1">
                <p className="text-brand-on-surface-variant/95 text-xs italic leading-relaxed font-sans">
                  "La estancia más transformadora que he tenido. No te pierdas el ritual de la laguna privada."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Day 2 Stats Outlook */}
        <div className="bg-brand-background border border-brand-primary/10 p-5 rounded-none shadow-none">
          <h4 className="text-brand-primary font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-brand-primary/75" />
            <span>Perspectiva del Día 2</span>
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-none border border-brand-primary/10 shadow-none">
              <p className="text-brand-outline text-[8px] uppercase font-black tracking-widest">Tiempo de Viaje</p>
              <p className="text-lg font-serif font-black italic text-brand-primary mt-1">1h 45m</p>
            </div>
            <div className="bg-white p-4 rounded-none border border-brand-primary/10 shadow-none">
              <p className="text-brand-outline text-[8px] uppercase font-black tracking-widest">Distancia Total</p>
              <p className="text-lg font-serif font-black italic text-brand-primary mt-1">82 km</p>
            </div>
          </div>
          <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest mt-4 flex items-center gap-1.5 leading-none">
            <TrendingDown className="w-4 h-4" />
            <span>Día de baja actividad • Enfoque en el paisaje</span>
          </p>
        </div>

        {/* Map Inset */}
        <div className="rounded-none overflow-hidden h-44 border border-brand-primary/10 relative shadow-none group">
          <div
            className="absolute inset-0 bg-cover bg-center group-hover:scale-[1.02] transition-transform duration-700 cursor-pointer"
            style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuD_SmYPAS1eFaIi90HFQFD4cLKjHAlRdONw-Q3L5STRuPqPUEzXe043rpUx9LD4h8flOSFZB8lXiOvdgDdW-tixCtZY3x7GmA2WnKZMfnOCrUFINUwf4BrncvfnF6ErjFxFUycSMt_xt_t-AngZO4AwsfLesxQ3dh64EeQD_-s0SV4VjXCacbmC7t8uzYawR2R3AdMdTtySwauWgXoL3PJ-dY13wjj87tXWIy28h-0UDHjDoXvJODudrCEq4o55boK6hI6wsftH-5Eq')` }}
            onClick={() => setActiveTab('map')}
          />
          <div className="absolute bottom-3 left-3 bg-white border border-brand-primary/15 px-3 py-1.5 rounded-none flex items-center gap-1.5 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Ruta en Vivo</span>
          </div>
        </div>

      </div>

      {/* New Entry Modal */}
      {showNewEntryModal && (
        <div className="fixed inset-0 bg-brand-primary/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-none p-6 max-w-lg w-full shadow-none border border-brand-primary/10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-brand-primary/10">
              <h3 className="font-serif font-black italic text-xl text-brand-primary">Añadir Entrada al Itinerario</h3>
              <button
                onClick={() => setShowNewEntryModal(false)}
                className="text-brand-outline hover:text-brand-primary w-8 h-8 rounded-none hover:bg-brand-primary/5 transition-all text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
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
          </div>
        </div>
      )}

    </div>
  );
}
