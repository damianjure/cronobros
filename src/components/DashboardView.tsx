import React, { useState } from 'react';
import {
  Navigation,
  CheckCircle2,
  Clock,
  Heart,
  Send,
  ChevronRight,
  Compass,
  MessageSquare,
  Sparkles,
  Info
} from 'lucide-react';
import { ChatMessage, UpcomingHighlight, ActiveTab } from '../types';
import { useTripStore } from '../store/tripStore';
import { useAuthStore } from '../store/authStore';
import { useCurrentTrip } from '../store/currentTripContext';
import { useTripParticipants, useTripPendingInvitesCount } from '../store/participants';
import { deriveUpcomingHighlights } from '../utils/highlights';
import CriticalEventsCard from './CriticalEventsCard';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export default function DashboardView({ setActiveTab }: DashboardViewProps) {
  const messages = useTripStore(state => state.chatMessages);
  const addChatMessage = useTripStore(state => state.addChatMessage);
  const itinerary = useTripStore(state => state.itinerary);
  const pins = useTripStore(state => state.pins);
  const user = useAuthStore(state => state.user);
  const currentTrip = useCurrentTrip();
  const participants = useTripParticipants();
  const pendingInvitesCount = useTripPendingInvitesCount();
  // PR5: derived from the trip's REAL itinerary instead of the discarded
  // `data.ts` fixture — a brand-new trip has no upcoming highlights yet.
  const initialHighlights = deriveUpcomingHighlights(itinerary);
  const nextStop = initialHighlights[0] ?? null;
  const displayName = user?.displayName ?? user?.email ?? 'viajero';

  const [inputValue, setInputValue] = useState('');
  // No sticky-note feature is wired up yet (no store field, nothing ever
  // sets this) — `null` so the UI doesn't fabricate an attribution for a
  // note nobody wrote.
  const activeNote: string | null = null;
  const [selectedHighlight, setSelectedHighlight] = useState<UpcomingHighlight | null>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: {
        name: `${displayName} (Tú)`,
        avatar: user?.photoURL ?? '',
        isCurrentUser: true,
        role: 'Líder de Expedición'
      },
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    addChatMessage(userMessage);
    setInputValue('');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Center Canvas */}
      <div className="flex-1 space-y-8">
        
        {/* Welcome Header */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="welcome-header">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-black italic text-brand-primary tracking-tight">
              Bienvenido de nuevo, {displayName}
            </h1>
            <p className="text-xs uppercase tracking-widest text-brand-on-surface-variant/80 font-bold mt-1.5">
              {currentTrip?.name ?? 'Tu viaje'}
            </p>
          </div>

          {/* Group avatars */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-3">
              {participants.slice(0, 3).map(name => (
                <div
                  key={name}
                  title={name}
                  className="w-9 h-9 rounded-full border-2 border-brand-background bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-[10px] shadow-none"
                >
                  {name.charAt(0).toUpperCase()}
                </div>
              ))}
              {participants.length > 3 && (
                <div className="w-9 h-9 rounded-full border-2 border-brand-background bg-brand-primary text-brand-on-primary flex items-center justify-center font-bold text-[10px] shadow-none">
                  +{participants.length - 3}
                </div>
              )}
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-on-surface-variant/80 ml-1">
              En viaje{pendingInvitesCount > 0 && ` · +${pendingInvitesCount} pendiente`}
            </span>
          </div>
        </section>

        {/* Next Critical/Unmissable Event with adaptive Geolocation and Countdown */}
        <section id="dashboard-critical-events">
          <CriticalEventsCard />
        </section>

        {/* Active Route Map & Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Active Map Card */}
          <md-elevated-card
            className="md:col-span-2 overflow-hidden relative group min-h-[220px] md:min-h-[380px] flex flex-col justify-end"
            style={{ display: 'flex', '--md-elevated-card-container-shape': '16px' } as React.CSSProperties}
            id="dashboard-active-route"
          >
            {/* Map background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_30%,rgba(216,150,95,0.38),transparent_28%),radial-gradient(circle_at_75%_65%,rgba(49,82,76,0.42),transparent_32%),linear-gradient(135deg,#e9eee8,#c9d5d1)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/40 via-transparent to-transparent pointer-events-none" />

            {/* Navigation Floating Button */}
            <md-filled-icon-button
              onClick={() => setActiveTab('map')}
              className="absolute top-4 right-4 z-20"
              id="dashboard-nav-map-floating"
              aria-label="Ver en Mapa Interactivo"
            >
              <Navigation className="w-4.5 h-4.5 fill-current" />
            </md-filled-icon-button>

            {/* Floating Info Overlay on Map */}
            <md-elevated-card
              style={{ display: 'flex' } as React.CSSProperties}
              className="relative z-10 p-5 m-5 flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                  <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em]">
                    {pins.length > 0 ? 'Lugares Guardados' : 'Sin Lugares Todavía'}
                  </span>
                </div>
                <h2 className="text-xl font-serif font-black italic text-brand-primary">
                  {pins.length > 0
                    ? `${pins.length} ${pins.length === 1 ? 'lugar' : 'lugares'} en el mapa`
                    : 'Agregá lugares desde Lugares o el Mapa'}
                </h2>
              </div>
            </md-elevated-card>
          </md-elevated-card>

          {/* Sidebar Stats Column */}
          <div className="flex flex-col gap-6">

            {/* Places saved */}
            <md-elevated-card style={{ display: 'flex' } as React.CSSProperties} className="p-6 flex-col justify-center flex-1">
              <p className="text-[10px] font-black text-brand-on-surface-variant/75 uppercase tracking-widest mb-1.5">
                Lugares Guardados
              </p>
              <h3 className="text-3xl font-serif font-black italic text-brand-primary">
                {pins.length}
              </h3>
              <p className="text-[10px] text-brand-outline mt-2.5 font-bold uppercase tracking-wider">
                {itinerary.length} {itinerary.length === 1 ? 'día planificado' : 'días planificados'}
              </p>
            </md-elevated-card>

            {/* Next Stop highlight */}
            <md-filled-card
              style={
                {
                  display: 'flex',
                  '--md-filled-card-container-color': 'var(--md-sys-color-primary-container)',
                  color: 'var(--md-sys-color-on-primary-container)',
                } as React.CSSProperties
              }
              className="p-6 flex-col justify-between flex-1 relative group"
            >
              {/* Own overflow-hidden layer so the decorative blur clips at the
                  corner without also clipping real content — the card's box
                  is already tight for its text+buttons (pre-existing, not
                  introduced by this migration), so the card itself must stay
                  overflow-visible. */}
              <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
              </div>

              <div>
                <div className="flex items-center gap-1.5 opacity-90 font-bold text-[10px] uppercase tracking-widest mb-2.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Siguiente Parada</span>
                </div>
                <h3 className="text-2xl font-serif font-black italic tracking-tight">
                  {nextStop ? nextStop.title : 'Aún no hay planes'}
                </h3>
                <p className="text-xs opacity-75 mt-2 leading-relaxed font-sans">
                  {nextStop ? nextStop.description : 'Agregá tu primera actividad en el Itinerario.'}
                </p>
              </div>

              <div className="mt-5 flex gap-2">
                {nextStop && (
                  <md-text-button onClick={() => setSelectedHighlight(nextStop)}>
                    <Info slot="icon" className="w-3 h-3" />
                    Detalles
                  </md-text-button>
                )}
                <md-filled-button onClick={() => setActiveTab('itinerary')}>Ir al Itinerario</md-filled-button>
              </div>
            </md-filled-card>
          </div>
        </section>

        {/* Upcoming Highlights */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl md:text-3xl font-black italic text-brand-primary tracking-tight">
              Próximos Momentos Destacados
            </h2>
            <md-text-button onClick={() => setActiveTab('itinerary')}>
              Itinerario Completo
              <ChevronRight slot="icon" className="w-3.5 h-3.5" />
            </md-text-button>
          </div>

          {initialHighlights.length === 0 ? (
            <md-outlined-card style={{ display: 'block' }} className="p-10 text-center">
              <p className="font-serif font-bold italic text-brand-primary text-sm mb-1">Aún no hay momentos destacados</p>
              <p className="text-xs text-brand-outline">Agregá actividades en el Itinerario para verlas aquí.</p>
            </md-outlined-card>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {initialHighlights.map((highlight) => (
              <md-elevated-card
                key={highlight.id}
                onClick={() => setSelectedHighlight(highlight)}
                style={{ display: 'flex', cursor: 'pointer' } as React.CSSProperties}
                className="overflow-hidden group flex-col h-full"
                id={`highlight-card-${highlight.id}`}
              >
                <div className="h-40 overflow-hidden relative shrink-0 bg-brand-background">
                  {highlight.image && (
                    <img
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src={highlight.image}
                      alt={highlight.title}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-none text-[9px] font-black uppercase tracking-widest text-brand-primary border border-brand-primary/5">
                    Día {highlight.day}
                  </div>

                  <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-none text-[8px] font-black tracking-widest flex items-center gap-1 shadow-none ${
                    highlight.status === 'CONFIRMED'
                      ? 'bg-brand-primary text-brand-on-primary'
                      : highlight.status === 'RESERVED'
                      ? 'bg-brand-sunset text-white'
                      : 'bg-brand-secondary text-brand-on-secondary'
                  }`}>
                    {highlight.status === 'CONFIRMED' && <CheckCircle2 className="w-2.5 h-2.5" />}
                    {highlight.status === 'PENDING' && <Clock className="w-2.5 h-2.5" />}
                    {highlight.status === 'RESERVED' && <Heart className="w-2.5 h-2.5 fill-current" />}
                    <span>
                      {highlight.status === 'CONFIRMED' 
                        ? 'CONFIRMADO' 
                        : highlight.status === 'RESERVED' 
                        ? 'RESERVADO' 
                        : highlight.status === 'PENDING' 
                        ? 'PENDIENTE' 
                        : highlight.status}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-black text-brand-on-surface-variant/60 uppercase tracking-widest block mb-1">
                      {highlight.type}
                    </span>
                    <h3 className="font-serif font-black italic text-brand-primary text-base group-hover:opacity-80 transition-colors leading-snug">
                      {highlight.title}
                    </h3>
                    <p className="text-xs text-brand-on-surface-variant/90 font-sans mt-2 leading-relaxed line-clamp-2">
                      {highlight.description}
                    </p>
                  </div>
                </div>
              </md-elevated-card>
            ))}
          </div>
          )}
        </section>

        {/* Selected Highlight Detail Modal */}
        {selectedHighlight && (
          <div className="fixed inset-0 bg-brand-primary/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <md-elevated-card
              style={{ display: 'flex' } as React.CSSProperties}
              className="overflow-hidden max-w-md w-full animate-in zoom-in-95 duration-200 relative flex-col"
            >
              <div className="h-48 relative bg-brand-background">
                {selectedHighlight.image && (
                  <img className="w-full h-full object-cover" src={selectedHighlight.image} alt={selectedHighlight.title} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                <md-icon-button
                  onClick={() => setSelectedHighlight(null)}
                  aria-label="Cerrar"
                  className="absolute top-4 right-4"
                  style={{ '--md-icon-button-icon-color': 'white', '--md-icon-button-hover-icon-color': 'white' } as React.CSSProperties}
                >
                  <md-icon>close</md-icon>
                </md-icon-button>
                <div className="absolute bottom-4 left-4">
                  <span className="text-[9px] font-black uppercase bg-brand-primary text-brand-on-primary px-2.5 py-0.5 rounded-none tracking-widest">Día {selectedHighlight.day} • {selectedHighlight.type}</span>
                  <h4 className="font-serif font-black italic text-lg text-white mt-1.5">{selectedHighlight.title}</h4>
                </div>
              </div>
              <div className="p-6">
                <p className="text-xs text-brand-on-surface-variant/95 leading-relaxed font-sans">
                  {selectedHighlight.description}
                </p>
                <div className="mt-4 flex justify-between items-center text-[10px] uppercase tracking-wider text-brand-outline">
                  <span>Estado:</span>
                  <span className="font-extrabold text-brand-primary">
                    {selectedHighlight.status === 'CONFIRMED' 
                      ? 'CONFIRMADO' 
                      : selectedHighlight.status === 'RESERVED' 
                      ? 'RESERVADO' 
                      : selectedHighlight.status === 'PENDING' 
                      ? 'PENDIENTE' 
                      : selectedHighlight.status}
                  </span>
                </div>
                <md-filled-button onClick={() => setSelectedHighlight(null)} style={{ width: '100%', marginTop: '20px' }}>
                  Entendido
                </md-filled-button>
              </div>
            </md-elevated-card>
          </div>
        )}

      </div>

      {/* Sidebar (Group Chat & Activity) */}
      <aside className="w-full lg:w-80 shrink-0 space-y-6" id="dashboard-chat-sidebar">
        <md-elevated-card
          style={{ display: 'flex', '--md-elevated-card-container-shape': '16px' } as React.CSSProperties}
          className="p-6 h-[550px] lg:h-[calc(100vh-140px)] flex-col"
        >

          <div className="flex items-center justify-between mb-4 pb-2 border-b border-brand-primary/10">
            <h2 className="text-base font-serif font-black italic text-brand-primary flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-primary/60" />
              <span>Chat de Grupo</span>
            </h2>
            <span className="text-[9px] font-black bg-brand-background border border-brand-primary/5 px-2.5 py-1 rounded-none text-brand-on-surface-variant/85 uppercase tracking-widest">
              {participants.length} ACTIVOS
            </span>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            {messages.map((msg) => {
              const isCurrentUser = msg.sender.isCurrentUser;
              return (
                <div key={msg.id} className={`flex gap-3 items-start ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-brand-primary/10 shrink-0 shadow-none bg-brand-primary/10 flex items-center justify-center text-[10px] font-bold text-brand-primary">
                    {msg.sender.avatar ? (
                      <img className="w-full h-full object-cover" src={msg.sender.avatar} alt={msg.sender.name} />
                    ) : (
                      msg.sender.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  
                  <div className="max-w-[80%] flex flex-col">
                    <span className={`text-[9px] font-black text-brand-outline uppercase tracking-widest mb-0.5 ${isCurrentUser ? 'text-right' : ''}`}>
                      {msg.sender.name}
                    </span>
                    
                    <div className={`p-3 rounded-none ${
                      isCurrentUser
                        ? 'bg-brand-primary text-brand-on-primary'
                        : msg.isImportant
                        ? 'bg-brand-sunset text-white'
                        : 'bg-brand-surface-low border border-brand-primary/5 text-brand-primary'
                    }`}>
                      <p className="text-xs leading-relaxed font-sans">{msg.content}</p>
                      <span className={`text-[8px] tracking-widest uppercase mt-1.5 block leading-none font-bold ${
                        isCurrentUser ? 'text-brand-on-primary/70' : msg.isImportant ? 'text-white/70' : 'text-brand-outline'
                      }`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* New Itinerary Note panel inside Chat Sidebar */}
          <div className="mt-4 pt-3 border-t border-brand-primary/10">
            <p className="text-[9px] font-black text-brand-primary uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Compass className="w-3 h-3 text-brand-primary/60" />
              <span>Nota Adhesiva Activa</span>
            </p>
            <md-outlined-card style={{ display: 'block' }} className="p-3">
              <p className="text-xs italic text-brand-primary font-serif font-medium leading-relaxed">
                {activeNote ? `"${activeNote}"` : 'Sin notas todavía.'}
              </p>
              {activeNote && (
                <p className="text-[9px] text-brand-primary/70 font-bold uppercase tracking-wider mt-1 text-right">— Añadido por {displayName}</p>
              )}
            </md-outlined-card>
            <p className="text-[9px] text-brand-outline mt-1.5 font-bold uppercase tracking-wider text-center">
              Escribe "nota: &lt;msg&gt;" para actualizar
            </p>
          </div>

          {/* Message input field */}
          <form onSubmit={handleSendMessage} className="mt-3 pt-3 border-t border-brand-primary/10">
            <md-outlined-text-field
              placeholder="Enviar mensaje al grupo..."
              value={inputValue}
              onInput={(e) => setInputValue(e.currentTarget.value)}
              id="chat-input-box"
              style={{ width: '100%' }}
            >
              <md-icon-button type="submit" slot="trailing-icon" aria-label="Enviar mensaje" id="chat-send-btn">
                <Send className="w-4 h-4 fill-current" />
              </md-icon-button>
            </md-outlined-text-field>
          </form>

        </md-elevated-card>
      </aside>
    </div>
  );
}
