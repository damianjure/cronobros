import { useState } from 'react';
import { Search, Bell, Settings, LogOut, MapPinned } from 'lucide-react';
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
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary/40 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Buscar detalles del viaje..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-1.5 bg-white hover:bg-brand-surface-low border border-brand-primary/10 rounded-sm text-xs focus:outline-none focus:border-brand-primary/30 w-52 transition-colors font-sans tracking-wide"
            id="header-search-input"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotificationsDropdown(!showNotificationsDropdown);
              onNotificationClick();
            }}
            className="p-2 text-brand-on-surface-variant hover:text-brand-primary hover:bg-brand-surface-container/50 rounded-none transition-colors relative cursor-pointer active:scale-95"
            id="header-notifications-btn"
          >
            <Bell className="w-4.5 h-4.5" />
            {notifications.length > 0 && <span className="absolute right-0.5 top-0.5 min-w-4 rounded-full bg-brand-sunset px-1 text-center text-[8px] font-black text-white">{notifications.length}</span>}
          </button>

          {showNotificationsDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-brand-primary/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xl rounded-none">
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
            </div>
          )}
        </div>

        {/* Settings */}
        <button
          onClick={onSettingsClick}
          className="p-2 text-brand-on-surface-variant hover:text-brand-primary hover:bg-brand-surface-container/50 rounded-full transition-colors cursor-pointer active:scale-95"
          id="header-settings-btn"
        >
          <Settings className="w-5 h-5" />
        </button>

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
            <div className="absolute right-0 mt-2 w-56 bg-white border border-brand-primary/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xl rounded-none">
              <div className="px-4 py-2 border-b border-brand-primary/10">
                <span className="block font-bold text-xs text-brand-primary truncate">{displayName}</span>
                {user?.email && <span className="block text-[10px] text-brand-outline truncate">{user.email}</span>}
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAccountMenu(false);
                  leaveTrip();
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-xs font-semibold text-brand-on-surface hover:bg-brand-primary/5 cursor-pointer"
              >
                <MapPinned className="w-3.5 h-3.5 text-brand-on-surface-variant" />
                Mis viajes
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAccountMenu(false);
                  void signOut();
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
