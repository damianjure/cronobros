import { describe, it, expect, vi } from 'vitest';
import type { User } from 'firebase/auth';

const onAuthStateChangedMock = vi.fn();
const signInWithPopupMock = vi.fn();
const signOutMock = vi.fn();

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (...args: unknown[]) => onAuthStateChangedMock(...args),
  signInWithPopup: (...args: unknown[]) => signInWithPopupMock(...args),
  signOut: (...args: unknown[]) => signOutMock(...args),
  GoogleAuthProvider: vi.fn(),
}));

vi.mock('../lib/firebase', () => ({ auth: {} }));

const { useAuthStore } = await import('./authStore');

function fireAuthStateChange(user: User | null) {
  const callback = onAuthStateChangedMock.mock.calls[0][1];
  callback(user);
}

describe('authStore', () => {
  it('starts in loading status with no user', () => {
    expect(useAuthStore.getState().status).toBe('loading');
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('transitions to status "in" with the user when onAuthStateChanged fires with a signed-in user', () => {
    const fakeUser = { uid: 'abc-123', email: 'a@b.com' } as User;

    fireAuthStateChange(fakeUser);

    expect(useAuthStore.getState().status).toBe('in');
    expect(useAuthStore.getState().user).toEqual(fakeUser);
  });

  it('transitions to status "out" with a null user when onAuthStateChanged fires with null', () => {
    fireAuthStateChange(null);

    expect(useAuthStore.getState().status).toBe('out');
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('signIn calls signInWithPopup with the shared auth instance and a GoogleAuthProvider', async () => {
    signInWithPopupMock.mockClear();

    await useAuthStore.getState().signIn();

    expect(signInWithPopupMock).toHaveBeenCalledTimes(1);
    expect(signInWithPopupMock.mock.calls[0][1]).toBeInstanceOf(Object);
  });

  it('signOut calls firebase signOut with the shared auth instance', async () => {
    signOutMock.mockClear();

    await useAuthStore.getState().signOut();

    expect(signOutMock).toHaveBeenCalledTimes(1);
  });

  it('signIn sets an error message instead of throwing when the popup rejects', async () => {
    signInWithPopupMock.mockClear();
    signInWithPopupMock.mockRejectedValueOnce(new Error('auth/popup-blocked'));

    await expect(useAuthStore.getState().signIn()).resolves.toBeUndefined();

    expect(useAuthStore.getState().error).toBe('No pudimos iniciar sesión. Intentá de nuevo.');
  });

  it('signIn clears any previous error on a new attempt', async () => {
    useAuthStore.setState({ error: 'No pudimos iniciar sesión. Intentá de nuevo.' });
    signInWithPopupMock.mockClear();
    signInWithPopupMock.mockResolvedValueOnce(undefined);

    await useAuthStore.getState().signIn();

    expect(useAuthStore.getState().error).toBeNull();
  });
});
