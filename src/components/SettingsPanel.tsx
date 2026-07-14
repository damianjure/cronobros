import { X } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';
import type { Currency } from '../utils/currency';
import type { Theme } from '../store/settingsStore';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: 'USD', label: 'Dólares (USD)' },
  { value: 'EUR', label: 'Euros (EUR)' },
  { value: 'ARS', label: 'Pesos argentinos (ARS)' },
];

const THEMES: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
];

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const currency = useSettingsStore(state => state.currency);
  const setCurrency = useSettingsStore(state => state.setCurrency);
  const theme = useSettingsStore(state => state.theme);
  const setTheme = useSettingsStore(state => state.setTheme);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-brand-primary/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-brand-outline-variant/30 relative">
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 text-brand-outline hover:text-brand-primary w-8 h-8 rounded-full hover:bg-brand-surface-low transition-all flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="font-display font-extrabold text-lg text-brand-primary mb-6">Configuración</h3>

        <fieldset className="mb-6">
          <legend className="text-[10px] font-extrabold text-brand-outline uppercase tracking-wider mb-3">
            Moneda
          </legend>
          <div className="space-y-2">
            {CURRENCIES.map(option => (
              <label
                key={option.value}
                className="flex items-center gap-2 text-sm text-brand-on-surface cursor-pointer"
              >
                <input
                  type="radio"
                  name="currency"
                  value={option.value}
                  checked={currency === option.value}
                  onChange={() => setCurrency(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-[10px] font-extrabold text-brand-outline uppercase tracking-wider mb-3">
            Apariencia
          </legend>
          <div className="space-y-2">
            {THEMES.map(option => (
              <label
                key={option.value}
                className="flex items-center gap-2 text-sm text-brand-on-surface cursor-pointer"
              >
                <input
                  type="radio"
                  name="theme"
                  value={option.value}
                  checked={theme === option.value}
                  onChange={() => setTheme(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  );
}
