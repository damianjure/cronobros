import type {
  ItineraryDay,
  ItineraryActivity,
  PinnedPoint,
  PendingPlace,
  ChatMessage,
  TripLogistics,
} from '../types';
import { initialItinerary, initialChatMessages, pinnedPoints, initialPendingPlaces } from '../data';
import { mapCategoryToActivityType } from '../utils/category';
import type { TripRepository, Unsubscribe } from './ports';

type Listener<T> = (value: T) => void;

const EMPTY_LOGISTICS: TripLogistics = { drivers: [], vehicle: null };

interface InMemoryTripRepositorySeed {
  itinerary?: ItineraryDay[];
  pins?: PinnedPoint[];
  pendingPlaces?: PendingPlace[];
  chat?: ChatMessage[];
  logistics?: TripLogistics;
}

const APPROVED_PLACE_PIN_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC8kbbAVSGnOTZjuDOJbgKxvomdkFv5dlPjxQlL8K4RSkPMJynCQ4XkYX-8nN_ieyYhjFAimCZlGiwUXYJfrIfR8xfU4_5aR9W6jAP36Qtk_Tvi0IZaTtS6mGiabINpPHyHmdVY6G6smwzHqNZGww_PiqileoStp0VHXbxZzzHkQbhDpOLVxIelUlB_IhB4m6m-nTXBkqaE79Wyy9pcbbcQrfpTJ_iOzrVMtd_4wN1Wrnk1_kd2hXCvD1to7uznxceO9gusiK382DnK';

/**
 * In-memory adapter over `data.ts`, implementing the `TripRepository` port.
 * Every `subscribe*` fires its callback synchronously once with the current
 * snapshot, then again on each mutation — the same contract a Firestore
 * `onSnapshot`-backed adapter will honor in Phase 1.
 *
 * `tripId` is accepted (per the port signature) but unused: this app models
 * exactly one trip today, so there is nothing to partition by. Phase 1's
 * Firestore adapter is expected to use it as the document path.
 */
export class InMemoryTripRepository implements TripRepository {
  private itinerary: ItineraryDay[];
  private pins: PinnedPoint[];
  private pendingPlaces: PendingPlace[];
  private chat: ChatMessage[];
  private logistics: TripLogistics;

  private itineraryListeners = new Set<Listener<ItineraryDay[]>>();
  private pinsListeners = new Set<Listener<PinnedPoint[]>>();
  private pendingPlacesListeners = new Set<Listener<PendingPlace[]>>();
  private chatListeners = new Set<Listener<ChatMessage[]>>();
  private logisticsListeners = new Set<Listener<TripLogistics>>();

  constructor(seed: InMemoryTripRepositorySeed = {}) {
    this.itinerary = seed.itinerary ?? initialItinerary;
    this.pins = seed.pins ?? pinnedPoints;
    this.pendingPlaces = seed.pendingPlaces ?? initialPendingPlaces;
    this.chat = seed.chat ?? initialChatMessages;
    this.logistics = seed.logistics ?? EMPTY_LOGISTICS;
  }

  subscribeItinerary(_tripId: string, cb: Listener<ItineraryDay[]>): Unsubscribe {
    this.itineraryListeners.add(cb);
    cb(this.itinerary);
    return () => this.itineraryListeners.delete(cb);
  }

  subscribePins(_tripId: string, cb: Listener<PinnedPoint[]>): Unsubscribe {
    this.pinsListeners.add(cb);
    cb(this.pins);
    return () => this.pinsListeners.delete(cb);
  }

  subscribePendingPlaces(_tripId: string, cb: Listener<PendingPlace[]>): Unsubscribe {
    this.pendingPlacesListeners.add(cb);
    cb(this.pendingPlaces);
    return () => this.pendingPlacesListeners.delete(cb);
  }

  subscribeChat(_tripId: string, cb: Listener<ChatMessage[]>): Unsubscribe {
    this.chatListeners.add(cb);
    cb(this.chat);
    return () => this.chatListeners.delete(cb);
  }

