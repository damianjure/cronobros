import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';

export type PendingInvitesActivator = (uid: string, email: string) => Promise<void>;

export const activatePendingInvitesCallable: PendingInvitesActivator = async () => {
  const callable = httpsCallable(functions, 'activatePendingInvites');
  await callable();
};
