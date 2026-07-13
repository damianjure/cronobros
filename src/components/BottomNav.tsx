import React from 'react';
import { LayoutDashboard, Calendar, Plus, Map, Truck, MapPin } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onAddClick: () => void;
}

export default function BottomNav({ activeTab, setActiveTab, onAddClick }: BottomNavProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-zinc-950 border-t border-brand-outline-variant/30 flex justify-around items-center h-16 shadow-[0_-4px_20px_rgba(0,30,64,0.05)] z-50">
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
    </div>
  );
}
