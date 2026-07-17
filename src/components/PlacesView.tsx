import React, { useState, type CSSProperties } from 'react';
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

const CATEGORY_OPTIONS: PendingPlace['category'][] = ['Turismo', 'Gastronomía', 'Relajación', 'Aventura', 'Alojamiento'];

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
        <md-elevated-card style={{ display: 'block' } as CSSProperties} className="p-6">
          <div className="flex items-center gap-2 mb-4 text-brand-primary">
            <Plus className="w-5 h-5 text-brand-secondary" />
            <h3 className="font-serif font-black italic text-lg">Proponer Lugar</h3>
          </div>

          <form onSubmit={handleAddPendingPlace} className="space-y-4">
            <md-outlined-text-field
              label="Nombre del Lugar *"
              required
              placeholder="Ej. Museo de arte moderno"
              value={title}
              onInput={(e) => setTitle(e.currentTarget.value)}
              style={{ width: '100%' }}
            />

            <div className="grid grid-cols-2 gap-3">
              <md-outlined-select
                label="Categoría"
                value={category}
                onChange={(e) => setCategory(e.currentTarget.value as PendingPlace['category'])}
                style={{ width: '100%', minWidth: 0 }}
              >
                {CATEGORY_OPTIONS.map(option => (
                  <md-select-option key={option} value={option} selected={option === category}>
                    <div slot="headline">{option}</div>
                  </md-select-option>
                ))}
              </md-outlined-select>

              <md-outlined-text-field
                label="Ubicación"
                placeholder="Ej. Centro histórico"
                value={location}
                onInput={(e) => setLocation(e.currentTarget.value)}
              />
            </div>

            <md-outlined-text-field
              label="Descripción / Notas"
              type="textarea"
              rows={3}
              placeholder="Añade detalles o por qué deberíamos visitar este lugar..."
              value={description}
              onInput={(e) => setDescription(e.currentTarget.value)}
              style={{ width: '100%' }}
            />

            {/* Friends Selector for this specific place */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-brand-outline mb-2">
                ¿Quiénes participan en este recorrido?
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
                {participants.map((participantName) => {
                  const isSelected = selectedPeople.includes(participantName);
                  return isSelected ? (
                    <md-filled-button
                      type="button"
                      key={participantName}
                      onClick={() => handleTogglePerson(participantName)}
                      style={{ '--md-filled-button-label-text-size': '10px' } as CSSProperties}
                    >
                      {participantName}
                    </md-filled-button>
                  ) : (
                    <md-outlined-button
                      type="button"
                      key={participantName}
                      onClick={() => handleTogglePerson(participantName)}
                      style={{ '--md-outlined-button-label-text-size': '10px' } as CSSProperties}
                    >
                      {participantName}
                    </md-outlined-button>
                  );
                })}
              </div>
            </div>

            <md-filled-button type="submit" style={{ width: '100%' }}>
              Proponer Lugar
            </md-filled-button>
          </form>
        </md-elevated-card>

        {/* Tip Box */}
        <md-outlined-card style={{ display: 'block' } as CSSProperties} className="p-5">
          <div className="flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-brand-secondary shrink-0 mt-0.5" />
            <div>
              <h4 className="font-serif font-black italic text-xs text-brand-primary mb-1">Planificación Colaborativa</h4>
              <p className="text-[11px] text-brand-outline leading-relaxed font-sans font-medium">
                Propongan restaurantes o desvíos aquí. Cuando todo el grupo esté de acuerdo, dale el **visto bueno** para integrarlo inmediatamente en el itinerario y trazarlo en el mapa interactivo.
              </p>
            </div>
          </div>
        </md-outlined-card>
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
          <md-outlined-card style={{ display: 'block' } as CSSProperties} className="p-12 text-center">
            <MapPin className="w-8 h-8 text-brand-outline/40 mx-auto mb-3" />
            <p className="font-serif font-bold italic text-brand-primary text-sm mb-1">No hay lugares pendientes</p>
            <p className="text-xs text-brand-outline">¡Empieza por proponer un punto de interés o restaurante en el formulario de la izquierda!</p>
          </md-outlined-card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingPlaces.map((place) => {
              const currentDaySelection = selectedDays[place.id] || itinerary[0]?.id || 'day-1';
              return (
                <md-elevated-card
                  key={place.id}
                  style={{ display: 'flex' } as CSSProperties}
                  className="p-5 flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider bg-brand-background text-brand-primary border border-brand-primary/10">
                        {place.category}
                      </span>
                      <md-icon-button
                        onClick={() => handleDeletePending(place.id)}
                        aria-label="Descartar propuesta"
                        style={{ '--md-icon-button-hover-icon-color': 'var(--md-sys-color-error)' } as CSSProperties}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </md-icon-button>
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
                        <md-outlined-select
                          value={currentDaySelection}
                          onChange={(e) => setSelectedDays(prev => ({ ...prev, [place.id]: e.currentTarget.value }))}
                        >
                          {itinerary.map(day => (
                            <md-select-option key={day.id} value={day.id} selected={day.id === currentDaySelection}>
                              <div slot="headline">Día {day.dayNumber} ({day.date})</div>
                            </md-select-option>
                          ))}
                        </md-outlined-select>
                      </div>

                      <md-filled-button
                        onClick={() => handleApprovePlace(place.id, currentDaySelection, place.title)}
                        style={
                          {
                            width: '100%',
                            '--md-sys-color-primary': 'var(--md-sys-color-secondary)',
                            '--md-sys-color-on-primary': 'var(--md-sys-color-on-secondary)',
                          } as CSSProperties
                        }
                      >
                        <Check slot="icon" className="w-3.5 h-3.5 stroke-[3px]" />
                        Visto Bueno (Aprobar)
                      </md-filled-button>
                    </div>
                  </div>
                </md-elevated-card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
