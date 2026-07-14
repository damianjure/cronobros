import { useState, useEffect } from 'react';
import {
  Plane,
  Key,
  Car,
  MapPin,
  Clock,
  Activity,
  AlertTriangle,
  Locate,
  RefreshCw
} from 'lucide-react';
import { calculateDistanceInKm } from '../utils/geo';
import { calculateCountdown } from '../utils/date';

// Define the critical events type
interface CriticalEvent {
  id: string;
  type: 'hotel' | 'flight' | 'car';
  title: string;
  subType: string;
  locationName: string;
  coords: { lat: number; lon: number };
  targetTimeStr: string; // e.g. "15:00"
  description: string;
  warningMessage: string;
}

// Fixed critical events in Iceland
const CRITICAL_EVENTS: CriticalEvent[] = [
  {
    id: 'vik-suites',
    type: 'hotel',
    subType: 'Check-in de Alojamiento',
    title: 'Vík Black Beach Suites',
    locationName: 'Costa Sur (Vík)',
    coords: { lat: 63.4186, lon: -19.0060 },
    targetTimeStr: '15:00',
    description: 'Registro de entrada en las suites de playa negra de Vík. Límite estricto de ingreso.',
    warningMessage: '⚠️ Debes llegar antes del cierre de recepción para evitar la autogestión de llaves en la nieve.'
  },
  {
    id: 'akureyri-guesthouse',
    type: 'hotel',
    subType: 'Check-in de Hotel',
    title: 'Akureyri Countryside Guesthouse',
    locationName: 'Norte de Islandia (Akureyri)',
    coords: { lat: 65.6835, lon: -18.0878 },
    targetTimeStr: '16:00',
    description: 'Check-in y asignación de habitaciones cerca de la capital del norte.',
    warningMessage: '⚠️ El camino de acceso de grava requiere Land Rover si hay lluvias intensas por la tarde.'
  },
  {
    id: 'car-flight-kef',
    type: 'flight',
    subType: 'Retorno de Auto y Vuelo FI-205',
    title: 'Devolución SUV & Despegue KEF',
    locationName: 'Aeropuerto Internacional de Keflavík',
    coords: { lat: 63.9850, lon: -22.6056 },
    targetTimeStr: '14:00',
    description: 'Devolver Land Rover Defender lavado y tanque lleno en Hertz KEF. Boarding del vuelo FI-205.',
    warningMessage: '🚨 ¡IMPOSTERGABLE! Penalización de $150 USD por retrasos en la devolución de la SUV.'
  }
];

