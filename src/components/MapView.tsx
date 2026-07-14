import { useState } from 'react';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Compass,
  Navigation,
  Share,
  MapPin,
  Star,
  Search
} from 'lucide-react';
import { PinnedPoint } from '../types';
import { useTripStore } from '../store/tripStore';
import { useToastStore } from '../store/toastStore';
import { useCurrentTrip } from '../store/currentTripContext';
import { useTripParticipants } from '../store/participants';

export default function MapView() {
  const pins = useTripStore(state => state.pins);
  const showToast = useToastStore(state => state.showToast);
  const currentTrip = useCurrentTrip();
  const participants = useTripParticipants();

  const [activePin, setActivePin] = useState<PinnedPoint | null>(null);
  const [isTerrainActive, setIsTerrainActive] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isNavigating, setIsNavigating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handlePinClick = (pin: PinnedPoint) => {
    setActivePin(pin);
  };

  const handleStartNavigation = () => {
    setIsNavigating(true);
    setTimeout(() => {
      showToast('Navegación GPX en tiempo real simulada iniciada.');
      setIsNavigating(false);
    }, 2000);
  };

  const filteredPins = pins.filter(pin => 
    pin.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    pin.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] -mx-6 md:-mx-16 -mb-12 relative overflow-hidden bg-brand-background">
      
      {/* Map sidebar on the left */}
      <aside className="w-full lg:w-80 bg-white border-r border-brand-primary/10 flex flex-col h-1/2 lg:h-full z-10 shadow-none">
        
        {/* Sidebar Header */}
        <div className="px-6 py-5 border-b border-brand-primary/10 shrink-0">
          <h2 className="font-serif font-black italic text-brand-primary text-xl">
            {currentTrip?.name ?? 'Tu viaje'}
          </h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-on-surface-variant/75 mt-1">
            Grupo de {participants.length}
          </p>

          {/* Search Pins inside Sidebar */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-outline w-3.5 h-3.5" />
            <input 
              type="text" 
              placeholder="Filtrar lugares..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-brand-background border border-brand-primary/10 rounded-none text-xs focus:outline-none focus:border-brand-primary/30 transition-all font-sans animate-none"
            />
          </div>
        </div>

        {/* Scrollable list of Pinned Points */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          <div className="flex items-center gap-1.5 px-2 text-brand-primary font-black text-[10px] uppercase tracking-widest">
            <MapPin className="w-4 h-4 text-brand-primary/60 fill-current" />
            <span>Puntos Guardados</span>
          </div>

          <div className="space-y-3">
            {filteredPins.map((pin) => (
              <div 
                key={pin.id}
                onClick={() => handlePinClick(pin)}
                className={`p-3 rounded-none border transition-all cursor-pointer group active:scale-[0.98] ${
                  activePin?.id === pin.id
                    ? 'bg-brand-background border-brand-primary shadow-none'
                    : 'bg-white border-brand-primary/10 shadow-none hover:border-brand-primary/30'
                }`}
                id={`pinned-card-${pin.id}`}
              >
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-none overflow-hidden shrink-0 border border-brand-primary/5">
                    <img 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102" 
                      src={pin.image} 
                      alt={pin.title} 
                    />
                  </div>
                  
                  <div className="flex flex-col justify-center overflow-hidden">
                    <h4 className="font-serif font-black italic text-sm text-brand-primary truncate leading-snug">
                      {pin.title}
                    </h4>
                    {pin.isTopPick ? (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-brand-sunset fill-brand-sunset" />
                        <span className="text-[8px] text-brand-sunset font-black uppercase tracking-widest">Recomendado</span>
                      </div>
                    ) : (
                      <span className="text-[8px] text-brand-outline font-black uppercase tracking-widest mt-1 truncate">
                        {pin.category === 'Hot Springs' ? 'Aguas Termales' : pin.category === 'Town' ? 'Pueblo' : pin.category === 'Waterfalls' ? 'Cascadas' : pin.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Invitation prompt */}
        <div className="p-4 bg-brand-background border-t border-brand-primary/10 shrink-0">
          <p className="text-[9px] text-brand-outline text-center mb-2 font-black uppercase tracking-wider">¡Invita amigos para planificar la ruta!</p>
          <button
            onClick={() => showToast('¡Enlace de invitación copiado al portapapeles!')}
            className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white py-2.5 rounded-none font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-none cursor-pointer active:scale-95"
          >
            <span>Compartir Espacio de Mapa</span>
          </button>
        </div>

      </aside>

      {/* Main Map canvas */}
      <main className="flex-1 relative h-1/2 lg:h-full overflow-hidden">
        
        {/* Satellite Map snapshot background */}
        <div className="absolute inset-0 w-full h-full shadow-inner select-none bg-zinc-800">
          <img 
            className={`w-full h-full object-cover transition-all duration-500 ${
              isTerrainActive ? 'contrast-125 saturate-150 brightness-95' : 'grayscale-[15%] contrast-105 saturate-105 brightness-100'
            }`} 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmfWb4mxRyjrhSa1irqYQvx2v4iGmKKwiZi1H-FVVI68kOAY92HzqvX8IRdDATfwPuzqvx7nIiGpz5V-4Ylj76XNT5fEtMCVfgJP2IcAprypgLW2u1BXzPIe60PJepYE6aGULw5c6lvqlRZGkKp359xNq0Z4bzXcVuSzl8DasHRC2W1TXCrei23wkD2d1SyV9U3CXLQPur7aoCJUA9sob-bIgG3KuaPR7Ac_8kSaffL75F3Srzu9WfRBGmVaSTh65VmGJfgjsI-oQC" 
            alt="Iceland Satellite Map" 
            style={{ transform: `scale(${1 + (zoomLevel - 1) * 0.2})` }}
          />
          <div className="absolute inset-0 bg-brand-primary/10 pointer-events-none" />

          {/* SVG Route overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 1000 600" preserveAspectRatio="none">
            {/* Draw curve path representing the ring road */}
            <path 
              className="route-path" 
              d="M 120,290 C 250,330 380,440 450,470 S 680,530 710,510 S 840,430 890,420" 
              fill="none" 
              stroke="#FF9F1C" 
              strokeWidth="4" 
              strokeLinecap="round"
              opacity="0.9"
              style={{ strokeDasharray: '8', animation: isNavigating ? 'dash 15s linear infinite' : 'none' }}
            />

            {/* Glowing route background line */}
            <path 
              d="M 120,290 C 250,330 380,440 450,470 S 680,530 710,510 S 840,430 890,420" 
              fill="none" 
              stroke="#003366" 
              strokeWidth="8" 
              strokeLinecap="round"
              opacity="0.35"
            />
          </svg>

          {/* Map pin markers positioned dynamically */}
          <div className="absolute inset-0 z-20 pointer-events-auto">
            {pins.map((pin) => {
              const isSelected = activePin?.id === pin.id;
              return (
                <div 
                  key={pin.id}
                  onClick={() => handlePinClick(pin)}
                  className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                  style={{ left: `${pin.coords.x / 10}%`, top: `${pin.coords.y / 6}%` }}
                >
                  <div className="relative group">
                    {/* Ring animation for top pick / selection */}
                    <span className={`absolute -inset-2.5 rounded-full bg-brand-sunset/30 ${
                      isSelected ? 'animate-ping duration-1000 opacity-100' : 'opacity-0'
                    }`} />
                    
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all ${
                      isSelected 
                        ? 'bg-brand-sunset scale-125 text-white' 
                        : 'bg-brand-primary text-brand-primary-fixed-dim hover:scale-115'
                    }`}>
                      <MapPin className="w-4.5 h-4.5 fill-current" />
                    </div>

                    {/* Tiny Floating label */}
                    <div className={`absolute bottom-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-brand-primary/95 text-white text-[9px] font-extrabold uppercase rounded-md tracking-wider shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity ${
                      isSelected ? 'opacity-100' : ''
                    }`}>
                      {pin.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Map Control Buttons */}
        <div className="absolute top-6 right-6 flex flex-col gap-3 z-30">
          <div className="flex flex-col bg-white rounded-none border border-brand-primary/10 shadow-none overflow-hidden">
            <button 
              onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.25))}
              className="p-3 hover:bg-brand-background text-brand-primary border-b border-brand-primary/10 transition-colors cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setZoomLevel(prev => Math.max(1, prev - 0.25))}
              className="p-3 hover:bg-brand-background text-brand-primary transition-colors cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={() => setIsTerrainActive(!isTerrainActive)}
            className={`p-3 rounded-none border transition-all flex items-center gap-1.5 font-bold cursor-pointer select-none shadow-none ${
              isTerrainActive 
                ? 'bg-brand-primary text-white border-brand-primary' 
                : 'bg-white text-brand-primary border-brand-primary/10 hover:bg-brand-background'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span className="text-[8px] uppercase font-black tracking-widest hidden sm:inline">Relieve</span>
          </button>

          <button 
            onClick={() => setActivePin(pins[0])}
            className="p-3 bg-white hover:bg-brand-background text-brand-primary rounded-none border border-brand-primary/10 transition-all cursor-pointer shadow-none"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>

        {/* Active Pin Detailed Overlay Card inside Map */}
        {activePin && (
          <div className="absolute top-6 left-6 max-w-sm w-full bg-white border border-brand-primary/10 rounded-none p-4 shadow-lg z-30 animate-in slide-in-from-left-4 duration-300">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[8px] font-black uppercase bg-brand-primary text-white px-2 py-0.5 rounded-none tracking-widest">
                {activePin.category === 'Hot Springs' ? 'Aguas Termales' : activePin.category === 'Town' ? 'Pueblo' : activePin.category === 'Waterfalls' ? 'Cascadas' : activePin.category}
              </span>
              <button 
                onClick={() => setActivePin(null)}
                className="text-brand-outline hover:text-brand-primary text-xs font-bold w-5 h-5 flex items-center justify-center rounded-none hover:bg-brand-background"
              >
                ✕
              </button>
            </div>
            
            <div className="flex gap-3">
              <div className="w-20 h-20 rounded-none overflow-hidden shrink-0 border border-brand-primary/5">
                <img className="w-full h-full object-cover" src={activePin.image} alt={activePin.title} />
              </div>
              <div>
                <h4 className="font-serif font-black italic text-brand-primary text-base leading-tight">
                  {activePin.title}
                </h4>
                <p className="text-xs text-brand-on-surface-variant/90 font-medium mt-1 leading-normal">
                  {activePin.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Floating Route Summary Overlay at the bottom */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-30">
          <div className="bg-white rounded-none p-5 border border-brand-primary/10 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
            
            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-brand-outline uppercase tracking-widest">Distancia Total</span>
                <span className="font-serif text-lg md:text-xl text-brand-primary font-black italic">324 km</span>
              </div>
              
              <div className="h-8 w-px bg-brand-primary/10 hidden md:block" />
              
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-brand-outline uppercase tracking-widest">Paradas Planeadas</span>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-lg md:text-xl text-brand-primary font-black italic">4</span>
                  <div className="flex -space-x-1 ml-1">
                    <div className="w-6 h-6 rounded-none border border-brand-primary/10 bg-brand-background text-[8px] font-black flex items-center justify-center shadow-none">BL</div>
                    <div className="w-6 h-6 rounded-none border border-brand-primary/10 bg-brand-background text-[8px] font-black flex items-center justify-center shadow-none">SF</div>
                    <div className="w-6 h-6 rounded-none border border-brand-primary/10 bg-brand-background text-[8px] font-black flex items-center justify-center shadow-none">BS</div>
                    <div className="w-6 h-6 rounded-none border border-brand-primary/10 bg-brand-background text-[8px] font-black flex items-center justify-center shadow-none">GL</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <button 
                onClick={handleStartNavigation}
                className="flex-1 md:flex-none px-5 py-3 bg-brand-primary text-white rounded-none font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-primary/90 active:scale-95 transition-all cursor-pointer shadow-none"
                id="map-start-nav-btn"
              >
                <Navigation className="w-4 h-4 fill-current" />
                <span>{isNavigating ? "Iniciando..." : "Iniciar Navegación"}</span>
              </button>
              
              <button
                onClick={() => showToast('Archivo GPX de la ruta descargado.')}
                className="p-3 border border-brand-primary/10 bg-white hover:bg-brand-background text-brand-primary rounded-none transition-all cursor-pointer active:scale-95"
                title="Compartir coordenadas de ruta"
              >
                <Share className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

      </main>

    </div>
  );
}
