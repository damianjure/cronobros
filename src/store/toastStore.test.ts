import { describe, it, expect } from 'vitest';
import { useToastStore } from './toastStore';

function resetStore() {
  useToastStore.setState({ toasts: [] });
}

describe('toastStore', () => {
  it('starts empty', () => {
    resetStore();
    expect(useToastStore.getState().toasts).toEqual([]);
  });

  it('showToast appends a toast with a unique id and returns that id', () => {
    resetStore();
    const id = useToastStore.getState().showToast('Lugar aprobado');

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0]).toEqual({ id, message: 'Lugar aprobado' });
  });

  it('showToast called twice appends two distinct toasts', () => {
    resetStore();
    const idA = useToastStore.getState().showToast('Uno');
    const idB = useToastStore.getState().showToast('Dos');

    expect(idA).not.toBe(idB);
    expect(useToastStore.getState().toasts.map(t => t.message)).toEqual(['Uno', 'Dos']);
  });

  it('dismissToast removes only the matching toast', () => {
    resetStore();
    const idA = useToastStore.getState().showToast('Uno');
    const idB = useToastStore.getState().showToast('Dos');

    useToastStore.getState().dismissToast(idA);

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].id).toBe(idB);
  });

  it('dismissToast with an unknown id is a no-op', () => {
    resetStore();
    useToastStore.getState().showToast('Uno');

    useToastStore.getState().dismissToast('does-not-exist');

    expect(useToastStore.getState().toasts).toHaveLength(1);
  });
});
