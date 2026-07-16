import { Search, X } from 'lucide-react';
import type { ActiveTab } from '../types';
import { useTripStore } from '../store/tripStore';
import { searchTripData } from '../utils/tripSearch';

interface TripSearchResultsProps {
  query: string;
  onClose: () => void;
  onNavigate: (tab: ActiveTab) => void;
}

export default function TripSearchResults({ query, onClose, onNavigate }: TripSearchResultsProps) {
  const itinerary = useTripStore(state => state.itinerary);
  const pins = useTripStore(state => state.pins);
  const criticalEvents = useTripStore(state => state.criticalEvents);
  if (query.trim().length < 2) return null;
  const results = searchTripData(query, itinerary, pins, criticalEvents);

  return (
    <div className="fixed right-6 top-16 z-50 w-[min(24rem,calc(100vw-3rem))] border border-brand-primary/10 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-brand-primary/10 px-4 py-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Resultados del viaje</span>
        <button type="button" onClick={onClose} aria-label="Cerrar búsqueda"><X className="h-4 w-4" /></button>
      </div>
      {results.length === 0 ? (
        <div className="p-6 text-center text-xs text-brand-outline">No encontramos coincidencias.</div>
      ) : results.map(result => (
        <button key={result.id} type="button" onClick={() => { onNavigate(result.tab); onClose(); }} className="flex w-full items-start gap-3 border-b border-brand-primary/5 px-4 py-3 text-left hover:bg-brand-primary/5">
          <Search className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-primary/50" />
          <span><strong className="block text-xs text-brand-primary">{result.title}</strong><span className="text-[10px] text-brand-outline">{result.detail}</span></span>
        </button>
      ))}
    </div>
  );
}
