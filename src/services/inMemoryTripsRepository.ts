import type { Trip, Role } from '../types';
import type { Unsubscribe } from './ports';
import type { TripsRepository } from './tripsPort';

type Listener = (trips: Trip[]) => void;

/**
 * In-memory adapter over an array, implementing `TripsRepository`. Temporary
 * stub for PR2 (design's PR2 sequencing) — PR3 swaps in
 * `FirestoreTripsRepository` with zero changes to consumers.
 */
export class InMemoryTripsRepository implements TripsRepository {
  private trips: Trip[] = [];
  private nextId = 1;
  private listeners = new Map<Listener, string>();

  subscribeTrips(uid: string, cb: Listener): Unsubscribe {
    this.listeners.set(cb, uid);
    cb(this.trips.filter(trip => trip.memberUids.includes(uid)));
    return () => this.listeners.delete(cb);
  }

  private notify(): void {
    this.listeners.forEach((uid, cb) => {
      cb(this.trips.filter(trip => trip.memberUids.includes(uid)));
    });
  }

  async createTrip(name: string, ownerUid: string): Promise<void> {
    const trip: Trip = {
      id: `trip-${this.nextId++}`,
      name,
      ownerUid,
      members: { [ownerUid]: 'owner' },
      memberUids: [ownerUid],
    };
    this.trips = [...this.trips, trip];
    this.notify();
  }

  async deleteTrip(tripId: string): Promise<void> {
    this.trips = this.trips.filter(trip => trip.id !== tripId);
    this.notify();
  }

  async inviteMember(tripId: string, email: string, role: Role): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    this.trips = this.trips.map(trip =>
      trip.id === tripId
        ? {
            ...trip,
            pendingMemberships: {
              ...trip.pendingMemberships,
              [normalizedEmail]: { email: normalizedEmail, role, pending: true },
            },
          }
        : trip,
    );
    this.notify();
  }

  async activatePendingInvites(uid: string, email: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    this.trips = this.trips.map(trip => {
      const pending = trip.pendingMemberships?.[normalizedEmail];
      if (!pending || !pending.pending) return trip;

      const { [normalizedEmail]: _activated, ...remainingPending } = trip.pendingMemberships ?? {};
      void _activated;
      return {
        ...trip,
        members: { ...trip.members, [uid]: pending.role },
        memberUids: [...trip.memberUids, uid],
        pendingMemberships: remainingPending,
      };
    });
    this.notify();
  }

  async updateRole(tripId: string, uid: string, role: Role): Promise<void> {
    this.trips = this.trips.map(trip =>
      trip.id === tripId ? { ...trip, members: { ...trip.members, [uid]: role } } : trip,
    );
    this.notify();
  }

  async removeMember(tripId: string, uid: string): Promise<void> {
    this.trips = this.trips.map(trip =>
      trip.id === tripId
        ? {
            ...trip,
            members: Object.fromEntries(Object.entries(trip.members).filter(([memberUid]) => memberUid !== uid)),
            memberUids: trip.memberUids.filter(memberUid => memberUid !== uid),
          }
        : trip,
    );
    this.notify();
  }
}
