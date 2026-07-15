import {
  LayoutDashboard,
  Calendar,
  Truck,
  Map as MapIcon,
  UserPlus,
  Compass,
  MapPin,
  Sparkles
} from 'lucide-react';
import { ActiveTab } from '../types';
import { useCurrentTrip } from '../store/currentTripContext';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onInviteClick: () => void;
  onSmartImport: () => void;
  isUploading: boolean;
  uploadProgress: number;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  onInviteClick,
  onSmartImport,
  isUploading,
  uploadProgress
}: SidebarProps) {
  // PR5: the real selected trip's name/member count instead of the
  // hardcoded "Verano en Islandia" fixture.
  const trip = useCurrentTrip();

  const navItems = [
    { label: 'Panel', tab: 'dashboard' as ActiveTab, icon: LayoutDashboard },
    { label: 'Itinerario', tab: 'itinerary' as ActiveTab, icon: Calendar },
    { label: 'Lugares', tab: 'places' as ActiveTab, icon: MapPin },
    { label: 'Logística', tab: 'logistics' as ActiveTab, icon: Truck },
    { label: 'Mapa', tab: 'map' as ActiveTab, icon: MapIcon },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 z-40 bg-brand-background border-r border-brand-primary/10 flex flex-col p-5 space-y-4 pt-24 shadow-none">
      {/* Trip Quick card */}
      <div className="px-4 py-4 mb-4 bg-white border border-brand-primary/10 rounded-sm shadow-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-primary flex items-center justify-center text-white shrink-0">
            <Compass className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="overflow-hidden">
            <h3 className="font-serif font-black text-sm text-brand-primary truncate leading-tight italic">
              {trip?.name ?? 'Viaje'}
            </h3>
            <p className="font-sans text-[10px] uppercase tracking-wider text-brand-on-surface-variant/70 font-semibold mt-0.5">
              {trip?.memberUids.length ?? 0} Huéspedes
            </p>
          </div>
        </div>
        <button
          onClick={onInviteClick}
          className="w-full mt-3.5 py-2 px-3 rounded-none bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          id="sidebar-invite-btn"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Invitar Amigos</span>
        </button>
      </div>

      {/* Main navigation links */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`w-full flex items-center gap-3 p-3 rounded-none font-sans font-bold text-xs uppercase tracking-[0.12em] transition-all cursor-pointer active:scale-98 ${
                isActive
                  ? 'bg-brand-primary text-white font-bold'
                  : 'text-brand-on-surface-variant/85 hover:bg-brand-primary/5 hover:text-brand-primary'
              }`}
              id={`sidebar-nav-${item.tab}`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-brand-primary/60'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Smart Import Widget */}
      <div className="bg-brand-primary text-white p-3.5 rounded-none relative shadow-none border border-brand-primary/10 mt-auto">
        <h4 className="font-serif font-black italic text-[11px] mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
          <Compass className="w-4 h-4 text-white/80" />
          <span>Sincronizar con IA</span>
        </h4>
        <p className="text-[10px] text-white/80 font-medium leading-relaxed mb-3">
          Pegá texto o subí un PDF o imagen y revisá las actividades antes de guardarlas.
        </p>

        {isUploading ? (
          <div className="bg-white/10 p-2 border border-white/10 mb-1.5 animate-pulse">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-sunset animate-ping" />
                <span>Analizando...</span>
              </span>
              <span className="text-[8px] text-white/80 font-bold">{uploadProgress}%</span>
            </div>
            <div className="w-full h-1 bg-white/20 overflow-hidden">
              <div className="h-full bg-brand-sunset transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onSmartImport}
            className="border border-dashed border-white/25 hover:border-white/50 bg-white/5 hover:bg-white/10 p-2.5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1"
          >
            <Sparkles className="w-4 h-4 text-white/80" />
            <span className="text-[9px] font-bold text-white/95">Importar con IA</span>
          </button>
        )}
      </div>

    </aside>
  );
}