export default function CriticalEventsCard() {
  // Simulator preset options
  const presets = [
    { name: 'Keflavík / Reikiavik', lat: 64.1265, lon: -21.8174, label: 'Suroeste (Cerca Aeropuerto)' },
    { name: 'Vík í Mýrdal', lat: 63.4186, lon: -19.0060, label: 'Costa Sur' },
    { name: 'Akureyri', lat: 65.6835, lon: -18.0878, label: 'Región Norte' },
    { name: 'Jökulsárlón', lat: 64.0489, lon: -16.1778, label: 'Región Este' }
  ];

  // Coordinates state: default to Reykjavik preset
  const [currentCoords, setCurrentCoords] = useState({ lat: 64.1265, lon: -21.8174 });
  const [coordsSource, setCoordsSource] = useState<'simulated' | 'gps'>('simulated');
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isGpsLoading, setIsGpsLoading] = useState(false);

  // Time-remaining count state
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, activeTarget: '' });

  // 1. Identify which is the closest critical event based on user's current coordinates
  const getClosestEvent = (): { event: CriticalEvent; distance: number } => {
    let closestEvent = CRITICAL_EVENTS[0];
    let minDistance = Infinity;

    CRITICAL_EVENTS.forEach(ev => {
      const dist = calculateDistanceInKm(currentCoords.lat, currentCoords.lon, ev.coords.lat, ev.coords.lon);
      if (dist < minDistance) {
        minDistance = dist;
        closestEvent = ev;
      }
    });

    return { event: closestEvent, distance: minDistance };
  };

  const { event: activeEvent, distance } = getClosestEvent();

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
    const updateCountdown = () => {
      const { hours, minutes, seconds, targetDate } = calculateCountdown(
        activeEvent.targetTimeStr,
        new Date()
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

  // Est. travel time calculation (assuming average 80 km/h speed in Iceland roads)
  const estTravelTimeMin = Math.round((distance / 80) * 60);
  const formattedEstTime = estTravelTimeMin > 60 
    ? `${Math.floor(estTravelTimeMin / 60)}h ${estTravelTimeMin % 60}m`
    : `${estTravelTimeMin} mins`;

  // Get matching icon based on event type
  const getEventIcon = () => {
    switch (activeEvent.type) {
      case 'flight':
        return <Plane className="w-6 h-6 text-brand-sunset stroke-[2.5px]" />;
      case 'car':
        return <Car className="w-6 h-6 text-brand-sunset stroke-[2.5px]" />;
      default:
        return <Key className="w-6 h-6 text-brand-sunset stroke-[2.5px]" />;
    }
  };

  return (
    <div className="bg-white border border-brand-primary/10 rounded-none p-5 md:p-6 shadow-none flex flex-col xl:flex-row gap-6 relative overflow-hidden" id="critical-events-card">
      
      {/* Absolute Decorative Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-brand-sunset" />

      {/* Main Content Info Column */}
      <div className="flex-1 space-y-4">
        
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-brand-primary text-white text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-none flex items-center gap-1.5 animate-pulse">
            <Activity className="w-3 h-3 text-brand-sunset fill-current" />
            <span>Prioridad Crítica / Impostergable</span>
          </span>
          <span className="border border-brand-primary/10 text-brand-primary bg-brand-background text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1">
            {activeEvent.subType}
          </span>
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

      {/* Geolocation & Simulated GPS Panel */}
      <div className="bg-brand-background border border-brand-primary/5 p-5 min-w-[260px] flex flex-col justify-between">
        
        {/* Dynamic header depending on source */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-brand-primary/5">
            <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${coordsSource === 'gps' ? 'bg-green-600 animate-pulse' : 'bg-brand-sunset animate-ping'}`} />
              <span>Geolocalización Adaptativa</span>
            </span>
            <span className="text-[8px] font-extrabold px-1.5 py-0.5 bg-brand-primary text-white uppercase tracking-widest">
              {coordsSource === 'gps' ? 'GPS REAL' : 'SIMULADOR'}
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
                {currentCoords.lat.toFixed(4)}°, {currentCoords.lon.toFixed(4)}°
              </span>
            </div>
          </div>
        </div>

        {/* Selector & Actions */}
        <div className="space-y-2.5 mt-4">
          
          {/* Preset drop-down simulation */}
          <div>
            <label className="block text-[8px] font-black uppercase tracking-widest text-brand-outline mb-1">
              Simular mi posición en Islandia:
            </label>
            <select
              value={`${currentCoords.lat},${currentCoords.lon}`}
              onChange={(e) => {
                const [lat, lon] = e.target.value.split(',').map(Number);
                setCurrentCoords({ lat, lon });
                setCoordsSource('simulated');
                setGpsError(null);
              }}
              className="w-full bg-white border border-brand-primary/10 py-1.5 px-2 text-[10px] font-bold focus:outline-none focus:border-brand-primary/30"
            >
              {presets.map((p, idx) => (
                <option key={idx} value={`${p.lat},${p.lon}`}>
                  {p.name} ({p.label})
                </option>
              ))}
            </select>
          </div>

          {/* Real Geolocation trigger Button */}
          <button
            onClick={handleGetRealGps}
            disabled={isGpsLoading}
            className="w-full border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white disabled:opacity-50 py-1.5 px-2 text-[8px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1"
          >
            {isGpsLoading ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Obteniendo GPS...</span>
              </>
            ) : (
              <>
                <Locate className="w-3 h-3 text-brand-sunset" />
                <span>Usar Mi GPS Real</span>
              </>
            )}
          </button>

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
    </div>
  );
}