  subscribeLogistics(_tripId: string, cb: Listener<TripLogistics>): Unsubscribe {
    this.logisticsListeners.add(cb);
    cb(this.logistics);
    return () => this.logisticsListeners.delete(cb);
  }

  async updateLogistics(_tripId: string, logistics: TripLogistics): Promise<void> {
    this.logistics = logistics;
    this.logisticsListeners.forEach(cb => cb(this.logistics));
  }

  private notifyItinerary(): void {
    this.itineraryListeners.forEach(cb => cb(this.itinerary));
  }

  private notifyPins(): void {
    this.pinsListeners.forEach(cb => cb(this.pins));
  }

  private notifyPendingPlaces(): void {
    this.pendingPlacesListeners.forEach(cb => cb(this.pendingPlaces));
  }

  private notifyChat(): void {
    this.chatListeners.forEach(cb => cb(this.chat));
  }

  async addActivity(_tripId: string, dayId: string, activity: ItineraryActivity): Promise<void> {
    this.itinerary = this.itinerary.map(day =>
      day.id === dayId ? { ...day, activities: [...day.activities, activity] } : day,
    );
    this.notifyItinerary();
  }

  async deleteActivity(_tripId: string, dayId: string, activityId: string): Promise<void> {
    this.itinerary = this.itinerary.map(day =>
      day.id === dayId
        ? { ...day, activities: day.activities.filter(activity => activity.id !== activityId) }
        : day,
    );
    this.notifyItinerary();
  }

  async updateActivityPeople(
    _tripId: string,
    dayId: string,
    activityId: string,
    people: string[],
  ): Promise<void> {
    this.itinerary = this.itinerary.map(day =>
      day.id === dayId
        ? {
            ...day,
            activities: day.activities.map(activity =>
              activity.id === activityId ? { ...activity, people } : activity,
            ),
          }
        : day,
    );
    this.notifyItinerary();
  }

  async addDay(_tripId: string, day: ItineraryDay): Promise<void> {
    const updated = [...this.itinerary, day].sort((a, b) => a.date.localeCompare(b.date));
    this.itinerary = updated.map((d, index) => ({ ...d, dayNumber: index + 1 }));
    this.notifyItinerary();
  }

  async addPendingPlace(_tripId: string, place: PendingPlace): Promise<void> {
    this.pendingPlaces = [place, ...this.pendingPlaces];
    this.notifyPendingPlaces();
  }

  async deletePendingPlace(_tripId: string, placeId: string): Promise<void> {
    this.pendingPlaces = this.pendingPlaces.filter(place => place.id !== placeId);
    this.notifyPendingPlaces();
  }

  async approvePlace(_tripId: string, placeId: string, targetDayId: string): Promise<void> {
    const place = this.pendingPlaces.find(p => p.id === placeId);
    if (!place) return;

    const newActivity: ItineraryActivity = {
      id: `act-${Date.now()}`,
      time: '02:00 PM', // Default/estimated time, matches pre-refactor behavior
      type: mapCategoryToActivityType(place.category),
      title: place.title,
      description: place.description,
      location: place.location,
      status: 'Aprobado',
      // PR5: no more global `friends` fixture to fall back to — leaves
      // people empty rather than inventing a default from a fixture that no
      // longer models real trip membership.
      people: place.people && place.people.length > 0 ? place.people : [],
    };

    this.itinerary = this.itinerary.map(day =>
      day.id === targetDayId ? { ...day, activities: [...day.activities, newActivity] } : day,
    );

    const newPin: PinnedPoint = {
      id: `pin-${Date.now()}`,
      title: place.title,
      description: place.description,
      category: place.category,
      image: APPROVED_PLACE_PIN_IMAGE,
      coords: {
        x: 200 + Math.random() * 500,
        y: 200 + Math.random() * 300,
      },
    };
    this.pins = [...this.pins, newPin];

    this.pendingPlaces = this.pendingPlaces.filter(p => p.id !== placeId);

    this.notifyItinerary();
    this.notifyPins();
    this.notifyPendingPlaces();
  }

  async addChatMessage(_tripId: string, message: ChatMessage): Promise<void> {
    this.chat = [...this.chat, message];
    this.notifyChat();
  }
}
