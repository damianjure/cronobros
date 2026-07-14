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

export interface Friend {
  id: string;
  name: string;
  avatar: string;
}

// Multi-trip Firestore data model (Phase 1, PR2). `Trip` is the top-level
// document; `members`/`memberUids` are the role map + flattened uid list a
// Firestore security rule can query cheaply (see design's "Firestore Layout"
// and "Security Rules Logic"). `Membership` models a pending-by-email invite
// record — declared now per the PR2 task list, activated on sign-in in PR5.
export type Role = 'owner' | 'editor' | 'viewer';

export interface Membership {
  email: string;
  role: Role;
  pending: boolean;
  uid?: string;
}

// PR5: pending invites keyed by email, stored directly on the trip doc
// (additive field — untouched by `firestore.rules`' `membershipUnchanged()`
// guard, so owner/editor writes to this field don't require the stricter
// owner-only membership path). Activated into `members`/`memberUids` on a
// matching sign-in (spec: "Invite creates a pending membership record,
// activated on first matching sign-in").
export interface Trip {
  id: string;
  name: string;
  ownerUid: string;
  members: Record<string, Role>;
  memberUids: string[];
  pendingMemberships?: Record<string, Membership>;
}

// PR5: per-trip logistics doc (design's LogisticsView migration decision —
// no Firestore collection was scoped for driver/vehicle data, so this is a
// minimal new one, following the same subscribe/mutate seam as the rest of
// `TripRepository`). A brand-new trip has no drivers and no vehicle — this
// must render as a genuinely empty state, not Iceland's fixture data.
export interface TripLogistics {
  drivers: Driver[];
  vehicle: Vehicle | null;
}
