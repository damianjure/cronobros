import { describe, it, expect, beforeEach, vi } from 'vitest';

const STORAGE_KEY = 'cronobros-settings';

describe('settingsStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('defaults to USD and light theme when nothing is persisted', async () => {
    const { useSettingsStore } = await import('./settingsStore');
    expect(useSettingsStore.getState().currency).toBe('USD');
    expect(useSettingsStore.getState().theme).toBe('light');
  });

  it('restores a previously persisted currency and theme', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ currency: 'EUR', theme: 'dark' }));
    const { useSettingsStore } = await import('./settingsStore');
    expect(useSettingsStore.getState().currency).toBe('EUR');
    expect(useSettingsStore.getState().theme).toBe('dark');
  });

  it('setCurrency updates state and persists to localStorage', async () => {
    const { useSettingsStore } = await import('./settingsStore');
    useSettingsStore.getState().setCurrency('ARS');
    expect(useSettingsStore.getState().currency).toBe('ARS');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}').currency).toBe('ARS');
  });

  it('setTheme updates state, persists, and toggles the document root .dark class', async () => {
    document.documentElement.classList.remove('dark');
    const { useSettingsStore } = await import('./settingsStore');

    useSettingsStore.getState().setTheme('dark');
    expect(useSettingsStore.getState().theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}').theme).toBe('dark');

    useSettingsStore.getState().setTheme('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
