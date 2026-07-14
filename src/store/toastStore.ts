import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
}

interface ToastStoreState {
  toasts: Toast[];
  showToast: (message: string) => string;
  dismissToast: (id: string) => void;
}

/**
 * In-app replacement for `alert()`/`prompt()` feedback (spec: ux-anti-patterns
 * domain). Deliberately timer-free — auto-dismiss is a UI concern handled by
 * the `Toast` component, keeping this store pure and easy to unit test.
 */
export const useToastStore = create<ToastStoreState>((set) => ({
  toasts: [],
  showToast: (message) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    set(state => ({ toasts: [...state.toasts, { id, message }] }));
    return id;
  },
  dismissToast: (id) => {
    set(state => ({ toasts: state.toasts.filter(toast => toast.id !== id) }));
  },
}));
