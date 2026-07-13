import React, { useState, useEffect } from 'react';
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
import { upcomingHighlights as initialHighlights } from '../data';
import CriticalEventsCard from './CriticalEventsCard';

interface DashboardViewProps {
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setActiveTab: (tab: ActiveTab) => void;
}

export default function DashboardView({ 
  chatMessages, 
  setChatMessages,
  setActiveTab
}: DashboardViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(chatMessages);
  const [inputValue, setInputValue] = useState('');
  const [activeNote, setActiveNote] = useState(
    "Recuerda empacar los filtros impermeables para drones para la sesión de fotos de Skógafoss."
  );
  const [selectedHighlight, setSelectedHighlight] = useState<UpcomingHighlight | null>(null);
  const [showNextStopDetails, setShowNextStopDetails] = useState(false);

  // Sync messages state to parent if needed
  useEffect(() => {
    setChatMessages(messages);
  }, [messages, setChatMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: {
        name: 'Alex (Tú)',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCr387soWTtXUJbgL9pO9o3NzLfBnAz_ZIMfNeyMLMiAHdRtuMfAAH4HyXQhEYk4wFeVHGEfK6N8-gIpXWe7xTGjQ5EUkhAXoSJjxxzafBR-uXp2qHHQ6y9785VK8pAxb4i06PNpLaRpZMzVALvNf-yiPaNzYsqChtVCZHnECrlWotYDWCAdCQycJ7o2_wcNMlZr1GLpzOTBYapoeottpDKTzQ1-42paVA_Gv_anczV-PKFK13XKZcKrd5hj3B7F6vETC_DYWrx8qPz',
        isCurrentUser: true,
        role: 'Líder de Expedición'
      },
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');

    // If message mentions "note" or "remember", update the itinerary note
    if (currentInput.toLowerCase().includes('nota:') || currentInput.toLowerCase().includes('recuerda')) {
      const cleanNote = currentInput.replace(/nota:/i, '').replace(/recuerda/i, '').trim();
      setActiveNote(cleanNote);
    } else {
      // Simulate reply from friends
      setTimeout(() => {
        let replyContent = "¡Eso suena como un plan increíble! No puedo esperar.";
        let senderName = "Sarah";
        let avatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuC_scvakiKbrrrRI_-Pm2qEKrgr42w-Zxnzfo1elMxW-rblu18TPbSGvrqUpslnCSJswJyezA3RB93Bj4MhSFwkTgD6OaZF2UOycSOQEP-ZGbSZYR2dUHB83651Y26BzJMxAGj0Je8w8OxXBsB-12sjBlVwtvZT2qO-9oZEYUt8JNzg0niZMMZTdvTaDa-hT-wzSCqzNgxoCv2rh_hg1LScTbdhGOY2CT77m02PSoTFnbTkdEtPfPofPPifuj0OfUpGXwwr-s10U-54";

        if (currentInput.toLowerCase().includes('comida') || currentInput.toLowerCase().includes('comer') || currentInput.toLowerCase().includes('almuerzo')) {
          replyContent = "¡Sí! La sopa de langosta islandesa en Bryggjan está muy bien calificada. Asegurémonos de llegar a tiempo.";
          senderName = "James";
          avatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuAOQ_svfRla5JO_7LcA6ad8K7ccJ8CrsZudd5WtRt9-2BLGT9NwcEHM7_fcejok0f7wCGp-3rG5QUYq7FgusYoGtXxvf8gNMB__eEmJ856TyKXgU2yB_uo_9LZvH2icOGuV5AN8i0cc6o-G_zEfU8kGkdKZSlBY9wXfeGcZLgJfIfSW_MfSs9m-xbGvyJ9YxJrSLAEha-mrJqGYw7QO7LxdzA6ASu29fVWx1SEIPOmh8WOtS5W8cZcwrUhuB3rxHtS7pYa95Hpqe7y4";
        } else if (currentInput.toLowerCase().includes('ferry') || currentInput.toLowerCase().includes('hora') || currentInput.toLowerCase().includes('horario')) {
          replyContent = "Verifiqué dos veces los horarios del ferry y son estrictos. Intentemos llegar 20 minutos antes.";
          senderName = "Maya";
          avatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuBASr24FgG3vzWTsDBsDfYRpGRsrizvm6jVMGJpXnT_osDk3Xh2_4Pwsjb68JkpjHPd6dOtI9GYaAOI45_NtWBgPEUuVc21ouwj19OF4eehIMGE6ebp7gDNA9ZGeg8u4aiQU8_c--C9p360niDkPVg0TF_aVIH0gHiL7N4gkL1kJW_dh7ZdJn2vE8FQbY_g_bvjdTfxO-hXRARP-ZnjO-Wvc0o1WePDjEwaOboQLUaJ8O90ngK347qcjrwDkVs2ox-Z2QyjWdwH2p8c";
        }

        const friendReply: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: { name: senderName, avatar, role: 'Viajera' },
          content: replyContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, friendReply]);
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Center Canvas */}
      <div className="flex-1 space-y-8">
        
        {/* Welcome Header */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="welcome-header">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-black italic text-brand-primary tracking-tight">
              Bienvenido de nuevo, Alex
            </h1>
            <p className="text-xs uppercase tracking-widest text-brand-on-surface-variant/80 font-bold mt-1.5">
              Tu aventura islandesa está al 40% • ¿Listo para el Norte?
            </p>
          </div>
          
          {/* Group avatars */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-3">
              <div className="w-9 h-9 rounded-full border-2 border-brand-background overflow-hidden shadow-none" title="Sarah">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsiiV2o3md6E8RS7zNwR6kgD77dlbOG2snIRYl1y6tDLkMG-VPat4mHrXALNYHZs1bpttUx15RkD_cogvtdEEgC8IJoJbtiGlsZQHf6DjuxMIYUNgpTnLZwTfXZU7J5ANmxhSlcGH82s_sW_ZjxpfOt0rnAAkHIrylCT3ciZf-LkdbSmlyKRt5tqEcyA7pFYuAo2exYRyPhl-VIFZzrxA9ZQsr5sOKhPDUXowPoN34nw9aeoLfLEW44U6WOe-iNNskE3zqyOx6Cx8z" alt="Sarah" />
              </div>
              <div className="w-9 h-9 rounded-full border-2 border-brand-background overflow-hidden shadow-none" title="James">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOQ_svfRla5JO_7LcA6ad8K7ccJ8CrsZudd5WtRt9-2BLGT9NwcEHM7_fcejok0f7wCGp-3rG5QUYq7FgusYoGtXxvf8gNMB__eEmJ856TyKXgU2yB_uo_9LZvH2icOGuV5AN8i0cc6o-G_zEfU8kGkdKZSlBY9wXfeGcZLgJfIfSW_MfSs9m-xbGvyJ9YxJrSLAEha-mrJqGYw7QO7LxdzA6ASu29fVWx1SEIPOmh8WOtS5W8cZcwrUhuB3rxHtS7pYa95Hpqe7y4" alt="James" />
              </div>
              <div className="w-9 h-9 rounded-full border-2 border-brand-background overflow-hidden shadow-none" title="Maya">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBASr24FgG3vzWTsDBsDfYRpGRsrizvm6jVMGJpXnT_osDk3Xh2_4Pwsjb68JkpjHPd6dOtI9GYaAOI45_NtWBgPEUuVc21ouwj19OF4eehIMGE6ebp7gDNA9ZGeg8u4aiQU8_c--C9p360niDkPVg0TF_aVIH0gHiL7N4gkL1kJW_dh7ZdJn2vE8FQbY_g_bvjdTfxO-hXRARP-ZnjO-Wvc0o1WePDjEwaOboQLUaJ8O90ngK347qcjrwDkVs2ox-Z2QyjWdwH2p8c" alt="Maya" />
              </div>
              <div className="w-9 h-9 rounded-full border-2 border-brand-background bg-brand-primary text-white flex items-center justify-center font-bold text-[10px] shadow-none">
                +3
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-on-surface-variant/80 ml-1">En viaje</span>
          </div>
        </section>

        {/* Next Critical/Unmissable Event with adaptive Geolocation and Countdown */}
        <section id="dashboard-critical-events">
          <CriticalEventsCard />
        </section>

        {/* Active Route Map & Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Active Map Card */}
          <div className="md:col-span-2 bg-white rounded-none overflow-hidden relative border border-brand-primary/10 shadow-none group min-h-[380px] flex flex-col justify-end" id="dashboard-active-route">
            
            {/* Map background */}
            <div 
              className="absolute inset-0 bg-cover bg-center group-hover:scale-[1.01] transition-transform duration-700" 
              style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCb-OSyf8uyb2MmTYNX6yjP1SDyJI_YGecYb1wqOC1G2NnUClxeu3c1CrY1CRwb0jsH8ZhQJm4QMrkzBPq0U2HkDT6qMEOkatQoBzQAGG0GeIFKSfJQgb3778-dvJbEcivujEUgtQ9O3ZGGj9691kCTebP0zv_vH_FVjH3qUch_HALUnNvVT2i4BD7e-05b07HPRhcHyJt7lEA7oocRfdL9C7vsnadtlTjWQNEwXnAWuf5DLnESZKjlEIV4a-8GnvuLh5jYtTzXDHLV')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/40 via-transparent to-transparent pointer-events-none" />

            {/* Navigation Floating Button */}
            <button 
              onClick={() => setActiveTab('map')}
              className="absolute top-4 right-4 bg-brand-primary text-white p-3 rounded-none shadow-none z-20 hover:bg-brand-primary/90 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              id="dashboard-nav-map-floating"
              title="Ver en Mapa Interactivo"
            >
              <Navigation className="w-4.5 h-4.5 fill-current" />
            </button>

            {/* Floating Info Overlay on Map */}
            <div className="relative z-10 p-5 m-5 bg-white border border-brand-primary/15 rounded-none flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                  <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em]">
                    Ruta Activa: Ring Road Norte
                  </span>
                </div>
                <h2 className="text-xl font-serif font-black italic text-brand-primary">
                  Reikiavik → Akureyri
                </h2>
              </div>
              
              <div className="sm:text-right border-t sm:border-t-0 border-brand-primary/10 pt-2.5 sm:pt-0 w-full sm:w-auto">
                <p className="text-[9px] text-brand-on-surface-variant/70 font-black uppercase tracking-widest">
                  Tiempo Est. de Viaje
                </p>
                <p className="text-2xl font-serif font-black italic text-brand-primary mt-0.5">
                  4h 45m
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar Stats Column */}
          <div className="flex flex-col gap-6">
            
            {/* Distance Remaining */}
            <div className="bg-white rounded-none p-6 border border-brand-primary/10 shadow-none flex flex-col justify-center flex-1">
              <p className="text-[10px] font-black text-brand-on-surface-variant/75 uppercase tracking-widest mb-1.5">
                Distancia Restante
              </p>
              <h3 className="text-3xl font-serif font-black italic text-brand-primary">
                382 <span className="text-sm font-sans uppercase font-bold tracking-wider text-brand-on-surface-variant/70">km</span>
              </h3>
              
              <div className="w-full h-1 bg-brand-surface-container mt-4 overflow-hidden relative">
                <div className="w-2/3 h-full bg-brand-primary" />
              </div>
              <p className="text-[10px] text-brand-outline mt-2.5 font-bold uppercase tracking-wider">66% del tránsito completado</p>
            </div>

            {/* Next Stop highlight */}
            <div className="bg-brand-primary rounded-none p-6 text-white shadow-none flex flex-col justify-between flex-1 relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
              
              <div>
                <div className="flex items-center gap-1.5 text-brand-primary-fixed-dim/90 font-bold text-[10px] uppercase tracking-widest mb-2.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Siguiente Parada</span>
                </div>
                <h3 className="text-2xl font-serif font-black italic tracking-tight">
                  Cascada Goðafoss
                </h3>
                <p className="text-xs text-brand-primary-fixed-dim/75 mt-2 leading-relaxed font-sans">
                  Espectacular cascada recomendada para fotografía y almuerzo.
                </p>
              </div>

              <div className="mt-5 flex gap-2">
                <button 
                  onClick={() => setShowNextStopDetails(true)}
                  className="text-[10px] font-bold uppercase tracking-widest py-2 px-4 rounded-none bg-white/10 hover:bg-white/20 border border-white/10 transition-all text-white cursor-pointer active:scale-95 flex items-center gap-1"
                >
                  <Info className="w-3 h-3" />
                  <span>Detalles</span>
                </button>
                <button 
                  onClick={() => setActiveTab('itinerary')}
                  className="text-[10px] font-bold uppercase tracking-widest py-2 px-4 rounded-none bg-white text-brand-primary hover:bg-brand-primary-fixed transition-all cursor-pointer active:scale-95"
                >
                  Ir al Itinerario
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Next Stop Details Modal */}
        {showNextStopDetails && (
          <div className="fixed inset-0 bg-brand-primary/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-none p-6 max-w-md w-full shadow-2xl border border-brand-primary/10 animate-in zoom-in-95 duration-200 relative">
              <h4 className="font-serif font-black italic text-xl text-brand-primary mb-2">Goðafoss (Cascada de los Dioses)</h4>
              <p className="text-xs text-brand-on-surface-variant/90 leading-relaxed font-sans">
                Una de las cascadas más espectaculares de Islandia. Ubicada en el distrito de Bárðardalur en la región noreste al inicio de la carretera de las tierras altas de Sprengisandur. El agua del río Skjálfandafljót cae desde una altura de 12 metros sobre un ancho de 30 metros.
              </p>
              <div className="mt-4 p-3.5 bg-brand-background border border-brand-primary/5 rounded-none flex flex-col gap-2">
                <div className="flex justify-between text-[10px] uppercase tracking-wider">
                  <span className="font-bold text-brand-outline">Hora Óptima de Visita:</span>
                  <span className="font-extrabold text-brand-primary">1:00 PM - 3:00 PM</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase tracking-wider">
                  <span className="font-bold text-brand-outline">Pronóstico del Clima:</span>
                  <span className="font-extrabold text-brand-secondary">11°C • Parcialmente Nublado</span>
                </div>
              </div>
              <button 
                onClick={() => setShowNextStopDetails(false)}
                className="w-full mt-5 py-2.5 bg-brand-primary hover:bg-brand-primary-container text-white rounded-none font-bold text-[10px] uppercase tracking-widest transition-all active:scale-98 cursor-pointer"
              >
                Cerrar Detalles
              </button>
            </div>
          </div>
        )}

        {/* Upcoming Highlights */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl md:text-3xl font-black italic text-brand-primary tracking-tight">
              Próximos Momentos Destacados
            </h2>
            <button 
              onClick={() => setActiveTab('itinerary')}
              className="text-brand-primary font-bold text-[10px] uppercase tracking-widest hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>Itinerario Completo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {initialHighlights.map((highlight) => (
              <div 
                key={highlight.id}
                onClick={() => setSelectedHighlight(highlight)}
                className="bg-white rounded-none overflow-hidden border border-brand-primary/10 shadow-none group hover:border-brand-primary/30 transition-all duration-300 cursor-pointer flex flex-col h-full"
                id={`highlight-card-${highlight.id}`}
              >
                <div className="h-40 overflow-hidden relative shrink-0">
                  <img 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    src={highlight.image} 
                    alt={highlight.title} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-none text-[9px] font-black uppercase tracking-widest text-brand-primary border border-brand-primary/5">
                    Día {highlight.day}
                  </div>

                  <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-none text-[8px] font-black tracking-widest flex items-center gap-1 shadow-none ${
                    highlight.status === 'CONFIRMED'
                      ? 'bg-brand-primary text-white'
                      : highlight.status === 'RESERVED'
                      ? 'bg-brand-sunset text-white'
                      : 'bg-brand-secondary text-white'
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
              </div>
            ))}
          </div>
        </section>

        {/* Selected Highlight Detail Modal */}
        {selectedHighlight && (
          <div className="fixed inset-0 bg-brand-primary/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-none overflow-hidden max-w-md w-full shadow-2xl border border-brand-primary/10 animate-in zoom-in-95 duration-200 relative flex flex-col">
              <div className="h-48 relative">
                <img className="w-full h-full object-cover" src={selectedHighlight.image} alt={selectedHighlight.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                <button 
                  onClick={() => setSelectedHighlight(null)}
                  className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white w-7 h-7 rounded-none flex items-center justify-center text-xs font-bold transition-all"
                >
                  ✕
                </button>
                <div className="absolute bottom-4 left-4">
                  <span className="text-[9px] font-black uppercase bg-brand-primary text-white px-2.5 py-0.5 rounded-none tracking-widest">Día {selectedHighlight.day} • {selectedHighlight.type}</span>
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
                <button 
                  onClick={() => setSelectedHighlight(null)}
                  className="w-full mt-5 py-2.5 bg-brand-primary hover:bg-brand-primary-container text-white rounded-none font-bold text-[10px] uppercase tracking-widest transition-all active:scale-98 cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Sidebar (Group Chat & Activity) */}
      <aside className="w-full lg:w-80 shrink-0 space-y-6" id="dashboard-chat-sidebar">
        <div className="bg-white rounded-none p-6 h-[550px] lg:h-[calc(100vh-140px)] flex flex-col border border-brand-primary/10 shadow-none">
          
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-brand-primary/10">
            <h2 className="text-base font-serif font-black italic text-brand-primary flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-primary/60" />
              <span>Chat de Grupo</span>
            </h2>
            <span className="text-[9px] font-black bg-brand-background border border-brand-primary/5 px-2.5 py-1 rounded-none text-brand-on-surface-variant/85 uppercase tracking-widest">
              6 ACTIVOS
            </span>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            {messages.map((msg) => {
              const isCurrentUser = msg.sender.isCurrentUser;
              return (
                <div key={msg.id} className={`flex gap-3 items-start ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 rounded-none overflow-hidden border border-brand-primary/10 shrink-0 shadow-none">
                    <img className="w-full h-full object-cover" src={msg.sender.avatar} alt={msg.sender.name} />
                  </div>
                  
                  <div className="max-w-[80%] flex flex-col">
                    <span className={`text-[9px] font-black text-brand-outline uppercase tracking-widest mb-0.5 ${isCurrentUser ? 'text-right' : ''}`}>
                      {msg.sender.name}
                    </span>
                    
                    <div className={`p-3 rounded-none ${
                      isCurrentUser 
                        ? 'bg-brand-primary text-white' 
                        : msg.isImportant
                        ? 'bg-brand-sunset text-white'
                        : 'bg-brand-surface-low border border-brand-primary/5 text-brand-primary'
                    }`}>
                      <p className="text-xs leading-relaxed font-sans">{msg.content}</p>
                      <span className={`text-[8px] tracking-widest uppercase mt-1.5 block leading-none font-bold ${
                        isCurrentUser || msg.isImportant ? 'text-white/70' : 'text-brand-outline'
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
            <div className="p-3 bg-brand-background border border-brand-primary/10 rounded-none shadow-none">
              <p className="text-xs italic text-brand-primary font-serif font-medium leading-relaxed">
                "{activeNote}"
              </p>
              <p className="text-[9px] text-brand-primary/70 font-bold uppercase tracking-wider mt-1 text-right">— Añadido por Alex</p>
            </div>
            <p className="text-[9px] text-brand-outline mt-1.5 font-bold uppercase tracking-wider text-center">
              Escribe "nota: &lt;msg&gt;" para actualizar
            </p>
          </div>

          {/* Message input field */}
          <form onSubmit={handleSendMessage} className="mt-3 pt-3 border-t border-brand-primary/10">
            <div className="relative">
              <input
                type="text"
                placeholder="Enviar mensaje al grupo..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full bg-white border border-brand-primary/10 rounded-none py-3 pl-4 pr-11 text-xs focus:outline-none focus:border-brand-primary/30 transition-all font-sans"
                id="chat-input-box"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-brand-primary hover:bg-brand-primary/5 p-2 rounded-none transition-all cursor-pointer active:scale-90"
                id="chat-send-btn"
              >
                <Send className="w-4 h-4 fill-current" />
              </button>
            </div>
          </form>

        </div>
      </aside>
    </div>
  );
}
