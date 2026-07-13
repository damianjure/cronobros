import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import DashboardView from './components/DashboardView';
import ItineraryView from './components/ItineraryView';
import LogisticsView from './components/LogisticsView';
import MapView from './components/MapView';
import PlacesView from './components/PlacesView';

import { ActiveTab, ItineraryDay, ChatMessage, PendingPlace, PinnedPoint, ItineraryActivity } from './types';
import { initialItinerary, initialChatMessages, pinnedPoints } from './data';
import { Mail, Check, UserPlus, X } from 'lucide-react';

const initialFriends = [
  { id: 'alex', name: 'Alex Thorne', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4B5JPVpAuZzSoy3FOKnNgVzKzEXrZIk7UFw2O17ZbZ4SrNyqWuSDoPC39FZecjNMatQ4G4uhMHBavH8Or4Y_bMvbp6C8ow_I3MyoUbypn6bmancOLfJnbDOAHJBRbDJN-w94UqC0D8FSvrT6hP2Xg8LVOgF74_R9zOcZqkmSnGyt4OYBBt3Tj0YXhKICvDl8ZqncCGvfUBScEKQL2TcsOn1KYLe65ApjYQjol-ng4dRjrQDQ45DQgNIrY2ASp__0tOo1WXy1wI1kq' },
  { id: 'sarah', name: 'Sarah Miller', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfFQUgXGvEuDKvhZO0ButMHU_vysIYP7RkgQDECitwhIjeKNPxmnN1rqaSfnQ8TecNnu6Q9aCBg4daAI559ycoyReMPHCmO5QxkBvyNOB8Tizo1RC2OpDCVLouElZEdvhqHP4cpj-n5jw7GXqY8yeothMjnMQeHZeev1Gywxjn8n_yVtFXiHYQiVICXdf3bRCg8wlTqSw_oEMK0aMTiIu8PQTIO_HsKpkDm3w-Bj2Qdst45JVV7sKssASFgH-SYx1kU0BTFo5qVPLZ' },
  { id: 'james', name: 'James', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHjNJ4pnfvzfQ0YItd7YHU2x_L7AASDOE3HpbZvqrrwCbWgzGvwqMxFnSzl32YcK4JvjOl3zWq0Urs9TVYlhIGvKIaMrpVaTfAqF_d-xANEw5e_UfOPB53jcOYRYznBc9tyB9w3BUWCi6DcB_I2OPw71g25WOoMroD84ISG10pdoh0ouLDp-0o_BjV5JlcKzGjxUxj8j-69cm1nFsu4_zU1rG57lUYwuZr_Zp29F6tZb_P9d8dCDGT1mb4-0MKvtfPC1ccjSyKZebv' },
  { id: 'maya', name: 'Maya', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBASr24FgG3vzWTsDBsDfYRpGRsrizvm6jVMGJpXnT_osDk3Xh2_4Pwsjb68JkpjHPd6dOtI9GYaAOI45_NtWBgPEUuVc21ouwj19OF4eehIMGE6ebp7gDNA9ZGeg8u4aiQU8_c--C9p360niDkPVg0TF_aVIH0gHiL7N4gkL1kJW_dh7ZdJn2vE8FQbY_g_bvjdTfxO-hXRARP-ZnjO-Wvc0o1WePDjEwaOboQLUaJ8O90ngK347qcjrwDkVs2ox-Z2QyjWdwH2p8c' },
  { id: 'sofia', name: 'Sofía', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_scvakiKbrrrRI_-Pm2qEKrgr42w-Zxnzfo1elMxW-rblu18TPbSGvrqUpslnCSJswJyezA3RB93Bj4MhSFwkTgD6OaZF2UOycSOQEP-ZGbSZYR2dUHB83651Y26BzJMxAGj0Je8w8OxXBsB-12sjBlVwtvZT2qO-9oZEYUt8JNzg0niZMMZTdvTaDa-hT-wzSCqzNgxoCv2rh_hg1LScTbdhGOY2CT77m02PSoTFnbTkdEtPfPofPPifuj0OfUpGXwwr-s10U-54' },
  { id: 'mateo', name: 'Mateo', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [itinerary, setItinerary] = useState<ItineraryDay[]>(initialItinerary);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Shared Map Pins & Pending places states
  const [pins, setPins] = useState<PinnedPoint[]>(pinnedPoints);
  const [pendingPlaces, setPendingPlaces] = useState<PendingPlace[]>([
    {
      id: 'pending-1',
      title: 'Restaurante Dill',
      category: 'Gastronomía',
      description: 'Alta cocina nórdica galardonada. Menú degustación con ingredientes hiperlocales de Islandia.',
      location: 'Reikiavik',
      people: ['Alex Thorne', 'Sarah Miller', 'James', 'Maya', 'Sofía', 'Mateo']
    },
    {
      id: 'pending-2',
      title: 'Caminata Volcánica Fagradalsfjall',
      category: 'Aventura',
      description: 'Caminata para explorar los campos de lava recientes en la península de Reykjanes.',
      location: 'Grindavík',
      people: ['Alex Thorne', 'James', 'Mateo']
    },
    {
      id: 'pending-3',
      title: 'Río Termal Reykjadalur',
      category: 'Relajación',
      description: 'Báñate en un río de agua caliente natural que fluye por un hermoso valle verde.',
      location: 'Hveragerði',
      people: ['Sarah Miller', 'Maya', 'Sofía', 'Mateo']
    }
  ]);

  // Smart Import Sidebar simulation states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Modal states
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // Invitation states
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) return;

    setInvitedEmails(prev => [...prev, inviteEmail]);
    setInviteSuccess(true);
    setInviteEmail('');
    
    setTimeout(() => {
      setInviteSuccess(false);
    }, 2500);
  };

  // Simulate Smart Import PDF Parse (triggered from Sidebar)
  const handleSmartImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      setUploadProgress(10);
      
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              const importedActivity: ItineraryActivity = {
                id: `act-import-${Date.now()}`,
                time: '08:15 AM',
                type: 'Adventure',
                title: 'Llegada de Vuelo Analizada (KEF)',
                description: 'El vuelo FI-204 de Boston aterrizó a tiempo. Equipaje recogido en la banda 4. Recogida directa de Land Rover Defender alquilado.',
                location: 'Aeropuerto Internacional de Keflavík',
                status: 'Smart Imported',
                people: ['Alex Thorne', 'Sarah Miller', 'James', 'Maya', 'Sofía', 'Mateo']
              };

              setItinerary(prevItinerary => 
                prevItinerary.map(day => {
                  if (day.id === 'day-1') {
                    return {
                      ...day,
                      activities: [importedActivity, ...day.activities]
                    };
                  }
                  return day;
                })
              );

              setIsUploading(false);
              setUploadProgress(0);
              alert("¡Importación inteligente de boleto completada con éxito! Actividad añadida al Día 1.");
            }, 800);
            return 100;
          }
          return prev + 15;
        });
      }, 150);
    }
  };

  // Approve place and add to Itinerary and Map
  const handleApprovePlace = (placeId: string, dayId: string) => {
    const place = pendingPlaces.find(p => p.id === placeId);
    if (!place) return;

    const mapCategoryToActivityType = (cat: string): 'Relaxation' | 'Dining' | 'Sightseeing' | 'Adventure' | 'Accommodation' => {
      switch (cat) {
        case 'Relajación': return 'Relaxation';
        case 'Gastronomía': return 'Dining';
        case 'Aventura': return 'Adventure';
        case 'Alojamiento': return 'Accommodation';
        default: return 'Sightseeing';
      }
    };

    const newActivity: ItineraryActivity = {
      id: `act-${Date.now()}`,
      time: '02:00 PM', // Default/estimated time
      type: mapCategoryToActivityType(place.category),
      title: place.title,
      description: place.description,
      location: place.location,
      status: 'Aprobado',
      people: place.people || ['Alex Thorne', 'Sarah Miller', 'James', 'Maya', 'Sofía', 'Mateo']
    };

    // 1. Add to itinerary
    setItinerary(prev => prev.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          activities: [...day.activities, newActivity]
        };
      }
      return day;
    }));

    // 2. Add to Map pins
    const newPin: PinnedPoint = {
      id: `pin-${Date.now()}`,
      title: place.title,
      description: place.description,
      category: place.category,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8kbbAVSGnOTZjuDOJbgKxvomdkFv5dlPjxQlL8K4RSkPMJynCQ4XkYX-8nN_ieyYhjFAimCZlGiwUXYJfrIfR8xfU4_5aR9W6jAP36Qtk_Tvi0IZaTtS6mGiabINpPHyHmdVY6G6smwzHqNZGww_PiqileoStp0VHXbxZzzHkQbhDpOLVxIelUlB_IhB4m6m-nTXBkqaE79Wyy9pcbbcQrfpTJ_iOzrVMtd_4wN1Wrnk1_kd2hXCvD1to7uznxceO9gusiK382DnK',
      coords: {
        x: 200 + Math.random() * 500,
        y: 200 + Math.random() * 300
      }
    };
    setPins(prev => [...prev, newPin]);

    // 3. Remove from pending list
    setPendingPlaces(prev => prev.filter(p => p.id !== placeId));
    alert(`¡"${place.title}" ha sido aprobado! Se agregó al itinerario de ese día y como punto interactivo en el mapa.`);
  };

  return (
    <div className="min-h-screen bg-brand-background dark:bg-zinc-950 text-brand-on-surface antialiased">
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onNotificationClick={() => console.log('Centro de notificaciones abierto')}
        onSettingsClick={() => alert("¡Configuración cambiada! Parámetros de modo oscuro e idioma cargados en segundo plano.")}
      />

      {/* Main Layout container */}
      <div className="flex min-h-screen pt-16">
        
        {/* Left Side Navigation (Desktop/Tablet) */}
        <div className="hidden md:block select-none shrink-0">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onInviteClick={() => setShowInviteModal(true)}
            onSmartImport={handleSmartImport}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
          />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 md:ml-64 p-6 md:p-12 bg-brand-background dark:bg-zinc-950 overflow-x-hidden pb-24 md:pb-12">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                chatMessages={chatMessages}
                setChatMessages={setChatMessages}
                setActiveTab={setActiveTab}
              />
            )}
            
            {activeTab === 'itinerary' && (
              <ItineraryView
                itinerary={itinerary}
                setItinerary={setItinerary}
                setActiveTab={setActiveTab}
                showNewEntryModal={showNewEntryModal}
                setShowNewEntryModal={setShowNewEntryModal}
              />
            )}

            {activeTab === 'places' && (
              <PlacesView
                pendingPlaces={pendingPlaces}
                setPendingPlaces={setPendingPlaces}
                onApprovePlace={handleApprovePlace}
                itinerary={itinerary}
                friends={initialFriends}
              />
            )}

            {activeTab === 'logistics' && (
              <LogisticsView />
            )}

            {activeTab === 'map' && (
              <MapView pins={pins} setPins={setPins} />
            )}
          </div>
        </main>

      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddClick={() => {
          setActiveTab('itinerary');
          setShowNewEntryModal(true);
        }}
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
              <h3 className="font-display font-extrabold text-lg">Invitar Amigos a Verano en Islandia</h3>
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
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-brand-primary hover:bg-brand-primary-container text-white p-2 rounded-lg text-xs transition-all cursor-pointer"
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

            {/* Invited friends list */}
            {invitedEmails.length > 0 && (
              <div className="mt-5 border-t border-brand-outline-variant/20 pt-4">
                <h4 className="text-[10px] font-extrabold text-brand-outline uppercase tracking-wider mb-2">Invitaciones Pendientes</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                  {invitedEmails.map((email, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-brand-surface-low border border-brand-outline-variant/15 rounded-lg text-xs font-semibold text-brand-primary">
                      <Mail className="w-3.5 h-3.5 text-brand-outline" />
                      <span>{email}</span>
                      <span className="text-[9px] text-brand-outline font-bold uppercase tracking-wide ml-auto">Pendiente</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowInviteModal(false)}
              className="w-full mt-6 py-2.5 bg-brand-primary hover:bg-brand-primary-container text-white rounded-xl font-bold text-xs transition-all cursor-pointer"
            >
              Listo
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
