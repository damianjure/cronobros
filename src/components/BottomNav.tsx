import { useEffect, useRef, useState } from 'react';
import { UserPlus, Sparkles, HelpCircle } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onInviteClick: () => void;
  onSmartImport: () => void;
  onHelpClick: () => void;
}

interface NavDestination {
  tab: ActiveTab;
  label: string;
  icon: string;
}

const DESTINATIONS: NavDestination[] = [
  { tab: 'dashboard', label: 'Inicio', icon: 'dashboard' },
  { tab: 'itinerary', label: 'Itinerario', icon: 'calendar_month' },
  { tab: 'places', label: 'Lugares', icon: 'location_on' },
  { tab: 'map', label: 'Mapa', icon: 'map' },
  { tab: 'logistics', label: 'Logística', icon: 'local_shipping' },
];

// Index of the trailing "Más" tab — activating it opens the actions sheet
// instead of navigating, so it must never become the bar's active tab.
const MORE_INDEX = DESTINATIONS.length;

export default function BottomNav({ activeTab, setActiveTab, onInviteClick, onSmartImport, onHelpClick }: BottomNavProps) {
  const [showMore, setShowMore] = useState(false);
  const barRef = useRef<HTMLElement>(null);

  const activeIndex = Math.max(
    0,
    DESTINATIONS.findIndex(destination => destination.tab === activeTab),
  );

  // md-navigation-bar fires a non-standard custom event, which React doesn't
  // map to an `on*` prop — bind it manually. On the "Más" tab, reopen the
  // sheet and snap activeIndex back to the real destination.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const handleActivated = (event: Event) => {
      const index = (event as CustomEvent<{ activeIndex: number }>).detail.activeIndex;
      if (index === MORE_INDEX) {
        setShowMore(current => !current);
        (bar as HTMLElement & { activeIndex: number }).activeIndex = activeIndex;
        return;
      }
      setShowMore(false);
      setActiveTab(DESTINATIONS[index].tab);
    };

    bar.addEventListener('navigation-bar-activated', handleActivated);
    return () => bar.removeEventListener('navigation-bar-activated', handleActivated);
  }, [activeIndex, setActiveTab]);

  // Keep the bar in sync when the tab changes from elsewhere (header nav, etc.).
  useEffect(() => {
    const bar = barRef.current as (HTMLElement & { activeIndex: number }) | null;
    if (bar) bar.activeIndex = activeIndex;
  }, [activeIndex]);

  return (
    <>
      {showMore && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-brand-primary/40 backdrop-blur-sm"
          onClick={() => setShowMore(false)}
        />
      )}

      {showMore && (
        <div className="md:hidden fixed bottom-20 left-0 w-full bg-brand-surface border-t border-brand-outline-variant/30 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
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

      <md-navigation-bar
        ref={barRef}
        active-index={activeIndex}
        className="md:hidden fixed bottom-0 left-0 w-full z-50"
      >
        {DESTINATIONS.map((destination, index) => (
          <md-navigation-tab
            key={destination.tab}
            label={destination.label}
            active={index === activeIndex}
            data-testid={`mobile-nav-${destination.tab}`}
          >
            <md-icon slot="active-icon">{destination.icon}</md-icon>
            <md-icon slot="inactive-icon">{destination.icon}</md-icon>
          </md-navigation-tab>
        ))}
        <md-navigation-tab label="Más" data-testid="mobile-nav-more">
          <md-icon slot="active-icon">more_horiz</md-icon>
          <md-icon slot="inactive-icon">more_horiz</md-icon>
        </md-navigation-tab>
      </md-navigation-bar>
    </>
  );
}
