import { create } from 'zustand';
import type { Currency } from '../utils/currency';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'cronobros-settings';

interface PersistedSettings {
  currency: Currency;
  theme: Theme;
}

interface SettingsStoreState extends PersistedSettings {
  setCurrency: (currency: Currency) => void;
  setTheme: (theme: Theme) => void;
}

function loadPersisted(): PersistedSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { currency: 'USD', theme: 'light' };
    const parsed = JSON.parse(raw) as Partial<PersistedSettings>;
    return {
      currency: parsed.currency ?? 'USD',
      theme: parsed.theme ?? 'light',
    };
  } catch {
    return { currency: 'USD', theme: 'light' };
  }
}

function persist(settings: PersistedSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function applyThemeClass(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

const initial = loadPersisted();
applyThemeClass(initial.theme);

/**
 * Local device preferences (currency display + light/dark theme) — not
 * per-trip data, so no Firestore round-trip; persisted to localStorage only.
 */
export const useSettingsStore = create<SettingsStoreState>((set, get) => ({
  currency: initial.currency,
  theme: initial.theme,
  setCurrency: (currency) => {
    set({ currency });
    persist({ currency, theme: get().theme });
  },
  setTheme: (theme) => {
    set({ theme });
    applyThemeClass(theme);
    persist({ currency: get().currency, theme });
  },
}));
