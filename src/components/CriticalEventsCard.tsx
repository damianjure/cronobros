import { useState, useEffect, type CSSProperties } from 'react';
import {
  Plane,
  Key,
  Car,
  MapPin,
  Clock,
  Activity,
  AlertTriangle,
  Locate,
  RefreshCw,
  Settings2,
} from 'lucide-react';
import { calculateDistanceInKm } from '../utils/geo';
import { calculateCountdown } from '../utils/date';
import { useTripStore } from '../store/tripStore';
import { useAuthStore } from '../store/authStore';
import { useCurrentTrip } from '../store/currentTripContext';
import CriticalEventsManager from './CriticalEventsManager';

export default function CriticalEventsCard() {
  const criticalEvents = useTripStore(state => state.criticalEvents);
  const upsertCriticalEvent = useTripStore(state => state.upsertCriticalEvent);
  const deleteCriticalEvent = useTripStore(state => state.deleteCriticalEvent);
  const user = useAuthStore(state => state.user);
  const currentTrip = useCurrentTrip();
  const role = user ? currentTrip?.members[user.uid] : undefined;
  const canManage = role === 'owner' || role === 'editor';
  const [showManager, setShowManager] = useState(false);
  const presets = criticalEvents.map(event => ({
    id: event.id,
    name: event.title,
    label: event.locationName,
    ...event.coords,
  }));

  // Until real GPS is requested, use a persisted event as a manual reference.
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [coordsSource, setCoordsSource] = useState<'manual' | 'gps'>('manual');
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isGpsLoading, setIsGpsLoading] = useState(false);

  // Time-remaining count state
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, activeTarget: '' });

  // 1. Identify which is the closest critical event based on user's current coordinates
  const effectiveCoords = currentCoords ?? criticalEvents[0]?.coords ?? null;

  const getClosestEvent = () => {
    if (!effectiveCoords || criticalEvents.length === 0) return null;

    let closestEvent = criticalEvents[0];
    let minDistance = Infinity;

    criticalEvents.forEach(ev => {
      const dist = calculateDistanceInKm(
        effectiveCoords.lat,
        effectiveCoords.lon,
        ev.coords.lat,
        ev.coords.lon,
      );
      if (dist < minDistance) {
        minDistance = dist;
        closestEvent = ev;
      }
    });

    return { event: closestEvent, distance: minDistance };
  };

  const closestEvent = getClosestEvent();
  const activeEvent = closestEvent?.event ?? null;
  const distance = closestEvent?.distance ?? 0;

  // 2. Fetch real GPS Geolocation from browser
  const handleGetRealGps = () => {
    if (!navigator.geolocation) {
      setGpsError('La geolocalización no es compatible con tu navegador.');
      return;
    }

    setIsGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentCoords({ lat: latitude, lon: longitude });
        setCoordsSource('gps');
        setIsGpsLoading(false);
      },
      (error) => {
        setIsGpsLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsError('Permiso denegado. Asegúrate de permitir el GPS en tu navegador.');
            break;
          case error.POSITION_UNAVAILABLE:
            setGpsError('La ubicación GPS no está disponible.');
            break;
          case error.TIMEOUT:
            setGpsError('Se agotó el tiempo de espera para obtener la ubicación.');
            break;
          default:
            setGpsError('Error desconocido al obtener la geolocalización.');
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // 3. Dynamic countdown setup
  // Calculates the remaining time relative to the target hour on the current day
  useEffect(() => {
    if (!activeEvent) {
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0, activeTarget: '' });
      return;
    }

    const updateCountdown = () => {
      const { hours, minutes, seconds, targetDate } = calculateCountdown(
        activeEvent.targetTimeStr,
        new Date(),
        activeEvent.targetDate,
      );

      setTimeLeft({
        hours,
        minutes,
        seconds,
        activeTarget: `${targetDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })} a las ${activeEvent.targetTimeStr} HS`
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [activeEvent]);

  // Rough travel-time estimate using an 80 km/h average.
  const estTravelTimeMin = Math.round((distance / 80) * 60);
  const formattedEstTime = estTravelTimeMin > 60 
    ? `${Math.floor(estTravelTimeMin / 60)}h ${estTravelTimeMin % 60}m`
    : `${estTravelTimeMin} mins`;

  // Get matching icon based on event type
  const getEventIcon = () => {
    switch (activeEvent?.type) {
      case 'flight':
        return <Plane className="w-6 h-6 text-brand-sunset stroke-[2.5px]" />;
      case 'car':
        return <Car className="w-6 h-6 text-brand-sunset stroke-[2.5px]" />;
      default:
        return <Key className="w-6 h-6 text-brand-sunset stroke-[2.5px]" />;
    }
  };

  if (!activeEvent || !effectiveCoords) {
    return (
      <>
        <md-elevated-card
          style={{ display: 'block' } as CSSProperties}
          className="p-6 relative overflow-hidden"
          id="critical-events-card"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-brand-sunset" />
          <div className="flex items-start gap-3">
            <div className="p-3 bg-brand-background border border-brand-primary/10">
              <Clock className="w-5 h-5 text-brand-outline" />
            </div>
            <div>
              <h3 className="font-serif font-black italic text-brand-primary text-xl">
                Sin eventos críticos
              </h3>
              <p className="text-xs text-brand-on-surface-variant mt-1">
                Este viaje todavía no tiene horarios impostergables cargados.
              </p>
            </div>
            {canManage && (
              <md-outlined-button type="button" onClick={() => setShowManager(true)} className="ml-auto">
                Agregar evento crítico
              </md-outlined-button>
            )}
          </div>
        </md-elevated-card>
        {showManager && (
          <CriticalEventsManager
            events={criticalEvents}
            onSave={upsertCriticalEvent}
            onDelete={deleteCriticalEvent}
            onClose={() => setShowManager(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <md-elevated-card
        style={{ display: 'flex' } as CSSProperties}
        className="p-5 md:p-6 flex-col xl:flex-row gap-6 relative overflow-hidden"
        id="critical-events-card"
      >

      {/* Absolute Decorative Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-brand-sunset" />

      {/* Main Content Info Column */}
      <div className="flex-1 space-y-4">
        
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-brand-primary text-brand-on-primary text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-none flex items-center gap-1.5 animate-pulse">
            <Activity className="w-3 h-3 text-brand-sunset fill-current" />
            <span>Prioridad Crítica / Impostergable</span>
          </span>
          <span className="border border-brand-primary/10 text-brand-primary bg-brand-background text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1">
            {activeEvent.subType}
          </span>
          {canManage && (
            <md-outlined-button type="button" onClick={() => setShowManager(true)} className="ml-auto">
              <Settings2 slot="icon" className="w-3 h-3" />
              Gestionar eventos
            </md-outlined-button>
          )}
        </div>

        {/* Event Header */}
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-brand-sunset/10 border border-brand-sunset/10 shrink-0 mt-1">
            {getEventIcon()}
          </div>
          <div>
            <h3 className="font-serif font-black italic text-brand-primary text-xl md:text-2xl leading-none">
              {activeEvent.title}
            </h3>
            <p className="text-[10px] text-brand-outline font-extrabold uppercase tracking-widest mt-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-sunset" />
              <span>{activeEvent.locationName}</span>
            </p>
          </div>
        </div>

        {/* Description & Action Warnings */}
        <p className="text-xs text-brand-on-surface-variant/90 leading-relaxed font-sans max-w-2xl">
          {activeEvent.description}
        </p>

        {/* Dynamic warning banner */}
        <div className="bg-brand-sunset/5 border-l-4 border-brand-sunset p-3.5 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-brand-sunset shrink-0 mt-0.5" />
          <p className="text-[11px] text-brand-primary font-bold leading-relaxed font-sans">
            {activeEvent.warningMessage}
          </p>
        </div>
      </div>

      {/* Countdown Timer Center Box */}
      <div className="flex flex-col justify-center items-center bg-brand-background border border-brand-primary/5 p-5 min-w-[240px] text-center relative">
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <Clock className="w-3 h-3 text-brand-outline" />
          <span className="text-[8px] font-black uppercase tracking-wider text-brand-outline">Faltan</span>
        </div>

        {/* Large Countdown timer */}
        <div className="font-mono text-3xl font-bold text-brand-primary tracking-tight py-2.5 flex items-center justify-center gap-1">
          <span className="bg-white border border-brand-primary/10 px-2 py-1.5 rounded-none shadow-sm inline-block w-12">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-brand-sunset font-extrabold animate-ping">:</span>
          <span className="bg-white border border-brand-primary/10 px-2 py-1.5 rounded-none shadow-sm inline-block w-12">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-brand-sunset font-extrabold animate-ping">:</span>
          <span className="bg-white border border-brand-primary/10 px-2 py-1.5 rounded-none shadow-sm inline-block w-12 text-brand-sunset">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
        </div>

        {/* Units Sub-labels */}
        <div className="grid grid-cols-3 gap-8 text-[8px] font-extrabold uppercase tracking-widest text-brand-outline w-36 mx-auto mb-3">
          <span>Horas</span>
          <span>Mins</span>
          <span>Segs</span>
        </div>

        {/* Schedule targets */}
        <div className="border-t border-brand-primary/10 pt-3 w-full">
          <span className="text-[8px] font-black uppercase tracking-widest text-brand-outline block">Horario Límite</span>
          <span className="text-[10px] font-extrabold text-brand-primary tracking-wider uppercase mt-1 block">
            {timeLeft.activeTarget}
          </span>
        </div>
      </div>

      {/* Geolocation and manual reference panel */}
      <div className="bg-brand-background border border-brand-primary/5 p-5 min-w-[260px] flex flex-col justify-between">
        
        {/* Dynamic header depending on source */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-brand-primary/5">
            <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${coordsSource === 'gps' ? 'bg-green-600 animate-pulse' : 'bg-brand-sunset animate-ping'}`} />
              <span>Geolocalización Adaptativa</span>
            </span>
            <span className="text-[8px] font-extrabold px-1.5 py-0.5 bg-brand-primary text-brand-on-primary uppercase tracking-widest">
              {coordsSource === 'gps' ? 'GPS REAL' : 'REFERENCIA'}
            </span>
          </div>

          {/* Distance calculation info */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline">
              <span className="text-[9px] text-brand-outline font-bold uppercase tracking-wider">Distancia:</span>
              <span className="text-sm font-extrabold text-brand-primary font-mono">
                {distance.toFixed(1)} km
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-[9px] text-brand-outline font-bold uppercase tracking-wider">Tiempo de manejo:</span>
              <span className="text-xs font-bold text-brand-primary">
                ~{formattedEstTime}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-[9px] text-brand-outline font-bold uppercase tracking-wider">Coordenadas:</span>
              <span className="text-[9px] font-mono font-medium text-brand-primary">
                {effectiveCoords.lat.toFixed(4)}°, {effectiveCoords.lon.toFixed(4)}°
              </span>
            </div>
          </div>
        </div>

        {/* Selector & Actions */}
        <div className="space-y-2.5 mt-4">
          
          {/* Persisted event reference point */}
          <md-outlined-select
            label="Punto de referencia"
            value={`${effectiveCoords.lat},${effectiveCoords.lon}`}
            onChange={(e) => {
              const [lat, lon] = e.currentTarget.value.split(',').map(Number);
              setCurrentCoords({ lat, lon });
              setCoordsSource('manual');
              setGpsError(null);
            }}
            style={{ width: '100%', minWidth: 0 }}
          >
            {presets.map(p => {
              const value = `${p.lat},${p.lon}`;
              return (
                <md-select-option key={p.id} value={value} selected={value === `${effectiveCoords.lat},${effectiveCoords.lon}`}>
                  <div slot="headline">{p.name} ({p.label})</div>
                </md-select-option>
              );
            })}
          </md-outlined-select>

          {/* Real Geolocation trigger Button */}
          <md-outlined-button onClick={handleGetRealGps} disabled={isGpsLoading} style={{ width: '100%' }}>
            {isGpsLoading ? (
              <>
                <RefreshCw slot="icon" className="w-3 h-3 animate-spin" />
                Obteniendo GPS...
              </>
            ) : (
              <>
                <Locate slot="icon" className="w-3 h-3" />
                Usar Mi GPS Real
              </>
            )}
          </md-outlined-button>

          {/* GPS Error fallback log */}
          {gpsError && (
            <p className="text-[8px] text-red-600 font-bold leading-tight uppercase tracking-wider text-center bg-red-50 border border-red-200 p-1">
              {gpsError}
            </p>
          )}

          {/* Tip */}
          <p className="text-[8px] text-brand-outline leading-tight font-medium font-sans">
            La tarjeta detecta qué evento "impostergable" es el más cercano y recalcula al instante tu ruta.
          </p>
        </div>
      </div>
      </md-elevated-card>
      {showManager && (
        <CriticalEventsManager
          events={criticalEvents}
          onSave={upsertCriticalEvent}
          onDelete={deleteCriticalEvent}
          onClose={() => setShowManager(false)}
        />
      )}
    </>
  );
}
