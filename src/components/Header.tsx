import { useState } from 'react';
import { Search, LogOut, MapPinned } from 'lucide-react';
import { ActiveTab } from '../types';
import { useAuthStore } from '../store/authStore';
import { useTripStore } from '../store/tripStore';
import { useCurrentTrip } from '../store/currentTripContext';
import { useTripNavigation } from '../store/tripNavigation';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onNotificationClick: () => void;
  onSettingsClick: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onNotificationClick,
  onSettingsClick,
}: HeaderProps) {
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const user = useAuthStore(state => state.user);
  const signOut = useAuthStore(state => state.signOut);
  const criticalEvents = useTripStore(state => state.criticalEvents);
  const currentTrip = useCurrentTrip();
  const { leaveTrip } = useTripNavigation();
  const displayName = user?.displayName ?? user?.email ?? 'Viajero';
  const pendingInvites = Object.values(currentTrip?.pendingMemberships ?? {}).filter(invite => invite.pending);
  const notifications = [
    ...criticalEvents.map(event => ({
      id: `event-${event.id}`,
      title: event.title,
      detail: `${event.targetDate || 'Sin fecha'} · ${event.targetTimeStr}${event.warningMessage ? ` · ${event.warningMessage}` : ''}`,
    })),
    ...pendingInvites.map(invite => ({ id: `invite-${invite.email}`, title: 'Invitación pendiente', detail: `${invite.email} · ${invite.role}` })),
  ].slice(0, 8);

  const navItems: { label: string; tab: ActiveTab }[] = [
    { label: 'Panel', tab: 'dashboard' },
    { label: 'Itinerario', tab: 'itinerary' },
    { label: 'Lugares', tab: 'places' },
    { label: 'Logística', tab: 'logistics' },
    { label: 'Mapa', tab: 'map' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-16 h-16 bg-brand-background/95 backdrop-blur-md border-b border-brand-primary/10 shadow-none">
      {/* Brand logo */}
      <div className="flex items-center gap-10">
        <span 
          onClick={() => setActiveTab('dashboard')} 
          className="font-serif text-2xl font-black italic text-brand-primary cursor-pointer select-none tracking-tight hover:opacity-90 active:scale-98 transition-transform"
          id="header-brand-logo"
        >
          Cronobros
        </span>

        {/* Center navigation links */}
        <div className="hidden md:flex gap-8 items-center">
          {navItems.map((item) => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`font-sans font-bold text-xs uppercase tracking-[0.15em] transition-all pb-1.5 hover:text-brand-primary relative cursor-pointer ${
                activeTab === item.tab
                  ? 'text-brand-primary'
                  : 'text-brand-on-surface-variant/75'
              }`}
              id={`header-nav-${item.tab}`}
            >
              {item.label}
              {activeTab === item.tab && (
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-brand-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right side icons */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden sm:block w-52">
          <md-outlined-text-field
            placeholder="Buscar detalles del viaje..."
            value={searchQuery}
            onInput={(e) => setSearchQuery(e.currentTarget.value)}
            id="header-search-input"
            style={{ width: '100%', '--md-outlined-text-field-container-shape': '4px' } as React.CSSProperties}
          >
            <Search slot="leading-icon" className="w-3.5 h-3.5" />
          </md-outlined-text-field>
        </div>

        {/* Notifications */}
        <div className="relative">
          <md-icon-button
            onClick={() => {
              setShowNotificationsDropdown(!showNotificationsDropdown);
              onNotificationClick();
            }}
            aria-label="Notificaciones"
            id="header-notifications-btn"
          >
            <md-icon>notifications</md-icon>
          </md-icon-button>
          {notifications.length > 0 && <span className="absolute right-0.5 top-0.5 min-w-4 rounded-full bg-brand-sunset px-1 text-center text-[8px] font-black text-white pointer-events-none">{notifications.length}</span>}

          {showNotificationsDropdown && (
            <md-elevated-card style={{ display: 'block' }} className="absolute right-0 mt-2 w-80 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-brand-primary/10 flex justify-between items-center">
                <span className="font-bold text-[10px] text-brand-primary uppercase tracking-widest">Alertas y Actualizaciones</span>
              </div>
              {notifications.length === 0 ? <div className="px-4 py-6 text-center">
                <p className="text-xs font-bold text-brand-primary font-serif italic">Sin novedades</p>
                <p className="text-[10px] text-brand-outline mt-1">Las actualizaciones reales del viaje aparecerán aquí.</p>
              </div> : <div className="max-h-80 overflow-y-auto">
                {notifications.map(notification => (
                  <button key={notification.id} type="button" onClick={() => { setActiveTab('dashboard'); setShowNotificationsDropdown(false); }} className="block w-full border-b border-brand-primary/5 px-4 py-3 text-left hover:bg-brand-primary/5">
                    <strong className="block text-xs text-brand-primary">{notification.title}</strong>
                    <span className="mt-0.5 block text-[10px] text-brand-outline">{notification.detail}</span>
                  </button>
                ))}
              </div>}
            </md-elevated-card>
          )}
        </div>

        {/* Settings */}
        <md-icon-button onClick={onSettingsClick} aria-label="Configuración" id="header-settings-btn">
          <md-icon>settings</md-icon>
        </md-icon-button>

        {/* User Profile avatar + account menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="w-8 h-8 rounded-full bg-brand-primary-fixed overflow-hidden border border-brand-outline-variant select-none cursor-pointer hover:opacity-90 active:scale-95 transition-all flex items-center justify-center text-[10px] font-black text-brand-primary"
            aria-label={displayName}
            title={displayName}
            id="header-account-menu-btn"
          >
            {user?.photoURL ? (
              <img className="w-full h-full object-cover" src={user.photoURL} alt={displayName} />
            ) : (
              displayName.charAt(0).toUpperCase()
            )}
          </button>

          {showAccountMenu && (
            <md-elevated-card style={{ display: 'block' }} className="absolute right-0 mt-2 w-56 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-brand-primary/10">
                <span className="block font-bold text-xs text-brand-primary truncate">{displayName}</span>
                {user?.email && <span className="block text-[10px] text-brand-outline truncate">{user.email}</span>}
              </div>
              <md-text-button
                onClick={() => {
                  setShowAccountMenu(false);
                  leaveTrip();
                }}
                style={{ width: '100%', '--md-text-button-label-text-size': '0.75rem' } as React.CSSProperties}
              >
                <MapPinned slot="icon" className="w-3.5 h-3.5" />
                Mis viajes
              </md-text-button>
              <md-text-button
                onClick={() => {
                  setShowAccountMenu(false);
                  void signOut();
                }}
                style={
                  {
                    width: '100%',
                    '--md-sys-color-primary': 'var(--md-sys-color-error)',
                    '--md-text-button-label-text-size': '0.75rem',
                  } as React.CSSProperties
                }
              >
                <LogOut slot="icon" className="w-3.5 h-3.5" />
                Cerrar sesión
              </md-text-button>
            </md-elevated-card>
          )}
        </div>
      </div>
    </nav>
  );
}
