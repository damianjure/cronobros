import { useState } from 'react';
import { LayoutDashboard, Calendar, Map, Truck, MapPin, MoreHorizontal, UserPlus, Sparkles, HelpCircle } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onInviteClick: () => void;
  onSmartImport: () => void;
  onHelpClick: () => void;
}

export default function BottomNav({ activeTab, setActiveTab, onInviteClick, onSmartImport, onHelpClick }: BottomNavProps) {
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {showMore && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-brand-primary/40 backdrop-blur-sm"
          onClick={() => setShowMore(false)}
        />
      )}

      {showMore && (
        <div className="md:hidden fixed bottom-16 left-0 w-full bg-brand-surface border-t border-brand-outline-variant/30 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            type="button"
            onClick={() => {
              setShowMore(false);
              onInviteClick();
            }}
            className="w-full flex items-center gap-3 px-5 py-3.5 text-left text-xs font-bold text-brand-on-surface"
          >
            <UserPlus className="w-4 h-4 text-brand-secondary" />
            Invitar Amigos
          </button>
          <button
            type="button"
            onClick={() => {
              setShowMore(false);
              onSmartImport();
            }}
            className="w-full flex items-center gap-3 px-5 py-3.5 text-left text-xs font-bold text-brand-on-surface border-t border-brand-outline-variant/15"
          >
            <Sparkles className="w-4 h-4 text-brand-sunset" />
            Importar con IA
          </button>
          <button
            type="button"
            onClick={() => {
              setShowMore(false);
              onHelpClick();
            }}
            className="w-full flex items-center gap-3 px-5 py-3.5 text-left text-xs font-bold text-brand-on-surface border-t border-brand-outline-variant/15"
          >
            <HelpCircle className="w-4 h-4 text-brand-outline" />
            Ayuda
          </button>
        </div>
      )}

    <div className="md:hidden fixed bottom-0 left-0 w-full bg-brand-surface border-t border-brand-outline-variant/30 flex justify-around items-center h-16 shadow-[0_-4px_20px_rgba(0,30,64,0.05)] z-50">
      <button
        onClick={() => setActiveTab('dashboard')}
        className={`flex flex-col items-center justify-center gap-1 cursor-pointer w-12 h-full ${
          activeTab === 'dashboard' ? 'text-brand-primary' : 'text-brand-on-surface-variant'
        }`}
        id="mobile-nav-dashboard"
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-[9px] font-semibold">Inicio</span>
      </button>

      <button
        onClick={() => setActiveTab('itinerary')}
        className={`flex flex-col items-center justify-center gap-1 cursor-pointer w-12 h-full ${
          activeTab === 'itinerary' ? 'text-brand-primary' : 'text-brand-on-surface-variant'
        }`}
        id="mobile-nav-itinerary"
      >
        <Calendar className="w-5 h-5" />
        <span className="text-[9px] font-semibold">Itinerario</span>
      </button>

      <button
        onClick={() => setActiveTab('places')}
        className={`flex flex-col items-center justify-center gap-1 cursor-pointer w-12 h-full ${
          activeTab === 'places' ? 'text-brand-primary' : 'text-brand-on-surface-variant'
        }`}
        id="mobile-nav-places"
      >
        <MapPin className="w-5 h-5" />
        <span className="text-[9px] font-semibold">Lugares</span>
      </button>

      <button
        onClick={() => setActiveTab('map')}
        className={`flex flex-col items-center justify-center gap-1 cursor-pointer w-12 h-full ${
          activeTab === 'map' ? 'text-brand-primary' : 'text-brand-on-surface-variant'
        }`}
        id="mobile-nav-map"
      >
        <Map className="w-5 h-5" />
        <span className="text-[9px] font-semibold">Mapa</span>
      </button>

      <button
        onClick={() => setActiveTab('logistics')}
        className={`flex flex-col items-center justify-center gap-1 cursor-pointer w-12 h-full ${
          activeTab === 'logistics' ? 'text-brand-primary' : 'text-brand-on-surface-variant'
        }`}
        id="mobile-nav-logistics"
      >
        <Truck className="w-5 h-5" />
        <span className="text-[9px] font-semibold">Logística</span>
      </button>

      <button
        type="button"
        onClick={() => setShowMore(current => !current)}
        aria-label="Más"
        className={`flex flex-col items-center justify-center gap-1 cursor-pointer w-12 h-full ${
          showMore ? 'text-brand-primary' : 'text-brand-on-surface-variant'
        }`}
        id="mobile-nav-more"
      >
        <MoreHorizontal className="w-5 h-5" />
        <span className="text-[9px] font-semibold">Más</span>
      </button>
    </div>
    </>
  );
}
