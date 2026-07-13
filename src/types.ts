export type ActiveTab = 'dashboard' | 'itinerary' | 'logistics' | 'map' | 'places';

export interface ItineraryActivity {
  id: string;
  time: string;
  type: 'Relaxation' | 'Dining' | 'Sightseeing' | 'Adventure' | 'Accommodation';
  title: string;
  description: string;
  image?: string;
  status?: string;
  location?: string;
  people?: string[];
}

export interface ItineraryDay {
  id: string;
  dayNumber: number;
  date: string;
  dayOfWeek: string;
  title: string;
  location: string;
  activities: ItineraryActivity[];
}

export interface ChatMessage {
  id: string;
  sender: {
    name: string;
    avatar: string;
    isCurrentUser?: boolean;
    role?: string;
  };
  content: string;
  timestamp: string;
  isImportant?: boolean;
}

export interface UpcomingHighlight {
  id: string;
  day: number;
  type: string;
  title: string;
  description: string;
  image: string;
  status: 'CONFIRMED' | 'PENDING' | 'RESERVED';
}

export interface Driver {
  id: string;
  name: string;
  avatar: string;
  status: 'On Shift' | 'Standby' | 'Off Duty';
  role: string;
  shift: string;
}

export interface Vehicle {
  name: string;
  rentalId: string;
  provider: string;
  phone: string;
  dates: string;
  image: string;
}

export interface PinnedPoint {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  isTopPick?: boolean;
  coords: { x: number; y: number };
}

export interface PendingPlace {
  id: string;
  title: string;
  category: 'Relajación' | 'Gastronomía' | 'Turismo' | 'Aventura' | 'Alojamiento';
  description: string;
  location: string;
  people?: string[];
}
