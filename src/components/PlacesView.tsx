import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Check,
  Trash2,
  Sparkles,
  Bookmark,
  Users
} from 'lucide-react';
import { PendingPlace } from '../types';
import { useTripStore } from '../store/tripStore';
import { useToastStore } from '../store/toastStore';
import { useTripParticipants } from '../store/participants';

export default function PlacesView() {
  const pendingPlaces = useTripStore(state => state.pendingPlaces);
  const itinerary = useTripStore(state => state.itinerary);
  const addPendingPlace = useTripStore(state => state.addPendingPlace);
  const deletePendingPlace = useTripStore(state => state.deletePendingPlace);
  const approvePlace = useTripStore(state => state.approvePlace);
  const showToast = useToastStore(state => state.showToast);
  // PR5: real trip participants instead of the global `friends` fixture.
  const participants = useTripParticipants();

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Relajación' | 'Gastronomía' | 'Turismo' | 'Aventura' | 'Alojamiento'>('Turismo');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [selectedPeople, setSelectedPeople] = useState<string[]>(participants);

  // Day selection per pending card
  const [selectedDays, setSelectedDays] = useState<Record<string, string>>({});

  const handleTogglePerson = (name: string) => {
    if (selectedPeople.includes(name)) {
      setSelectedPeople(prev => prev.filter(p => p !== name));
    } else {
      setSelectedPeople(prev => [...prev, name]);
    }
  };

  const handleAddPendingPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newPlace: PendingPlace = {
      id: `pending-${Date.now()}`,
      title,
      category,
      description: description || 'Sin descripción adicional.',
      location: location.trim() || 'Sin ubicación',
      people: selectedPeople.length > 0 ? selectedPeople : participants,
    };

    addPendingPlace(newPlace);

    // Reset Form
    setTitle('');
    setDescription('');
    setLocation('');
    setSelectedPeople(participants);
  };

  const handleDeletePending = (id: string) => {
    deletePendingPlace(id);
  };

  const handleApprovePlace = (placeId: string, dayId: string, placeTitle: string) => {
    approvePlace(placeId, dayId);
    showToast(`¡"${placeTitle}" ha sido aprobado! Se agregó al itinerario de ese día y como punto interactivo en el mapa.`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form column */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white border border-brand-primary/10 rounded-none p-6 shadow-none">
          <div className="flex items-center gap-2 mb-4 text-brand-primary">
            <Plus className="w-5 h-5 text-brand-secondary" />
            <h3 className="font-serif font-black italic text-lg">Proponer Lugar</h3>
          </div>

          <form onSubmit={handleAddPendingPlace} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-brand-outline mb-1.5">
                Nombre del Lugar *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Museo de arte moderno"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-brand-background border border-brand-primary/10 rounded-none py-2.5 px-3 text-xs focus:outline-none focus:border-brand-primary/30 font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-brand-outline mb-1.5">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PendingPlace['category'])}
                  className="w-full bg-brand-background border border-brand-primary/10 rounded-none py-2.5 px-2 text-xs focus:outline-none focus:border-brand-primary/30 font-sans"
                >
                  <option value="Turismo">Turismo</option>
                  <option value="Gastronomía">Gastronomía</option>
                  <option value="Relajación">Relajación</option>
                  <option value="Aventura">Aventura</option>
                  <option value="Alojamiento">Alojamiento</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-brand-outline mb-1.5">
                  Ubicación
                </label>
                <input
                  type="text"
                  placeholder="Ej. Centro histórico"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-brand-background border border-brand-primary/10 rounded-none py-2.5 px-3 text-xs focus:outline-none focus:border-brand-primary/30 font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-brand-outline mb-1.5">
                Descripción / Notas
              </label>
              <textarea
                rows={3}
                placeholder="Añade detalles o por qué deberíamos visitar este lugar..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-brand-background border border-brand-primary/10 rounded-none py-2 px-3 text-xs focus:outline-none focus:border-brand-primary/30 font-sans resize-none"
              />
            </div>

            {/* Friends Selector for this specific place */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-brand-outline mb-2">
                ¿Quiénes participan en este recorrido?
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar p-1 border border-brand-primary/5 bg-brand-background/30">
                {participants.map((participantName) => {
                  const isSelected = selectedPeople.includes(participantName);
                  return (
                    <button
                      type="button"
                      key={participantName}
                      onClick={() => handleTogglePerson(participantName)}
                      className={`flex items-center gap-2 p-1.5 border transition-all text-left ${
                        isSelected
                          ? 'border-brand-primary/35 bg-white'
                          : 'border-transparent opacity-60'
                      }`}
                    >
                      <span className="text-[10px] font-bold text-brand-primary truncate">{participantName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-primary hover:bg-brand-primary/95 text-brand-on-primary py-3 rounded-none font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer active:scale-98"
            >
              Proponer Lugar
            </button>
          </form>
        </div>

        {/* Tip Box */}
        <div className="bg-brand-primary/5 border border-brand-primary/10 p-5 rounded-none">
          <div className="flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-brand-secondary shrink-0 mt-0.5" />
            <div>
              <h4 className="font-serif font-black italic text-xs text-brand-primary mb-1">Planificación Colaborativa</h4>
              <p className="text-[11px] text-brand-outline leading-relaxed font-sans font-medium">
                Propongan restaurantes o desvíos aquí. Cuando todo el grupo esté de acuerdo, dale el **visto bueno** para integrarlo inmediatamente en el itinerario y trazarlo en el mapa interactivo.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* List Column */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-brand-primary">
            <Bookmark className="w-5 h-5 text-brand-primary" />
            <h3 className="font-serif font-black italic text-lg">Lugares Propuestos y Pendientes ({pendingPlaces.length})</h3>
          </div>
        </div>

        {pendingPlaces.length === 0 ? (
          <div className="p-12 bg-white border border-brand-primary/10 rounded-none text-center">
            <MapPin className="w-8 h-8 text-brand-outline/40 mx-auto mb-3" />
            <p className="font-serif font-bold italic text-brand-primary text-sm mb-1">No hay lugares pendientes</p>
            <p className="text-xs text-brand-outline">¡Empieza por proponer un punto de interés o restaurante en el formulario de la izquierda!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingPlaces.map((place) => {
              const currentDaySelection = selectedDays[place.id] || itinerary[0]?.id || 'day-1';
              return (
                <div 
                  key={place.id}
                  className="bg-white border border-brand-primary/10 rounded-none p-5 flex flex-col justify-between hover:border-brand-primary/30 transition-all duration-300"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider bg-brand-background text-brand-primary border border-brand-primary/10">
                        {place.category}
                      </span>
                      <button 
                        onClick={() => handleDeletePending(place.id)}
                        className="text-brand-outline hover:text-red-600 transition-colors cursor-pointer"
                        title="Descartar propuesta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="font-serif font-black italic text-brand-primary text-base leading-snug mb-1">
                      {place.title}
                    </h4>
                    
                    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-brand-primary/60 mb-3">
                      <MapPin className="w-3 h-3 text-brand-primary/50" />
                      <span>{place.location}</span>
                    </span>

                    <p className="text-xs text-brand-on-surface-variant/90 leading-relaxed font-sans mb-4">
                      {place.description}
                    </p>

                    {/* Participating list on the card */}
                    <div className="border-t border-brand-primary/5 pt-3 mb-4">
                      <span className="text-[9px] font-black uppercase tracking-wider text-brand-outline mb-2 flex items-center gap-1">
                        <Users className="w-3 h-3 text-brand-primary/50" />
                        <span>Integrantes del Recorrido ({place.people?.length || 0})</span>
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {place.people?.map((personName) => (
                          <div
                            key={personName}
                            className="flex items-center gap-1 px-2 py-0.5 bg-brand-background border border-brand-primary/5 rounded-none text-[9px] font-bold text-brand-primary"
                            title={personName}
                          >
                            <span>{personName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-brand-primary/10 pt-4 mt-auto">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-black uppercase tracking-wider text-brand-outline">Sincronizar al Día:</span>
                        <select
                          value={currentDaySelection}
                          onChange={(e) => setSelectedDays(prev => ({ ...prev, [place.id]: e.target.value }))}
                          className="bg-brand-background border border-brand-primary/10 rounded-none text-xs py-1 px-1.5 focus:outline-none focus:border-brand-primary/30"
                        >
                          {itinerary.map(day => (
                            <option key={day.id} value={day.id}>
                              Día {day.dayNumber} ({day.date})
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={() => handleApprovePlace(place.id, currentDaySelection, place.title)}
                        className="w-full bg-brand-secondary hover:bg-brand-secondary/90 text-brand-primary py-2.5 rounded-none font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98 shadow-none"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3px]" />
                        <span>Visto Bueno (Aprobar)</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
