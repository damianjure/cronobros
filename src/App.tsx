import React, { Suspense, lazy, useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import SettingsPanel from './components/SettingsPanel';
import SmartImportModal from './components/SmartImportModal';
import TripSearchResults from './components/TripSearchResults';
import HelpPanel from './components/HelpPanel';

import { ActiveTab } from './types';
import { useTripStore } from './store/tripStore';
import { useToastStore } from './store/toastStore';
import { useTripsStore } from './store/tripsStore';
import { useCurrentTrip } from './store/currentTripContext';
import { useTripParticipants } from './store/participants';
import { Mail, Check, UserPlus, X } from 'lucide-react';
import { saveImportedActivities } from './services/saveImportedActivities';
import type { ImportedActivity } from './services/smartImportCallable';

const DashboardView = lazy(() => import('./components/DashboardView'));
const ItineraryView = lazy(() => import('./components/ItineraryView'));
const LogisticsView = lazy(() => import('./components/LogisticsView'));
const MapView = lazy(() => import('./components/MapView'));
const PlacesView = lazy(() => import('./components/PlacesView'));

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const addActivity = useTripStore(state => state.addActivity);
  const addDay = useTripStore(state => state.addDay);
  const itinerary = useTripStore(state => state.itinerary);
  const showToast = useToastStore(state => state.showToast);
  const inviteMember = useTripsStore(state => state.inviteMember);
  const cancelInvite = useTripsStore(state => state.cancelInvite);
  const currentTrip = useCurrentTrip();
  const participants = useTripParticipants();

  const [showSmartImport, setShowSmartImport] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Modal states
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Invitation states
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // PR5: real pending memberships from the current trip doc (replaces the
  // local-only, never-persisted `invitedEmails` state — spec "Owner/editor
  // invites a collaborator by email" writes a real membership record via
  // `TripsRepository.inviteMember`).
  const pendingInvites = Object.values(currentTrip?.pendingMemberships ?? {}).filter(m => m.pending);

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteEmail.includes('@') || !currentTrip) return;

    void inviteMember(currentTrip.id, inviteEmail, 'editor');
    setInviteSuccess(true);
    setInviteEmail('');

    setTimeout(() => {
      setInviteSuccess(false);
    }, 2500);
  };

  const handleSmartImportConfirm = async (activities: ImportedActivity[]) => {
    setIsImporting(true);
    try {
      await saveImportedActivities({
        imported: activities,
        itinerary,
        participants,
        addActivity,
        addDay,
      });
      setActiveTab('itinerary');
      showToast(`${activities.length} ${activities.length === 1 ? 'actividad importada' : 'actividades importadas'} correctamente.`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-background text-brand-on-surface antialiased">
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onNotificationClick={() => undefined}
        onSettingsClick={() => setShowSettings(true)}
      />
      <TripSearchResults query={searchQuery} onClose={() => setSearchQuery('')} onNavigate={setActiveTab} />

      {/* Main Layout container */}
      <div className="flex min-h-screen pt-16">
        
        {/* Left Side Navigation (Desktop/Tablet) */}
        <div className="hidden md:block select-none shrink-0">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onInviteClick={() => setShowInviteModal(true)}
            onSmartImport={() => setShowSmartImport(true)}
            onHelpClick={() => setShowHelp(true)}
            isUploading={isImporting}
            uploadProgress={isImporting ? 100 : 0}
          />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 md:ml-64 p-6 md:p-12 bg-brand-background overflow-x-hidden pb-24 md:pb-12">
          <div className="max-w-6xl mx-auto">
            <Suspense fallback={<div className="py-20 text-center text-xs font-bold uppercase tracking-widest text-brand-outline">Cargando vista…</div>}>
            {activeTab === 'dashboard' && (
              <DashboardView setActiveTab={setActiveTab} />
            )}

            {activeTab === 'itinerary' && (
              <ItineraryView
                setActiveTab={setActiveTab}
                showNewEntryModal={showNewEntryModal}
                setShowNewEntryModal={setShowNewEntryModal}
              />
            )}

            {activeTab === 'places' && <PlacesView />}

            {activeTab === 'logistics' && <LogisticsView />}

            {activeTab === 'map' && <MapView />}
            </Suspense>
          </div>
        </main>

      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onInviteClick={() => setShowInviteModal(true)}
        onSmartImport={() => setShowSmartImport(true)}
        onHelpClick={() => setShowHelp(true)}
      />

      {/* Invite Friends Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-brand-primary/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-brand-outline-variant/30 animate-in zoom-in-95 duration-200 relative">
            
            <button
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 text-brand-outline hover:text-brand-primary w-8 h-8 rounded-full hover:bg-brand-surface-low transition-all text-sm font-bold flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4 text-brand-primary">
              <UserPlus className="w-5 h-5 text-brand-secondary" />
              <h3 className="font-display font-extrabold text-lg">Invitar Amigos a {currentTrip?.name ?? 'este viaje'}</h3>
            </div>

            <p className="text-xs text-brand-on-surface-variant font-semibold mb-4 leading-relaxed">
              Agrega los correos de tus amigos abajo. Recibirán un enlace para co-editar, chatear y sincronizar la logística.
            </p>

            <form onSubmit={handleSendInvite} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder="amigo@viajes.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-brand-surface-low border border-brand-outline-variant/30 rounded-xl py-3 pl-4 pr-12 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/10 font-semibold"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-brand-primary hover:bg-brand-primary-container text-brand-on-primary hover:text-brand-on-primary-container p-2 rounded-lg text-xs transition-all cursor-pointer"
                >
                  Invitar
                </button>
              </div>

              {inviteSuccess && (
                <div className="p-2.5 bg-brand-secondary-container/50 border border-brand-secondary/15 rounded-xl flex items-center gap-2 text-brand-on-secondary-container animate-bounce">
                  <Check className="w-4 h-4 text-brand-secondary shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">¡Invitación enviada con éxito!</span>
                </div>
              )}
            </form>

            {/* Pending invitations from the real trip membership record. */}
            {pendingInvites.length > 0 && (
              <div className="mt-5 border-t border-brand-outline-variant/20 pt-4">
                <h4 className="text-[10px] font-extrabold text-brand-outline uppercase tracking-wider mb-2">Invitaciones Pendientes</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                  {pendingInvites.map((membership) => (
                    <div key={membership.email} className="flex items-center gap-2 px-3 py-1.5 bg-brand-surface-low border border-brand-outline-variant/15 rounded-lg text-xs font-semibold text-brand-primary">
                      <Mail className="w-3.5 h-3.5 text-brand-outline" />
                      <span>{membership.email}</span>
                      <button type="button" onClick={() => currentTrip && void cancelInvite(currentTrip.id, membership.email)} className="ml-auto text-[9px] font-bold uppercase tracking-wide text-red-600">Cancelar</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowInviteModal(false)}
              className="w-full mt-6 py-2.5 bg-brand-primary hover:bg-brand-primary-container text-brand-on-primary hover:text-brand-on-primary-container rounded-xl font-bold text-xs transition-all cursor-pointer"
            >
              Listo
            </button>
          </div>
        </div>
      )}

      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />

      <SmartImportModal
        isOpen={showSmartImport}
        onClose={() => setShowSmartImport(false)}
        onConfirm={handleSmartImportConfirm}
      />
      <HelpPanel isOpen={showHelp} onClose={() => setShowHelp(false)} />

      <Toast />

    </div>
  );
}
