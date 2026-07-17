import { useEffect, useRef } from 'react';
import { UserPlus, HelpCircle, Compass, Sparkles } from 'lucide-react';
import { ActiveTab } from '../types';
import { useCurrentTrip } from '../store/currentTripContext';
import { useTripPendingInvitesCount } from '../store/participants';

interface NavDestination {
  label: string;
  tab: ActiveTab;
  icon: string;
}

const DESTINATIONS: NavDestination[] = [
  { label: 'Panel', tab: 'dashboard', icon: 'dashboard' },
  { label: 'Itinerario', tab: 'itinerary', icon: 'calendar_month' },
  { label: 'Lugares', tab: 'places', icon: 'location_on' },
  { label: 'Logística', tab: 'logistics', icon: 'local_shipping' },
  { label: 'Mapa', tab: 'map', icon: 'map' },
];

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onInviteClick: () => void;
  onSmartImport: () => void;
  onHelpClick: () => void;
  isUploading: boolean;
  uploadProgress: number;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  onInviteClick,
  onSmartImport,
  onHelpClick,
  isUploading,
  uploadProgress
}: SidebarProps) {
  // PR5: the real selected trip's name/member count instead of the
  // hardcoded "Verano en Islandia" fixture.
  const trip = useCurrentTrip();
  const pendingInvitesCount = useTripPendingInvitesCount();
  const railRef = useRef<HTMLDivElement>(null);

  // md-navigation-tab has no standalone "rail" wrapper in @material/web (only
  // md-navigation-bar exists). navigation-tab-interaction is a non-standard
  // custom event, so React's onClick (which only ever fires for native
  // 'click') never sees it — same gotcha as BottomNav's
  // navigation-bar-activated. Bind it manually via ref; it bubbles+composed,
  // so one delegated listener on the container catches every tab.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const handleInteraction = (event: Event) => {
      const tab = (event as CustomEvent<{ state: HTMLElement }>).detail.state.dataset.tab as
        | ActiveTab
        | undefined;
      if (tab) setActiveTab(tab);
    };

    rail.addEventListener('navigation-tab-interaction', handleInteraction);
    return () => rail.removeEventListener('navigation-tab-interaction', handleInteraction);
  }, [setActiveTab]);

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 z-40 bg-brand-background border-r border-brand-primary/10 flex flex-col p-5 space-y-4 pt-24 shadow-none">
      {/* Trip Quick card */}
      <md-elevated-card style={{ display: 'block', padding: '16px', marginBottom: '1rem' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-primary flex items-center justify-center text-brand-on-primary shrink-0 rounded-full">
            <Compass className="w-4.5 h-4.5 text-brand-on-primary" />
          </div>
          <div className="overflow-hidden">
            <h3 className="font-sans font-black text-sm text-brand-primary truncate leading-tight">
              {trip?.name ?? 'Viaje'}
            </h3>
            <p className="font-sans text-[10px] uppercase tracking-wider text-brand-on-surface-variant/70 font-semibold mt-0.5">
              {trip?.memberUids.length ?? 0} Huéspedes
              {pendingInvitesCount > 0 && ` · +${pendingInvitesCount} invitación pendiente`}
            </p>
          </div>
        </div>
        <md-filled-button
          onClick={onInviteClick}
          style={{ width: '100%', marginTop: '14px' }}
          id="sidebar-invite-btn"
        >
          <UserPlus slot="icon" className="w-3.5 h-3.5" />
          Invitar Amigos
        </md-filled-button>
      </md-elevated-card>

      {/* Main navigation rail (md-navigation-rail has no component in
          @material/web — built from the same md-navigation-tab as BottomNav,
          laid out vertically) */}
      <div
        ref={railRef}
        role="tablist"
        aria-label="Navegación principal"
        className="flex-1 flex flex-col"
      >
        {DESTINATIONS.map(destination => (
          <md-navigation-tab
            key={destination.tab}
            label={destination.label}
            active={activeTab === destination.tab}
            data-tab={destination.tab}
            id={`sidebar-nav-${destination.tab}`}
          >
            <md-icon slot="active-icon">{destination.icon}</md-icon>
            <md-icon slot="inactive-icon">{destination.icon}</md-icon>
          </md-navigation-tab>
        ))}
      </div>

      {/* Smart Import Widget */}
      <md-filled-card
        style={{
          display: 'block',
          padding: '14px',
          marginTop: 'auto',
          '--md-filled-card-container-color': 'var(--md-sys-color-primary-container)',
          color: 'var(--md-sys-color-on-primary-container)',
        } as React.CSSProperties}
      >
        <h4 className="font-sans font-black text-[11px] mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
          <Compass className="w-4 h-4" />
          <span>Sincronizar con IA</span>
        </h4>
        <p className="text-[10px] font-medium leading-relaxed mb-3 opacity-80">
          Pegá texto o subí un PDF o imagen y revisá las actividades antes de guardarlas.
        </p>

        {isUploading ? (
          <div className="bg-black/5 p-2 mb-1.5 animate-pulse rounded">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-sunset animate-ping" />
                <span>Analizando...</span>
              </span>
              <span className="text-[8px] opacity-80 font-bold">{uploadProgress}%</span>
            </div>
            <div className="w-full h-1 bg-black/10 overflow-hidden rounded">
              <div className="h-full bg-brand-sunset transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        ) : (
          <md-outlined-button onClick={onSmartImport} style={{ width: '100%' }}>
            <Sparkles slot="icon" className="w-4 h-4" />
            Importar con IA
          </md-outlined-button>
        )}
      </md-filled-card>

      <md-text-button onClick={onHelpClick} style={{ width: '100%' }}>
        <HelpCircle slot="icon" className="h-3.5 w-3.5" />
        Ayuda
      </md-text-button>
    </aside>
  );
}
